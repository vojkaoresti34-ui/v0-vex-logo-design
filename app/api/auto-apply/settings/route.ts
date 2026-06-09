import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const config = await JobService.getAutoApplyConfig(session.user.id);
    return NextResponse.json(config);
  } catch (error) {
    console.error("[AUTO_APPLY_SETTINGS_GET]", error);
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const config = await JobService.updateAutoApplyConfig(session.user.id, body);
    return NextResponse.json(config);
  } catch (error) {
    console.error("[AUTO_APPLY_SETTINGS_PATCH]", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}


