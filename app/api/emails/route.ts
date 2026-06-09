import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EmailService } from "@/lib/services/email.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const campaigns = await EmailService.getCampaigns(session.user.id);
    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error("[EMAILS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { subject, body: emailBody, recipient } = body;

    if (!subject || !emailBody || !recipient) {
      return NextResponse.json({ error: "subject, body, and recipient are required" }, { status: 400 });
    }

    const campaign = await EmailService.createCampaign(session.user.id, body);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    console.error("[EMAILS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
