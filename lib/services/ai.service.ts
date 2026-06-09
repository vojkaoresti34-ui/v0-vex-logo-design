import { prisma } from "@/lib/db";
import { generateText, generateJSON } from "@/lib/ai";
import { CareerDataService } from "./career-data.service";

export interface Suggestion {
  type: string;
  title: string;
  description: string;
  action: string;
  href: string;
  priority: number;
}

export interface ATSAnalysisResult {
  score: number;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: string[];
  sections: Record<string, any>;
}

export interface InterviewQAResult {
  question: string;
  category: string;
  expectedKeywords?: string[];
}

export class AiService {
  /**
   * Generates a conversational response from Vex AI, using user profile information.
   */
  static async generateChatResponse(
    userId: string,
    message: string,
    context?: string
  ): Promise<string> {
    const [profile, user] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const systemPrompt = `You are Vex AI — a world-class career strategist, resume expert, and job search coach built into the Vex platform. You have deep expertise in resume optimization, ATS systems, interview preparation, salary negotiation, networking, and career transitions.

## User Profile
- **Name**: ${user?.name ?? "User"}
- **Current role**: ${profile?.currentRole ?? "Not specified"}
- **Target role**: ${profile?.targetRole ?? "Not specified"}
- **Key skills**: ${(profile?.skills as string[] ?? []).join(", ") || "Not specified"}
- **Location**: ${profile?.location ?? "Not specified"}
- **Bio/Summary**: ${profile?.bio?.slice(0, 200) ?? "Not provided"}
${profile?.salaryMin ? `- **Salary target**: $${profile.salaryMin.toLocaleString()}` : ""}

## Context
${context ?? "General career assistance"}

## Your Behavior
- Be direct, specific, and actionable — never give vague or generic advice
- Reference the user's actual profile details when relevant (their current role, skills, target)
- When asked about resumes: give concrete, specific rewrites not abstract tips
- When asked about interviews: give frameworks (STAR, SOAR, etc.) with examples
- When asked about salary: give market-aware numbers based on their role/location/experience
- When asked for cover letter help: write actual copy, not just instructions
- Format longer responses with clear headers and bullet points
- Keep conversational responses under 200 words; expand only when technical depth is requested
- Never recommend anything illegal, unethical, or misleading
- Stay in your expertise domain — do not answer unrelated questions`;

    const response = await generateText(message, systemPrompt);

    // Record user activity
    await prisma.activityLog.create({
      data: {
        id: globalThis.crypto.randomUUID(),
        userId,
        action: "ai.chat",
        metadata: { messageLength: message.length },
      },
    });

    return response;
  }

