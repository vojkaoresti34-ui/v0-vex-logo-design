import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EmailService } from "@/lib/services/email.service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const updated = await EmailService.sendCampaign(session.user.id, id);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[EMAIL_SEND_POST]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 400 });
  }
}
