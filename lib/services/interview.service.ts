import { db } from "@/lib/db";
import { generateJSON, generateText } from "@/lib/ai";

export interface SessionData {
  type?: string;
  role?: string | null;
  company?: string | null;
  applicationId?: string | null;
}

export interface QuestionItem {
  question: string;
  category: string;
  difficulty: string;
}

export interface AnswerData {
  questionId: string;
  answer: string;
  timeSpent?: number | null;
}

export interface FeedbackResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export class InterviewService {
  /**
   * Retrieves a single interview session with its questions.
   */
  static async getSessionById(userId: string, sessionId: string): Promise<any> {
    const sessionRes = await db.query(
      `SELECT * FROM "InterviewSession" WHERE id = $1 AND "userId" = $2 LIMIT 1`,
      [sessionId, userId]
    );
    const session = sessionRes.rows[0];
    if (!session) return null;

    const questionsRes = await db.query(
      `SELECT * FROM "InterviewQA" WHERE "sessionId" = $1 ORDER BY "createdAt" ASC`,
      [sessionId]
    );
    
    return {
      ...session,
      questions: questionsRes.rows,
    };
  }

  /**
   * Updates an interview session.
   */
  static async updateSession(userId: string, sessionId: string, data: any): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    
    for (const [key, value] of Object.entries(data)) {
      if (["id", "userId", "createdAt", "updatedAt"].includes(key)) continue;
      fields.push(`"${key}" = $${idx++}`);
      values.push(value);
    }
    
    if (fields.length === 0) {
      return this.getSessionById(userId, sessionId);
    }
    
    values.push(sessionId);
    values.push(userId);
    
