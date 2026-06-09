import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const logs = await UserService.getActivityLogs(session.user.id, limit);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("[ACTIVITY_GET]", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}


