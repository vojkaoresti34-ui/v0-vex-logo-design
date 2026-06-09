import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { resumeId, targetLanguage, targetCountry } = await req.json();

  if (!resumeId || !targetLanguage) {
    return NextResponse.json({ error: "resumeId and targetLanguage are required" }, { status: 400 });
  }

  try {
    try {
      const result = await ResumeService.translateResume(userId, resumeId, targetLanguage, targetCountry);
      return NextResponse.json(result);
    } catch (e: any) {
      if (e.message === "Resume not found") {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Resume translator API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


