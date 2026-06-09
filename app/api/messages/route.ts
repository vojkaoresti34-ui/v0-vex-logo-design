import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MessageService } from "@/lib/services/message.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  try {
    const result = await MessageService.getMessages(session.user.id, conversationId, page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Messages GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, content } = await req.json();

  if (!conversationId || !content) {
    return NextResponse.json({ error: "conversationId and content are required" }, { status: 400 });
  }

  try {
    const result = await MessageService.sendMessage(session.user.id, conversationId, content);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Messages POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


