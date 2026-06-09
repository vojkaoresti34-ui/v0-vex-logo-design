import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { isRateLimited } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
    if (isRateLimited(`signup:${ip}`, 5, 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const name: string = (body.name ?? "").trim();
    const email: string = (body.email ?? "").trim().toLowerCase();
    const password: string = body.password ?? "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Check if email already in use
    const existing = await db.query(`SELECT id FROM "User" WHERE email = $1 LIMIT 1`, [email]);
    if (existing.rows[0]) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO "User" (id, email, name, password) VALUES ($1, $2, $3, $4)`,
        [userId, email, name, hashedPassword]
      );
      await client.query(
        `INSERT INTO "Profile" (id, "userId") VALUES ($1, $2)`,
        [profileId, userId]
      );
      await client.query(
        `INSERT INTO "UserSettings" (id, "userId") VALUES ($1, $2)`,
        [settingsId, userId]
      );
    });

    // Create session
    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.query(
      `INSERT INTO "Session" (id, "sessionToken", "userId", expires) VALUES ($1, $2, $3, $4)`,
      [sessionId, sessionToken, userId, expires]
    );

    const response = NextResponse.json({ success: true }, { status: 201 });
    response.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[AUTH_SIGNUP]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
