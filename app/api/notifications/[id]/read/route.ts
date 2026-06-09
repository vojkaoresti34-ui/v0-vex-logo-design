import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MessageService } from "@/lib/services/message.service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await MessageService.markNotificationRead(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification read API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


