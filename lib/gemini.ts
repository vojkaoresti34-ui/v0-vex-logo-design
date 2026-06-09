import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { db } from "./db";
import { auth } from "./auth";
import crypto from "crypto";

export const genAI = new Proxy({} as any, {
  get(target, prop) {
    if (prop in target) return target[prop];
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!key) return null;
    const client = new GoogleGenerativeAI(key);
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
  set(target, prop, value) { target[prop] = value; return true; }
});

export const groq = new Proxy({} as any, {
  get(target, prop) {
    if (prop in target) return target[prop];
    const key = process.env.GROQ_API_KEY || "";
    if (!key) return null;
    const client = new Groq({ apiKey: key });
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
  set(target, prop, value) { target[prop] = value; return true; }
});

async function logAiUsage(
  userId: string | null,
  action: string,
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  status: "success" | "failed",
  errorMessage?: string
) {
  try {
    const id = crypto.randomUUID();
    const totalTokens = promptTokens + completionTokens;
    // Only store sanitised error message, never raw prompt content (PII risk)
    const safeError = errorMessage
      ? errorMessage.slice(0, 200).replace(/[^\w\s.,:|_\-]/g, "")
      : null;
    await db.query(
      `INSERT INTO "AiTokenLog" (id, "userId", action, provider, model, "promptTokens", "completionTokens", "totalTokens", status, "errorMessage")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, userId || null, action, provider, model, promptTokens, completionTokens, totalTokens, status, safeError]
    );
  } catch (err) {
    console.error("[AI_USAGE_LOG_ERROR]", err);
  }
}

async function getActiveUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function inferAction(prompt: string, systemPrompt?: string): string {
  const combined = `${prompt} ${systemPrompt || ""}`.toLowerCase();
  if (combined.includes("ats") || combined.includes("grade") || combined.includes("evaluate")) return "ats.analyze";
  if (combined.includes("interview") || combined.includes("qa") || combined.includes("question")) return "interview.coaching";
  if (combined.includes("translate") || combined.includes("country")) return "resume.translation";
  if (combined.includes("email") || combined.includes("outreach") || combined.includes("subject")) return "recruiter.outreach";
  if (combined.includes("cover letter") || combined.includes("hiring manager")) return "cover_letter.generation";
  return "ai.generation";
}

async function runWithRetry<T>(
  actionName: string,
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 20000)
        ),
      ]);
    } catch (error: any) {
      attempt++;
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota");
      const isTimeout = error?.message === "Timeout";
      const isTransient = error?.status >= 500 || error?.message?.includes("500") || error?.message?.includes("503");

      console.warn(`[AI] ${actionName} failed attempt ${attempt}/${retries}: ${error?.message}`);

      if (attempt >= retries) throw error;

      if (isRateLimit || isTimeout || isTransient) {
        const backoff = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Execution failed");
}

// Required params must precede optional ones — systemPrompt uses `string | undefined`
async function runWithResilience(
  prompt: string,
  systemPrompt: string | undefined,
  model: string,
  executeGemini: (selectedModel: string) => Promise<{ text: string; usage?: any }>,
  executeGroq: (groqModel: string) => Promise<{ text: string; usage?: any }>
): Promise<string> {
  const userId = await getActiveUserId();
  const inferred = inferAction(prompt, systemPrompt);
  const promptTokensEst = Math.ceil((prompt.length + (systemPrompt?.length || 0)) / 4);
  const groqApiKey = process.env.GROQ_API_KEY || "";

  try {
    const result = await runWithRetry(inferred, () => executeGemini(model));
    const usage = result.usage;
    await logAiUsage(
      userId, inferred, "gemini", model,
      usage?.promptTokenCount || promptTokensEst,
      usage?.candidatesTokenCount || Math.ceil(result.text.length / 4),
      "success"
    );
    return result.text;
  } catch (geminiError: any) {
    console.error(`[AI] Primary Gemini ${model} failed:`, geminiError.message);

    if (model === "gemini-2.5-pro") {
      try {
        const result = await runWithRetry(inferred, () => executeGemini("gemini-2.5-flash"));
        const usage = result.usage;
        await logAiUsage(
          userId, inferred, "gemini", "gemini-2.5-flash",
          usage?.promptTokenCount || promptTokensEst,
          usage?.candidatesTokenCount || Math.ceil(result.text.length / 4),
          "success"
        );
        return result.text;
      } catch (fallbackErr: any) {
        console.error("[AI] Gemini fallback failed:", fallbackErr.message);
      }
    }

    if (groqApiKey) {
      try {
        const groqModel = "llama-3.3-70b-versatile";
        const result = await runWithRetry(inferred, () => executeGroq(groqModel));
        const usage = result.usage;
        await logAiUsage(
          userId, inferred, "groq", groqModel,
          usage?.prompt_tokens || promptTokensEst,
          usage?.completion_tokens || Math.ceil(result.text.length / 4),
          "success"
        );
        return result.text;
      } catch (groqError: any) {
        console.error("[AI] Groq fallback failed:", groqError.message);
        await logAiUsage(userId, inferred, "gemini", model, promptTokensEst, 0, "failed", `All providers failed`);
        throw new Error(`AI service unavailable: ${geminiError.message}`);
      }
    }

    await logAiUsage(userId, inferred, "gemini", model, promptTokensEst, 0, "failed", `Gemini failed`);
    throw new Error(`AI service unavailable: ${geminiError.message}`);
  }
}

export async function generateText(
  prompt: string,
  systemPrompt?: string,
  model = "gemini-2.5-flash"
): Promise<string> {
  const executeGemini = async (selectedModel: string) => {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!key) throw new Error("GEMINI_API_KEY not configured");
    const generativeModel = genAI.getGenerativeModel({ model: selectedModel, systemInstruction: systemPrompt });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return { text: response.text(), usage: response.usageMetadata };
  };

  const executeGroq = async (selectedModel: string) => {
    const key = process.env.GROQ_API_KEY || "";
    if (!key) throw new Error("GROQ_API_KEY not configured");
    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
        { role: "user" as const, content: prompt },
      ],
    });
    return { text: response.choices[0]?.message?.content || "", usage: response.usage };
  };

  return runWithResilience(prompt, systemPrompt, model, executeGemini, executeGroq);
}

export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string,
  model = "gemini-2.5-flash"
): Promise<T> {
  const executeGemini = async (selectedModel: string) => {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!key) throw new Error("GEMINI_API_KEY not configured");
    const generativeModel = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return { text: response.text(), usage: response.usageMetadata };
  };

  const executeGroq = async (selectedModel: string) => {
    const key = process.env.GROQ_API_KEY || "";
    if (!key) throw new Error("GROQ_API_KEY not configured");
    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
        { role: "user" as const, content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    return { text: response.choices[0]?.message?.content || "", usage: response.usage };
  };

  const jsonText = await runWithResilience(prompt, systemPrompt, model, executeGemini, executeGroq);
  try {
    return JSON.parse(jsonText) as T;
  } catch (err: any) {
    throw new Error(`AI generated invalid JSON: ${err.message}`);
  }
}

export async function generateJSONFromPDF<T>(
  pdfBuffer: Buffer,
  prompt: string,
  systemPrompt?: string,
  model = "gemini-2.5-flash"
): Promise<T> {
  const userId = await getActiveUserId();
  const inferred = "resume.parsing";
  const promptTokensEst = Math.ceil(prompt.length / 4) + 8000;

  const executeGemini = async (selectedModel: string) => {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!key) throw new Error("GEMINI_API_KEY not configured");
    const generativeModel = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await generativeModel.generateContent([
      { inlineData: { data: pdfBuffer.toString("base64"), mimeType: "application/pdf" } },
      prompt,
    ]);
    const response = await result.response;
    return { text: response.text(), usage: response.usageMetadata };
  };

  try {
    const result = await runWithRetry(inferred, () => executeGemini(model));
    const usage = result.usage;
    await logAiUsage(
      userId, inferred, "gemini", model,
      usage?.promptTokenCount || promptTokensEst,
      usage?.candidatesTokenCount || Math.ceil(result.text.length / 4),
      "success"
    );
    return JSON.parse(result.text) as T;
  } catch (err: any) {
    console.error("[AI] PDF parsing failed:", err.message);
    await logAiUsage(userId, inferred, "gemini", model, promptTokensEst, 0, "failed", `PDF parse failed`);
    throw err;
  }
}