    const query = `
      UPDATE "InterviewSession"
      SET ${fields.join(", ")}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${idx} AND "userId" = $${idx + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    if (!result || result.rowCount === 0) return null;
    
    return this.getSessionById(userId, sessionId);
  }

  /**
   * Retrieves all interview sessions for a user.
   */
  static async getSessions(userId: string): Promise<any[]> {
    const queryText = `
      SELECT s.*, COUNT(q.id)::int as "questionCount"
      FROM "InterviewSession" s
      LEFT JOIN "InterviewQA" q ON s.id = q."sessionId"
      WHERE s."userId" = $1
      GROUP BY s.id
      ORDER BY s."createdAt" DESC
    `;
    const result = await db.query(queryText, [userId]);
    
    return result.rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      applicationId: row.applicationId,
      type: row.type,
      role: row.role,
      company: row.company,
      status: row.status,
      duration: row.duration,
      overallScore: row.overallScore,
      feedback: row.feedback,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: {
        questions: row.questionCount,
      },
    }));
  }

  /**
   * Creates a new interview session.
   */
  static async createSession(userId: string, data: SessionData): Promise<any> {
    const { type, role, company, applicationId } = data;

    return db.transaction(async (client) => {
      const sessionId = globalThis.crypto.randomUUID();
      const sessionRes = await client.query(
        `INSERT INTO "InterviewSession" (id, "userId", type, role, company, "applicationId")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          sessionId,
          userId,
          type ?? "BEHAVIORAL",
          role || null,
          company || null,
          applicationId || null,
        ]
      );

      const logId = globalThis.crypto.randomUUID();
      await client.query(
        `INSERT INTO "ActivityLog" (id, "userId", action, entity, "entityId")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          logId,
          userId,
          "interview.session_started",
          "interview",
          sessionId,
        ]
      );

      return sessionRes.rows[0];
    });
  }

  /**
   * Generates custom interview questions based on session type and profile, and stores them.
   */
  static async generateQuestions(userId: string, sessionId: string, count = 5): Promise<any[]> {
    const sessionResult = await db.query(
      'SELECT * FROM "InterviewSession" WHERE id = $1 AND "userId" = $2 LIMIT 1',
      [sessionId, userId]
    );
    const interviewSession = sessionResult.rows[0];

    if (!interviewSession) {
      throw new Error("Session not found");
    }

    const profileResult = await db.query(
      'SELECT * FROM "Profile" WHERE "userId" = $1 LIMIT 1',
      [userId]
    );
    const profile = profileResult.rows[0];

    const role = interviewSession.role ?? profile?.targetRole ?? "Software Engineer";
    const company = interviewSession.company ?? null;
    const skills = (profile?.skills ?? []).slice(0, 8).join(", ");
    const typeMap: Record<string, string> = {
      TECHNICAL: "data structures, algorithms, system design, API design, scalability, debugging, and code quality",
      BEHAVIORAL: "STAR-format situations covering leadership, conflict resolution, ownership, failure recovery, and cross-functional collaboration",
      MIXED: "balanced mix of technical depth (system design, problem-solving) and behavioral competencies (leadership, culture fit)",
    };
    const focus = typeMap[interviewSession.type as string] ?? typeMap.MIXED;

    const prompt = `You are a senior engineering manager${company ? ` at ${company}` : ""} conducting a real ${interviewSession.type?.toLowerCase() ?? "mixed"} interview for a ${role} candidate.

Candidate profile:
- Target role: ${role}${company ? `\n- Company: ${company}` : ""}
- Key skills: ${skills || "not specified"}
- Experience level: inferred from role title

Generate exactly ${count} interview questions that:
1. Progress from warm-up (easy) to challenging (hard)
2. Are realistic — questions actually asked at top tech companies in 2024–2025
3. Focus on: ${focus}
4. Cover different sub-categories (no two questions test the same thing)
5. For TECHNICAL: include at least one system design question and one debugging/trade-off scenario
6. For BEHAVIORAL: use real competency themes (ownership, bias for action, customer obsession, etc.)

Return a JSON array ONLY — no markdown, no explanation:
[
  {
    "question": "Exact question text as asked by an interviewer",
    "category": "System Design | Behavioral | Coding | Culture | Problem Solving | Leadership",
    "difficulty": "easy | medium | hard"
  }
]`;

    const questions = await generateJSON<QuestionItem[]>(
      prompt,
      "You are a principal-level interviewer at a top-tier technology company. Generate precise, realistic, and challenging interview questions that genuinely test candidates' depth of knowledge and experience. Never generate generic or surface-level questions.",
      "gemini-2.5-pro"
    );

    await db.transaction(async (client) => {
      for (const q of questions) {
        const qaId = globalThis.crypto.randomUUID();
        await client.query(
          `INSERT INTO "InterviewQA" (id, "sessionId", question, category)
           VALUES ($1, $2, $3, $4)`,
          [qaId, sessionId, q.question, q.category]
        );
      }
    });

    const allQuestionsResult = await db.query(
      'SELECT * FROM "InterviewQA" WHERE "sessionId" = $1 ORDER BY "createdAt" ASC',
      [sessionId]
    );
    
    return allQuestionsResult.rows;
  }

  /**
   * Submits an answer to a question, runs AI feedback/scoring, and updates the overall session score.
   */
  static async submitAnswer(userId: string, data: AnswerData): Promise<any> {
    const { questionId, answer, timeSpent } = data;

    const qaResult = await db.query(
      `SELECT q.*, s."userId" as "sessionUserId"
       FROM "InterviewQA" q
       JOIN "InterviewSession" s ON q."sessionId" = s.id
       WHERE q.id = $1 LIMIT 1`,
      [questionId]
    );
    const qa = qaResult.rows[0];

    if (!qa || qa.sessionUserId !== userId) {
      throw new Error("Interview question not found");
    }

    const isBehavioral = (qa.category ?? "").toLowerCase().includes("behavioral") ||
      (qa.category ?? "").toLowerCase().includes("leadership");
    const isTechnical = (qa.category ?? "").toLowerCase().includes("system") ||
      (qa.category ?? "").toLowerCase().includes("coding") ||
      (qa.category ?? "").toLowerCase().includes("technical");

    const prompt = `You are evaluating a real candidate interview answer. Score and provide structured feedback.

QUESTION: ${qa.question}
CATEGORY: ${qa.category ?? "General"}
CANDIDATE'S ANSWER: ${answer}

Evaluation criteria:
${isBehavioral ? `- STAR format adherence (Situation, Task, Action, Result with measurable outcome)
- Specificity: concrete examples vs vague generalities
- Leadership and ownership signals
- Communication clarity and storytelling quality
- Quantified impact (numbers, percentages, scale)` : ""}
${isTechnical ? `- Technical accuracy and correctness
- Depth of understanding (surface vs expert-level)
- Trade-off awareness (scalability, performance, reliability)
- Problem-solving approach and thought process
- Mention of relevant technologies, patterns, or principles` : ""}
${!isBehavioral && !isTechnical ? `- Relevance to the question asked
- Depth and specificity of response
- Communication clarity
- Professional maturity` : ""}

Scoring rubric:
- 90-100: Exceptional — would impress at Google/Meta/Amazon
- 75-89: Strong — would pass most screens
- 60-74: Adequate — needs improvement in key areas
- 40-59: Weak — significant gaps
- 0-39: Poor — does not demonstrate required competency

Return ONLY valid JSON, no markdown:
{
  "score": <integer 0-100>,
  "feedback": "2-3 sentences of specific, actionable feedback referencing the actual answer",
  "strengths": ["specific thing done well with example from their answer"],
  "improvements": ["specific actionable improvement with how to do it better"]
}`;

    const result = await generateJSON<FeedbackResult>(
      prompt,
      "You are a senior hiring manager at a top-tier technology company evaluating a real candidate. Your feedback is specific, honest, and professionally calibrated — you reference what the candidate actually said and explain exactly what would make their answer stronger. You never give generic praise.",
      "gemini-2.5-pro"
    );

    const updatedQA = await db.transaction(async (client) => {
      const updateRes = await client.query(
        `UPDATE "InterviewQA"
         SET answer = $1, feedback = $2, score = $3, "timeSpent" = $4
         WHERE id = $5
         RETURNING *`,
        [answer, result.feedback, result.score, timeSpent || null, questionId]
      );

      const allQAsRes = await client.query(
        `SELECT score FROM "InterviewQA"
         WHERE "sessionId" = $1 AND score IS NOT NULL`,
        [qa.sessionId]
      );

      const allQAs = allQAsRes.rows;
      if (allQAs.length > 0) {
        const avgScore = Math.round(allQAs.reduce((sum: number, q: any) => sum + (q.score ?? 0), 0) / allQAs.length);
        await client.query(
          `UPDATE "InterviewSession"
           SET "overallScore" = $1, "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [avgScore, qa.sessionId]
        );
      }

      return updateRes.rows[0];
    });

    return {
      ...updatedQA,
      strengths: result.strengths,
      improvements: result.improvements
    };
  }

  /**
   * Generates overall feedback for the completed interview session.
   */
  static async generateFeedback(userId: string, sessionId: string): Promise<any> {
    const sessionResult = await db.query(
      'SELECT * FROM "InterviewSession" WHERE id = $1 AND "userId" = $2 LIMIT 1',
      [sessionId, userId]
    );
    const interviewSession = sessionResult.rows[0];

    if (!interviewSession) {
      throw new Error("Session not found");
    }

    const questionsResult = await db.query(
      'SELECT * FROM "InterviewQA" WHERE "sessionId" = $1',
      [sessionId]
    );
    const questions = questionsResult.rows;

    const answeredQAs = questions.filter(q => q.answer && q.score !== null);

    if (answeredQAs.length === 0) {
      throw new Error("No answered questions found");
    }

    const qaText = answeredQAs
      .map(q => `Q: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/100`)
      .join("\n\n");

    const avgScore = Math.round(answeredQAs.reduce((sum, q) => sum + (q.score ?? 0), 0) / answeredQAs.length);

    const feedback = await generateText(
      `You are delivering a comprehensive post-interview debrief to a candidate who just completed a mock interview session.

SESSION SUMMARY:
- Overall score: ${avgScore}/100
- Questions answered: ${answeredQAs.length}
- Session transcript:
${qaText}

Write a professional debrief in 4 paragraphs:

1. **Overall Performance** (2-3 sentences): Calibrated assessment of the ${avgScore}/100 score. Be direct — explain what this score means in terms of real interview outcomes (pass/fail at different company tiers).

2. **Top 2-3 Strengths** (with specific examples from their actual answers): Quote specific things they said that demonstrated competency. Name the exact questions.

3. **Critical Improvement Areas** (with root cause analysis): Identify the 2-3 most important gaps. Explain WHY each gap matters and HOW it would hurt them in a real interview at a top company.

4. **30-Day Action Plan**: Give 3-5 specific, actionable steps (not generic advice). Include resources, practice techniques, or frameworks relevant to their specific weak areas.

Tone: Direct, professional, coach-like. Do not sugarcoat. Treat them like a serious candidate who deserves honest feedback.`,
      "You are a principal-level engineering interviewer and career coach who has conducted 500+ interviews at FAANG companies. Your feedback is precise, honest, and genuinely useful — you tell candidates exactly what they need to do differently to pass real interviews.",
      "gemini-2.5-pro"
    );

    await db.query(
      `UPDATE "InterviewSession"
       SET feedback = $1, "overallScore" = $2, status = 'COMPLETED', "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [feedback, avgScore, sessionId]
    );

    return { feedback, overallScore: avgScore };
  }
}
