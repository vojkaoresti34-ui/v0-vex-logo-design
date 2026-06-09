import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LearningService } from "@/lib/services/learning.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { courseId } = await req.json();
    const enrollment = await LearningService.enroll(session.user.id, courseId);
    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("[LEARNING_ENROLL_POST]", error);
    return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { courseId, progress } = await req.json();
    const enrollment = await LearningService.updateProgress(session.user.id, courseId, progress);

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("[LEARNING_ENROLL_PATCH]", error);
    return NextResponse.json({ error: "Failed to update enrollment progress" }, { status: 500 });
  }
}


