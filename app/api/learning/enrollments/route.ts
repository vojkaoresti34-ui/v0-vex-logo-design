import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LearningService } from "@/lib/services/learning.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const enrollments = await LearningService.getEnrollments(session.user.id);
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("[LEARNING_ENROLLMENTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}