  static async generateChatStream(userId: string, message: string, context?: string): Promise<any> {
    const [profile, user] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const systemPrompt = `You are Vex AI — a world-class career strategist, resume expert, and job search coach built into the Vex platform. You have deep expertise in resume optimization, ATS systems, interview preparation, salary negotiation, networking, and career transitions.

## User Profile
- **Name**: ${user?.name ?? "User"}
- **Current role**: ${profile?.currentRole ?? "Not specified"}
- **Target role**: ${profile?.targetRole ?? "Not specified"}
- **Key skills**: ${(profile?.skills as string[] ?? []).join(", ") || "Not specified"}
- **Location**: ${profile?.location ?? "Not specified"}
- **Bio/Summary**: ${profile?.bio?.slice(0, 200) ?? "Not provided"}
${profile?.salaryMin ? `- **Salary target**: $${profile.salaryMin.toLocaleString()}` : ""}

## Context
${context ?? "General career assistance"}

## Your Behavior
- Be direct, specific, and actionable — never give vague or generic advice
- Reference the user's actual profile details when relevant
- Format longer responses with clear headers and bullet points
- Stay in your expertise domain — do not answer unrelated questions`;

    const { streamText } = await import("ai");
    const { google } = await import("@ai-sdk/google");

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: message,
      async onFinish() {
        await prisma.activityLog.create({
          data: {
            id: globalThis.crypto.randomUUID(),
            userId,
            action: "ai.chat",
            metadata: { messageLength: message.length },
          },
        });
      }
    });

    return result;
  }

  /**
   * Generates personalized action items based on user profile and activity stats.
   */
  static async generateSuggestions(userId: string): Promise<Suggestion[]> {
    const [profile, applications, resumes] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.application.findMany({ 
        where: { userId }, 
        orderBy: { updatedAt: 'desc' }, 
        take: 5 
      }),
      prisma.resume.findMany({ 
        where: { userId }, 
        take: 3 
      }),
    ]);

    const targetRole = profile?.targetRole || profile?.currentRole || "";
    const matchedIndustry = CareerDataService.getIndustryByRoleOrDescription(targetRole);
    const standards = CareerDataService.getIndustryStandards(matchedIndustry);

    const atsScores = resumes.map(r => r.atsScore).filter((s): s is number => s !== null);
    const avgAts = atsScores.length > 0 ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : null;
    const recentStatuses = applications.slice(0, 5).map(a => a.status);
    const hasRejections = recentStatuses.includes("REJECTED");
    const isInterviewing = recentStatuses.includes("INTERVIEWING");
    const profileStrength = profile?.profileStrength ?? 0;

    const suggestions = await generateJSON<Suggestion[]>(
      `You are a career AI coach generating hyper-personalized action items for a specific user. Analyze their data and identify the 4-6 most impactful next steps right now.

## User Data
- Current role: ${profile?.currentRole ?? "Not specified"}
- Target role: ${profile?.targetRole ?? "Not specified"}
- Skills: ${(profile?.skills as string[] ?? []).join(", ") || "none listed"}
- Profile completeness: ${profileStrength}%
- Industry: ${matchedIndustry.replace("_", " ")}

## Job Search Activity
- Total applications: ${applications.length}
- Recent application statuses: ${recentStatuses.join(", ") || "none"}
- Getting rejections: ${hasRejections}
- Currently interviewing: ${isInterviewing}
- Resumes: ${resumes.length} (avg ATS score: ${avgAts ?? "none analyzed yet"})

## Industry Context
- Recommended certifications for ${matchedIndustry.replace("_", " ")}: ${JSON.stringify(standards.common_certifications)}

## Decision Logic
Apply this priority logic:
1. If profileStrength < 60: profile completion is highest priority
2. If no resumes or avgAts < 60: resume improvement is urgent
3. If rejections > 2 with no interviews: ATS/keyword problem — suggest analyzer
4. If interviewing: interview prep is highest priority
5. If applications.length === 0: getting started suggestions
6. Always include 1 skill/learning suggestion relevant to their target role

Generate 4-6 suggestions. Each must:
- Address a REAL gap visible in their data (reference specific numbers)
- Have a compelling description explaining the business impact of fixing it
- Link to the correct Vex feature page

Valid href values: /app/resume-builder, /app/ats-analyzer, /app/interview-prep, /app/learning-hub, /app/jobs/matches, /app/auto-apply, /app/profile, /app/career-roadmap, /app/cover-letter

Return ONLY valid JSON array:
[
  {
    "type": "resume|application|interview|skill|profile|networking",
    "title": "Specific, action-oriented title (under 8 words)",
    "description": "1-2 sentences explaining why this matters NOW based on their data",
    "action": "CTA button text (2-4 words)",
    "href": "/app/[page]",
    "priority": <1-6, 1=most urgent>
  }
]`,
      "You are a data-driven career coach AI. Your suggestions are always grounded in the user's specific situation — you reference their actual data and explain why each suggestion matters right now. You never give generic advice."
    );

    return suggestions;
  }

  /**
   * Grades a resume against a job description, computing ATS scores and extraction lists.
   */
  static async generateATSAnalysis(
    resumeId: string,
    jobDescription: string
  ): Promise<ATSAnalysisResult> {
    const resumeRes = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { rawText: true }
    });
    const resumeText = resumeRes?.rawText ?? "No resume content found.";

    const matchedIndustry = CareerDataService.getIndustryByRoleOrDescription("", jobDescription);
    const standards = CareerDataService.getIndustryStandards(matchedIndustry);
    const examples = CareerDataService.getIndustryExamples(matchedIndustry);

    const analysis = await generateJSON<ATSAnalysisResult>(
      `Evaluate this resume raw text against the target job description. Score it out of 100.
Also benchmark the resume against the established industry standards for the identified industry: "${matchedIndustry.replace("_", " ")}".

Industry Standards to Evaluate Against:
- Section Order preference: ${JSON.stringify(standards.section_order)}
- Preferred action verbs/wording: ${JSON.stringify(standards.preferred_wording)}
- Preferred typography standards: ${standards.typography}
- Highly valued certifications: ${JSON.stringify(standards.common_certifications)}

Golden few-shot matching example for this industry:
${JSON.stringify(examples)}

Resume raw text:
${resumeText}

Job Description:
${jobDescription}

Return JSON of structure:
{
  "score": 85,
  "missingKeywords": ["AWS", "Terraform"],
  "presentKeywords": ["React", "TypeScript"],
  "suggestions": ["Add cloud architecture metrics to senior roles"],
  "sections": {
    "experience": {"score": 80, "feedback": "Add more quantified outcomes"},
    "skills": {"score": 90, "feedback": "Very strong match for core front-end tools"}
  }
}`,
      "You are an advanced ATS grading algorithm. Return precise matching suggestions.",
      "gemini-2.5-pro"
    );

    return analysis;
  }

  /**
   * Generates tailored interview questions based on job description.
   */
  static async generateInterviewQuestions(
    role: string,
    company: string,
    type: string,
    count = 5
  ): Promise<InterviewQAResult[]> {
    const questions = await generateJSON<InterviewQAResult[]>(
      `Generate ${count} custom interview questions of type "${type}" for a "${role}" role at "${company}".
Expose the question, category (e.g. behavioral, system-design, coding), and a list of expected keywords or points in the answer.

Return JSON array of:
[
  {
    "question": "What is your approach to system load-balancing?",
    "category": "technical",
    "expectedKeywords": ["DNS", "Nginx", "failover", "health-checks"]
  }
]`,
      "You are a tech company principal engineer interviewing a candidate. Generate rigorous questions.",
      "gemini-2.5-pro"
    );

    return questions;
  }

  /**
   * Grades an answer to an interview question.
   */
  static async gradeInterviewAnswer(
    question: string,
    answer: string
  ): Promise<{ feedback: string; score: number }> {
    const result = await generateJSON<{ feedback: string; score: number }>(
      `Assess this candidate's answer to the given interview question. Provide specific, constructive feedback and a grade score from 1 to 100.

Question: ${question}
Answer: ${answer}

Return JSON of:
{
  "feedback": "Constructive feedback details...",
  "score": 75
}`,
      "You are a compassionate yet rigorous tech recruiter. Review the answer.",
      "gemini-2.5-pro"
    );

    return result;
  }
}
