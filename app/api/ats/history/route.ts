import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("resumeId");

  try {
    const analyses = await ResumeService.getATSHistory(session.user.id, resumeId);
    return NextResponse.json(analyses);
  } catch (error) {
    console.error("[ATS_HISTORY_GET]", error);
    return NextResponse.json({ error: "Failed to fetch ATS history" }, { status: 500 });
  }
}


