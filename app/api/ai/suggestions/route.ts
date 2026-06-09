import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AiService } from "@/lib/services/ai.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const suggestions = await AiService.generateSuggestions(session.user.id);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("[AI_SUGGESTIONS_GET]", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}

