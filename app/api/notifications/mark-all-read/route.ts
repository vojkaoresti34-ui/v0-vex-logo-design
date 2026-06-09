import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MessageService } from "@/lib/services/message.service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await MessageService.markAllNotificationsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark all notifications read API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


