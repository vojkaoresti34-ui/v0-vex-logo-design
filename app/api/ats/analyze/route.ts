import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";
import { atsAnalyzeSchema } from "@/lib/validations/resume";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { resumeId, jobDescription } = atsAnalyzeSchema.parse(body);

    try {
      const analysis = await ResumeService.analyzeATS(session.user.id, resumeId, jobDescription);
      return NextResponse.json(analysis);
    } catch (e: any) {
      if (e.message === "Resume not found") {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[ATS_ANALYZE]", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}


