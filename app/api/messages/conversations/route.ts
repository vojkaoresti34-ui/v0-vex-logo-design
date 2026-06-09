import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MessageService } from "@/lib/services/message.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const conversations = await MessageService.getConversations(session.user.id);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Conversations GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, memberIds } = await req.json();
    const conversation = await MessageService.createConversation(session.user.id, title, memberIds);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Conversations POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


