import { prisma } from "@/lib/db";
import { generateText, generateJSON } from "@/lib/ai";
import crypto from "crypto";

export class ResumeService {
  static async getResumes(userId: string): Promise<any[]> {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        _count: { select: { ATSAnalysis: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return resumes.map(r => ({
      ...r,
      _count: { atsAnalyses: r._count?.ATSAnalysis || 0 }
    }));
  }

  static async createResume(userId: string, data: any): Promise<any> {
    const id = crypto.randomUUID();
    const resume = await prisma.resume.create({
      data: {
        id,
        userId,
        title: data.title,
        template: data.template ?? "modern",
        language: data.language ?? "en"
      }
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        action: "resume.created",
        entity: "resume",
        entityId: resume.id
      }
    });

    return resume;
  }

  static async getResumeDetails(userId: string, id: string): Promise<any> {
    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!resume) return null;

    const atsAnalyses = await prisma.aTSAnalysis.findMany({
      where: { resumeId: id },
      orderBy: { createdAt: "desc" },
      take: 1
    });

    return { ...resume, atsAnalyses };
  }

  static async updateResume(userId: string, id: string, data: any): Promise<any> {
    const allowedFields = [
      "title", "fileUrl", "fileKey", "parsedContent", "rawText",
      "template", "isDefault", "atsScore", "version", "language"
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return prisma.resume.findFirst({ where: { id, userId } });
    }

    // Must verify ownership before updating
    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) return null;

