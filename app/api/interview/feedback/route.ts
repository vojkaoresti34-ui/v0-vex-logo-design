import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InterviewService } from "@/lib/services/interview.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sessionId } = await req.json();

    try {
      const result = await InterviewService.generateFeedback(session.user.id, sessionId);
      return NextResponse.json(result);
    } catch (e: any) {
      if (e.message === "Session not found") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (e.message === "No answered questions found") {
        return NextResponse.json({ error: "No answered questions found" }, { status: 400 });
      }
      throw e;
    }
  } catch (error) {
    console.error("[INTERVIEW_FEEDBACK_POST]", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}


