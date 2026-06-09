import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HeadshotService } from "@/lib/services/headshot.service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const success = await HeadshotService.activateHeadshot(session.user.id, id);
    if (!success) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[HEADSHOT_ACTIVATE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
