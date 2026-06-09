import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LearningService } from "@/lib/services/learning.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courses = await LearningService.getRecommendations(session.user.id);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[LEARNING_RECOMMENDATIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}


