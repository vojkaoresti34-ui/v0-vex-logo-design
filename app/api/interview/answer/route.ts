import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InterviewService } from "@/lib/services/interview.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { questionId, answer, timeSpent } = await req.json();

    if (!questionId || !answer) {
      return NextResponse.json({ error: "questionId and answer are required" }, { status: 400 });
    }

    try {
      const response = await InterviewService.submitAnswer(session.user.id, {
        questionId,
        answer,
        timeSpent,
      });
      return NextResponse.json(response);
    } catch (e: any) {
      if (e.message === "Interview question not found") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error) {
    console.error("[INTERVIEW_ANSWER_POST]", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}


