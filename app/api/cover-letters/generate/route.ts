import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { jobTitle, company } = body;

    if (!jobTitle || !company) {
      return NextResponse.json({ error: "Job title and company are required" }, { status: 400 });
    }

    const result = await ResumeService.generateCoverLetterStream(session.user.id, body);
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[COVER_LETTER_GENERATE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

