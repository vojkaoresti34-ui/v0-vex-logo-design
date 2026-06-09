import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { workerQueue } from "@/lib/services/worker";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { campaignIds } = body;

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json({ error: "campaignIds array is required" }, { status: 400 });
    }

    const taskId = workerQueue.enqueue("bulk_email", session.user.id, { campaignIds });
    return NextResponse.json({ status: "queued", taskId }, { status: 202 });
  } catch (error: any) {
    console.error("[BULK_EMAIL_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
