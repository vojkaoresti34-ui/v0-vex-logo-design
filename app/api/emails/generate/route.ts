import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EmailService } from "@/lib/services/email.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const result = await EmailService.generateEmail(session.user.id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EMAIL_GENERATE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
