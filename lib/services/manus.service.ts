import { db } from "@/lib/db";

export interface ManusTaskResult {
  ok: boolean;
  taskId?: string;
  status?: string;
  title?: string;
  error?: string;
}

export interface ManusMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export class ManusService {
  private static getApiKey(): string {
    return process.env.MANUS_API_KEY || "";
  }

  private static getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-manus-api-key": this.getApiKey(),
    };
  }

  /**
   * Triggers an autonomous multi-step agent task on the Manus network.
   */
  static async createTask(prompt: string, agentProfile = "manus-1.6"): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn("⚠️ [MANUS_API_KEY] is not defined in environment variables. Running in Mock Mode.");
      return this.generateMockTask(prompt);
    }

    try {
      const response = await fetch("https://api.manus.ai/v2/task.create", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          message: {
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
          agent_profile: agentProfile,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Manus API error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[MANUS_CREATE_TASK_ERROR]", error);
      throw error;
    }
  }

  /**
   * Retrieves status and basic metadata for a Manus task.
   */
  static async getTaskDetail(taskId: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey || taskId.startsWith("mock-")) {
      return this.getMockTaskDetail(taskId);
    }

    try {
      const response = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, {
        method: "GET",
        headers: {
          "x-manus-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Manus task details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[MANUS_TASK_DETAIL_ERROR]", error);
      throw error;
    }
  }

  /**
   * Retrieves full conversation logs, files, and outputs returned by the autonomous agent.
   */
  static async getTaskMessages(taskId: string): Promise<ManusMessage[]> {
    const apiKey = this.getApiKey();
    if (!apiKey || taskId.startsWith("mock-")) {
      return this.getMockTaskMessages(taskId);
    }

    try {
      const response = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}&order=asc&limit=20`, {
        method: "GET",
        headers: {
          "x-manus-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Manus task messages: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map API messages structure to simplified standard ManusMessage format
      if (data.ok && Array.isArray(data.messages)) {
        return data.messages.map((msg: any) => {
          let text = "";
          if (Array.isArray(msg.content)) {
            text = msg.content.map((c: any) => c.text || "").join("\n");
          } else if (typeof msg.content === "string") {
            text = msg.content;
          }
          return {
            role: msg.role === "assistant" ? "assistant" : "user",
            content: text,
            createdAt: msg.createdAt,
          };
        });
      }

      return [];
    } catch (error) {
      console.error("[MANUS_TASK_MESSAGES_ERROR]", error);
      throw error;
    }
  }

  /**
   * Autonomous Company Research pipeline.
   * Dispatches Manus to crawl the live web, find corporate culture, recent products, and mock Q&As.
   */
  static async runCompanyResearch(userId: string, companyName: string, roleTitle: string): Promise<any> {
    const prompt = `Autonomous Agent Target Assignment:
Conduct deep, comprehensive market and technical research on "${companyName}" for the target role of "${roleTitle}".

Your task:
1. Browse the web to find recent corporate announcements, news, product launches, or press releases from "${companyName}" over the past year.
2. Crawl Glassdoor, engineering blogs, or forums to identify the prevailing tech stack, developer environment, and cultural values of their tech/business teams.
3. Formulate 5 hyper-targeted, highly precise mock interview questions (technical and behavioral) based on actual interview archives or technical challenges unique to "${companyName}"'s products.
4. Provide strategic tips on how a candidate can structure their answers (e.g. using the STAR method for behavioral, or cloud-scale architectures for system design) to impress their hiring managers.
5. Create a complete, beautifully structured markdown dossier summarizing your findings under clean heading sections.

Act as a Virtual Colleague. Compile and deliver a perfect corporate briefing dossier.`;

    const taskResult = await this.createTask(prompt, "manus-1.6");
    
    if (taskResult.ok && taskResult.task?.id) {
      const taskId = taskResult.task.id;
      
      // Store reference in the local DB so the user can see their research tasks
      await db.query(
        `INSERT INTO "ActivityLog" (id, "userId", action, entity, "entityId", metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          globalThis.crypto?.randomUUID() || Math.random().toString(36).substring(2),
          userId,
          "manus.research_started",
          "manus_task",
          taskId,
          JSON.stringify({ companyName, roleTitle, status: "running" }),
        ]
      );
      
      return { ok: true, taskId, status: "running", companyName, roleTitle };
    }
    
    return { ok: false, error: "Failed to dispatch autonomous agent" };
  }

  // ============================================================
  // MOCK SYSTEM FOR LOCAL SANDBOX DEMOS (WHEN API KEY IS ABSENT)
  // ============================================================

  private static generateMockTask(prompt: string): any {
    const id = "mock-" + Math.random().toString(36).substring(2, 10);
    return {
      ok: true,
      task: {
        id,
        status: "running",
        title: "Autonomous Corporate Research Campaign",
      },
    };
  }

  private static getMockTaskDetail(taskId: string): any {
    return {
      ok: true,
      task: {
        id: taskId,
        status: "stopped", // Finished working
        title: "Autonomous Corporate Research Campaign",
      },
    };
  }

  private static getMockTaskMessages(taskId: string): ManusMessage[] {
    return [
      {
        role: "user",
        content: `Autonomous Agent Target Assignment:
Conduct deep, comprehensive market and technical research on Stripe for the target role of Senior Frontend Screen.`,
      },
      {
        role: "assistant",
        content: `### 🏢 STRIPE CORPORATE DOSSIER — SENIOR FRONTEND SCREEN

Hello! As your virtual colleague, I have autonomously crawled the live web, tech forums, and Glassdoor to build a highly precise dossier for your upcoming Stripe screen.

---

### 1. 🚀 Recent Corporate Highlights & Focus (2025-2026)
* **Embedded Finance Expansion**: Stripe has heavily prioritized "Stripe Billing" and automatic tax reconciliation toolsets for SaaS ecosystems, shifting heavily towards modular low-code embedded checkout widgets.
* **Core Tech Stack Focus**: Migrating massive portions of internal interfaces to next-generation frameworks with strict CSS container queries and custom web components to guarantee ultra-fast latency standards globally.
* **AI Checkout integrations**: Recently debuted AI-driven fraud scoring overlays at checkout, which adapt payment flows dynamically based on real-time transaction trust scores.

---

### 2. 🛠️ Tech Stack & Architecture Profile
* **Core UI**: React, TypeScript, styled-components, and modular Next.js layouts.
* **Build Systems**: Webpack/Turbopack, ESBuild, and unified mono-repos.
* **Core Practices**: Exceptional test coverage (Jest, Playwright) and bulletproof component layout accessibility (WAI-ARIA, WCAG 2.1 compliance). 
* **Engineering Values**: Stripe values pristine, self-documenting code. They are highly sensitive to layout shifts (CLS), First Input Delay (FID), and optimized edge-caching patterns.

---

### 3. 🎯 5 Custom Mock Interview Questions
1. **[Coding]** Stripe payment forms require instant credit-card input validation while avoiding annoying screen jitter. Write a decoupled React custom hook \`usePaymentValidation\` that safely handles async zip-code checkups without blocking the input stream thread.
2. **[System Design]** Design an embeddable, themeable checkout modal that loads in under 200ms on 3G connections. How would you structure asset compilation, code-splitting, and CSS injection?
3. **[Behavioral]** Tell me about a time you had to balance an engineering push for visual perfection (e.g. customized micro-animations) against strict payload size constraints. What metrics did you track?
4. **[Technical]** Stripe values API backward compatibility. If you are updating a legacy checkout widget to support a new multi-currency payment method, how would you design the component API to prevent breaking thousands of merchant sites?
5. **[Behavioral]** How do you coordinate frontend code architectural standards across multiple distributed teams working in a single colossal monorepo?

---

### 4. 💡 Strategic Preparation Roadmap
* **Pristine API Design**: In coding interviews, Stripe graders look closely at variable names, input safety checks, and intuitive component properties (props).
* **Quantify Performance**: Always mention metrics (e.g., bundle size reductions, edge latency drops, LCP improvements).
* **Accessibility**: Proactively mention accessibility ARIA tags and semantic HTML before the interviewer asks!`,
      },
    ];
  }
}
