import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HeadshotService } from "@/lib/services/headshot.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const headshots = await HeadshotService.getHeadshots(session.user.id);
    return NextResponse.json(headshots);
  } catch (error: any) {
    console.error("[HEADSHOTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { imageUrl, fileKey } = body;

    if (!imageUrl || !fileKey) {
      return NextResponse.json({ error: "imageUrl and fileKey are required" }, { status: 400 });
    }

    const headshot = await HeadshotService.createHeadshot(session.user.id, body);
    return NextResponse.json(headshot, { status: 201 });
  } catch (error: any) {
    console.error("[HEADSHOTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
