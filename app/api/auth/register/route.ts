import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeInput, isRateLimited } from "@/lib/utils";

/**
 * POST /api/auth/register
 * Called after signup to persist optional profile fields (currentRole, targetRole).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
    if (isRateLimited(`register:${ip}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentRole, targetRole } = sanitizeInput(body);

    if (currentRole || targetRole) {
      await db.query(
        `UPDATE "Profile"
         SET "currentRole" = COALESCE($1, "currentRole"),
             "targetRole"  = COALESCE($2, "targetRole"),
             "updatedAt"   = CURRENT_TIMESTAMP
         WHERE "userId" = $3`,
        [currentRole || null, targetRole || null, session.user.id]
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[REGISTER_PROFILE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
