import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AiService } from "@/lib/services/ai.service";
import { sanitizeInput, isRateLimited } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || userId;
  
  if (isRateLimited(`chat:${ip}`, 15, 60 * 1000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before sending another message." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const message = sanitizeInput(body.message);
    const context = sanitizeInput(body.context);

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const result = await AiService.generateChatStream(userId, message, context);

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[AI_CHAT_POST]", error);
    return NextResponse.json({ error: "Failed to generate chat response" }, { status: 500 });
  }
}


