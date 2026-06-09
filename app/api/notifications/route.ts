import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MessageService } from "@/lib/services/message.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const result = await MessageService.getNotifications(session.user.id, page, limit, unreadOnly);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


