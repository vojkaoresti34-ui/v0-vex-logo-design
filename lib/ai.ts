// Re-route AI entrypoint proxy from Groq to Google Gemini
import Groq from "groq-sdk";
import { generateText as geminiGenerateText, generateJSON as geminiGenerateJSON } from "./gemini";

// Maintain a dummy or real Groq client just to prevent compiler issues in case it is imported elsewhere
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "dummy_key",
});

/**
 * Proxies generateText content directly to Google Gemini
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  model?: string
): Promise<string> {
  return geminiGenerateText(prompt, systemPrompt, model);
}

/**
 * Proxies generateJSON content directly to Google Gemini
 */
export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string,
  model?: string
): Promise<T> {
  return geminiGenerateJSON<T>(prompt, systemPrompt, model);
}
