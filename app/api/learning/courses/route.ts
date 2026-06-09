import { NextRequest, NextResponse } from "next/server";
import { LearningService } from "@/lib/services/learning.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const result = await LearningService.getCourses({
      category,
      level,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[LEARNING_COURSES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}


