import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user: session.user }, { status: 200 });
  } catch (error) {
    console.error("[AUTH_ME]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
