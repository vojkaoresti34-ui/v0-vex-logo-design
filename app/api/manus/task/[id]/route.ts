import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ManusService } from "@/lib/services/manus.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    console.log(`[MANUS_API_ROUTE] Fetching details for task ${taskId}...`);
    const detailRes = await ManusService.getTaskDetail(taskId);

    if (!detailRes.ok) {
      return NextResponse.json(
        { error: "Failed to locate task on Manus platform" },
        { status: 404 }
      );
    }

    const taskStatus = detailRes.task?.status || "running";
    let messages: any[] = [];

    // If stopped (completed) or running, retrieve the live message thread to extract the report
    if (taskStatus === "stopped" || taskStatus === "running" || taskId.startsWith("mock-")) {
      messages = await ManusService.getTaskMessages(taskId);
    }

    return NextResponse.json({
      taskId,
      status: taskStatus,
      title: detailRes.task?.title || "Autonomous Colleague Task",
      messages,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[MANUS_TASK_GET_ERROR] Failed for task ${taskId}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
