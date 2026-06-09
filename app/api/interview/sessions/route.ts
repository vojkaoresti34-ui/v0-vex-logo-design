import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InterviewService } from "@/lib/services/interview.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sessions = await InterviewService.getSessions(session.user.id);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[INTERVIEW_SESSIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch interview sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const interviewSession = await InterviewService.createSession(session.user.id, body);
    return NextResponse.json(interviewSession, { status: 201 });
  } catch (error) {
    console.error("[INTERVIEW_SESSIONS_POST]", error);
    return NextResponse.json({ error: "Failed to create interview session" }, { status: 500 });
  }
}


