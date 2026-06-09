import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("sessionToken")?.value;
    if (token) {
      await db.query(`DELETE FROM "Session" WHERE "sessionToken" = $1`, [token]);
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set("sessionToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[AUTH_LOGOUT]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