    return prisma.resume.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() }
    });
  }

  static async deleteResume(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) return false;
    
    await prisma.resume.delete({ where: { id } });
    return true;
  }

  static async updateResumeUpload(userId: string, id: string, fileUrl: string, fileKey: string): Promise<boolean> {
    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) return false;

    await prisma.resume.update({
      where: { id },
      data: { fileUrl, fileKey, updatedAt: new Date() }
    });

    // Run PDF parsing asynchronously
    (async () => {
      try {
        console.log(`[ResumeParser] Starting Gemini parse for resume ${id}...`);
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);

        const { generateJSONFromPDF } = await import("@/lib/gemini");
        const parsedData = await generateJSONFromPDF<any>(
          pdfBuffer,
          `Parse the uploaded PDF resume. Extract candidate name, contact info, professional summary, work experience history... (omitted for brevity)
Return valid JSON...`,
          "You are an advanced, industry-grade ATS resume parser.",
          "gemini-2.5-pro"
        );

        if (parsedData) {
          const rawText = parsedData.rawText || JSON.stringify(parsedData);
          delete parsedData.rawText;

          await prisma.resume.update({
            where: { id },
            data: {
              parsedContent: parsedData,
              rawText,
              updatedAt: new Date()
            }
          });

          const profile = await prisma.profile.findUnique({ where: { userId } });
          if (profile && !profile.onboardingDone) {
            await prisma.profile.update({
              where: { userId },
              data: {
                skills: parsedData.skills || [],
                headline: parsedData.summary ? parsedData.summary.slice(0, 255) : (parsedData.name || null),
                bio: parsedData.summary || null,
                updatedAt: new Date()
              }
            });
          }
        }
      } catch (parseError) {
        console.error(`[ResumeParser] PDF parsing failed for resume ${id}:`, parseError);
      }
    })();

    return true;
  }

  static async translateResume(userId: string, resumeId: string, targetLanguage: string, targetCountry: string | null): Promise<any> {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new Error("Resume not found");

    const sourceText = resume.rawText ?? JSON.stringify(resume.parsedContent ?? {});
    const translated = await generateText(`Translate resume to ${targetLanguage}...`, `You are a translator.`);

    const newResume = await prisma.resume.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title: `${resume.title} (${targetLanguage})`,
        rawText: translated,
        language: targetLanguage,
        template: resume.template ?? 'modern'
      }
    });

    return { resumeId: newResume.id, content: translated };
  }

  static async getCoverLetters(userId: string): Promise<any[]> {
    return prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
  }

  static async createCoverLetter(userId: string, body: any): Promise<any> {
    const cl = await prisma.coverLetter.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title: body.title,
        content: body.content,
        jobTitle: body.jobTitle || null,
        company: body.company || null,
        tone: body.tone ?? "professional"
      }
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        action: "cover_letter.created",
        entity: "cover_letter",
        entityId: cl.id
      }
    });

    return cl;
  }

  static async getCoverLetterDetails(userId: string, id: string): Promise<any> {
    return prisma.coverLetter.findFirst({ where: { id, userId } });
  }

  static async updateCoverLetter(userId: string, id: string, body: any): Promise<any> {
    const allowedFields = ["title", "content", "jobTitle", "company", "tone", "isGenerated"];
    const updates: any = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) return prisma.coverLetter.findFirst({ where: { id, userId } });

    const existing = await prisma.coverLetter.findFirst({ where: { id, userId } });
    if (!existing) return null;

    return prisma.coverLetter.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() }
    });
  }

  static async deleteCoverLetter(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.coverLetter.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.coverLetter.delete({ where: { id } });
    return true;
  }

  static async generateCoverLetter(userId: string, body: any): Promise<any> {
    const { jobTitle, company, jobDescription, tone, resumeId } = body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const profile = await prisma.profile.findUnique({ where: { userId } });

    let resumeContext = "";
    if (resumeId) {
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
      if (resume?.rawText) {
        resumeContext = `\n\nMy resume:\n${resume.rawText.slice(0, 2000)}`;
      }
    }

    const prompt = `Write a high-converting cover letter for ${user?.name ?? "the candidate"} applying to ${jobTitle} at ${company}.

## Candidate
- Name: ${user?.name ?? "the candidate"}
- Current role: ${profile?.currentRole ?? "Professional"}
- Key skills: ${((profile?.skills as string[]) ?? []).slice(0, 8).join(", ") || "various professional skills"}
${profile?.biggestWin ? `- Notable achievement: ${profile.biggestWin}` : ""}
${resumeContext}

## Role
- Position: ${jobTitle} at ${company}
- Job description: ${jobDescription?.slice(0, 1500) ?? "Not provided"}

## Style
Professional, confident, and results-oriented.

## Requirements
1. Salutation: "Dear Hiring Manager,"
2. Opening: Lead with a concrete achievement or bold value proposition — NEVER start with "I am writing to express my interest"
3. Body paragraph 1: Connect 2-3 specific skills/experiences to job requirements with concrete numbers
4. Body paragraph 2: Demonstrate knowledge of ${company}'s mission or challenges; show research
5. Closing: Direct call to action requesting a specific conversation + "Sincerely," + ${user?.name ?? "the candidate"}
6. Length: 280–380 words
7. Banned phrases: "team player", "passionate about", "great fit", "look forward to hearing from you"
8. Every claim backed by evidence — no hollow adjectives

Output the cover letter text only.`;
    const content = await generateText(prompt, "You are a world-class career coach and professional writer who has helped thousands of candidates land roles at top companies. Your cover letters are specific, evidence-backed, and written in the candidate's authentic voice. You never use generic phrases and always connect the candidate's unique background to the specific role and company.");

    const cl = await prisma.coverLetter.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title: `Cover Letter — ${jobTitle} at ${company}`,
        content,
        jobTitle,
        company,
        tone: tone ?? "professional",
        isGenerated: true
      }
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        action: "cover_letter.generated",
        entity: "cover_letter",
        entityId: cl.id,
        metadata: { jobTitle, company }
      }
    });

    return cl;
  }

  static async generateCoverLetterStream(userId: string, body: any): Promise<any> {
    const { jobTitle, company, jobDescription, tone, resumeId } = body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const profile = await prisma.profile.findUnique({ where: { userId } });

    let resumeContext = "";
    if (resumeId) {
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
      if (resume?.rawText) {
        resumeContext = `\n\nMy resume:\n${resume.rawText.slice(0, 2000)}`;
      }
    }

    const prompt = `Write a high-converting cover letter for ${user?.name ?? "the candidate"} applying to ${jobTitle} at ${company}.

## Candidate
- Name: ${user?.name ?? "the candidate"}
- Current role: ${profile?.currentRole ?? "Professional"}
- Key skills: ${((profile?.skills as string[]) ?? []).slice(0, 8).join(", ") || "various professional skills"}
${profile?.biggestWin ? `- Notable achievement: ${profile.biggestWin}` : ""}
${resumeContext}

## Role
- Position: ${jobTitle} at ${company}
- Job description: ${jobDescription?.slice(0, 1500) ?? "Not provided"}

## Style
Professional, confident, and results-oriented.

## Requirements
1. Salutation: "Dear Hiring Manager,"
2. Opening: Lead with a concrete achievement or bold value proposition — NEVER start with "I am writing to express my interest"
3. Body paragraph 1: Connect 2-3 specific skills/experiences to job requirements with concrete numbers
4. Body paragraph 2: Demonstrate knowledge of ${company}'s mission or challenges; show research
5. Closing: Direct call to action requesting a specific conversation + "Sincerely," + ${user?.name ?? "the candidate"}
6. Length: 280–380 words
7. Banned phrases: "team player", "passionate about", "great fit", "look forward to hearing from you"
8. Every claim backed by evidence — no hollow adjectives

Output the cover letter text only.`;

    const { streamText } = await import("ai");
    const { google } = await import("@ai-sdk/google");

    const result = streamText({
      model: google("gemini-2.5-pro"),
      system: "You are a world-class career coach and professional writer who has helped thousands of candidates land roles at top companies. Your cover letters are specific, evidence-backed, and written in the candidate's authentic voice. You never use generic phrases and always connect the candidate's unique background to the specific role and company.",
      prompt,
      async onFinish({ text }) {
        const cl = await prisma.coverLetter.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            title: `Cover Letter — ${jobTitle} at ${company}`,
            content: text,
            jobTitle,
            company,
            tone: tone ?? "professional",
            isGenerated: true
          }
        });

        await prisma.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            action: "cover_letter.generated",
            entity: "cover_letter",
            entityId: cl.id,
            metadata: { jobTitle, company }
          }
        });
      }
    });

    return result;
  }

  static async analyzeATS(userId: string, resumeId: string, jobDescription: string): Promise<any> {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new Error("Resume not found");

    const resumeText = resume.rawText ?? JSON.stringify(resume.parsedContent ?? {});
    const prompt = `You are an enterprise-grade ATS system performing a precise keyword and content match analysis.

RESUME TEXT:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

## Analysis Instructions

**Step 1 — Keyword Extraction**
Extract ALL required keywords from the job description:
- Hard skills (technologies, tools, frameworks, programming languages, platforms)
- Soft skills (leadership, communication, etc. — only if explicitly required)
- Certifications and qualifications (AWS, PMP, CPA, etc.)
- Job title variations and seniority signals
- Domain-specific terminology

**Step 2 — Resume Matching**
For each extracted keyword, check if it appears in the resume (exact match OR clear semantic equivalent). Do NOT count partial matches as present.

**Step 3 — Section Scoring**
Score each resume section based on quality AND keyword alignment:
- contact: completeness (name, email, phone, LinkedIn/GitHub, location)
- summary: relevance to target role, keyword density, specificity
- experience: achievement-oriented bullets, quantification, role relevance, recency
- skills: coverage of required technical skills, no outdated/irrelevant skills padding
- education: degree level match, relevant coursework/certifications
- formatting: ATS-parseable structure, no tables/columns/graphics in raw text, consistent dates

**Step 4 — Suggestions**
Generate 3-5 specific, high-impact suggestions. Each must:
- Name the exact section to edit
- State the specific issue (e.g., "React appears 0 times despite being the primary framework required")
- Provide the exact fix (e.g., "Add 'Built responsive React 18 SPAs with hooks and context API' to the [Company Name] experience bullet")
- Classify priority: high (missing required skill), medium (present but under-represented), low (nice to have)

Return ONLY valid JSON, no markdown:
{
  "score": <integer 0-100; be calibrated: 70+ means strong candidate, 85+ means exceptional match>,
  "missingKeywords": ["exact keyword from JD not found in resume"],
  "presentKeywords": ["keyword found in both JD and resume"],
  "suggestions": [
    {
      "section": "Experience | Skills | Summary | Education | Contact | Formatting",
      "issue": "Specific problem statement",
      "fix": "Exact actionable remedy",
      "priority": "high | medium | low"
    }
  ],
  "sections": {
    "contact": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "skills": <0-100>,
    "education": <0-100>,
    "formatting": <0-100>
  }
}`;
    const result = await generateJSON<any>(prompt, "You are an ATS expert. Analyze resumes against job descriptions and return precise JSON.", "gemini-2.5-pro");

    return prisma.$transaction(async (tx) => {
      const analysis = await tx.aTSAnalysis.create({
        data: {
          id: crypto.randomUUID(),
          resumeId,
          jobDescription,
          score: result.score,
          missingKeywords: result.missingKeywords,
          presentKeywords: result.presentKeywords,
          suggestions: result.suggestions,
          sections: result.sections
        }
      });

      await tx.resume.update({
        where: { id: resumeId },
        data: { atsScore: result.score }
      });

      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          action: "ats.analyzed",
          entity: "resume",
          entityId: resumeId,
          metadata: { score: result.score }
        }
      });

      return analysis;
    });
  }

  static async getATSHistory(userId: string, resumeId: string | null): Promise<any[]> {
    const analyses = await prisma.aTSAnalysis.findMany({
      where: {
        Resume: { userId },
        ...(resumeId ? { resumeId } : {})
      },
      include: {
        Resume: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return analyses.map(a => ({
      ...a,
      resume: { title: a.Resume.title }
    }));
  }
}
