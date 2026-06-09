import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InterviewService } from "@/lib/services/interview.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sessionId, count = 5 } = await req.json();

    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    try {
      const allQuestions = await InterviewService.generateQuestions(session.user.id, sessionId, count);
      return NextResponse.json(allQuestions);
    } catch (e: any) {
      if (e.message === "Session not found") {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error) {
    console.error("[INTERVIEW_QUESTIONS_POST]", error);
    return NextResponse.json({ error: "Failed to generate interview questions" }, { status: 500 });
  }
}


