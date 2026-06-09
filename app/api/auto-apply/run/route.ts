import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";
import { workerQueue } from "@/lib/services/worker";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const isBackground = searchParams.get("background") !== "false";

  try {
    // Early validation of configuration before enqueuing
    const config = await JobService.getAutoApplyConfig(session.user.id);
    if (!config?.isEnabled) {
      return NextResponse.json({ error: "Auto-apply is not enabled" }, { status: 400 });
    }

    if (isBackground) {
      const taskId = workerQueue.enqueue("auto_apply", session.user.id);
      return NextResponse.json({ status: "queued", taskId }, { status: 202 });
    } else {
      const result = await JobService.runAutoApply(session.user.id);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error("[AUTO_APPLY_RUN_POST]", error);
    
    if (error.message === "Auto-apply is not enabled" || error.message === "Daily auto-apply limit reached") {
      return NextResponse.json({ error: error.message }, { status: error.message.includes("limit") ? 429 : 400 });
    }
    
    return NextResponse.json({ error: "Auto-apply execution failed" }, { status: 500 });
  }
}



