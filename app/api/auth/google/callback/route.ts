import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("Google OAuth Error:", error);
      return NextResponse.redirect(new URL("/login?error=OAuthFailed", req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/login?error=InvalidOAuthRequest", req.url));
    }

    const savedState = req.cookies.get("oauth_state")?.value;
    if (!savedState || savedState !== state) {
      return NextResponse.redirect(new URL("/login?error=InvalidState", req.url));
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials");
      return NextResponse.redirect(new URL("/login?error=ConfigurationError", req.url));
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("Failed to get Google token:", errData);
      return NextResponse.redirect(new URL("/login?error=TokenExchangeFailed", req.url));
    }

    const tokenData = await tokenRes.json();
    const { access_token } = tokenData;

    // Fetch user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userRes.ok) {
      console.error("Failed to fetch Google user info");
      return NextResponse.redirect(new URL("/login?error=UserInfoFailed", req.url));
    }

    const googleUser = await userRes.json();
    
    // googleUser has: id, email, verified_email, name, given_name, family_name, picture, locale
    const email = googleUser.email.toLowerCase();

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: googleUser.name || "User",
          image: googleUser.picture || null,
          role: "USER",
          plan: "FREE",
          password: "", // No password for OAuth users
        },
      });

      // Also create empty profile
      await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
        },
      });
    } else {
      // If user exists but has no image, update image
      if (!user.image && googleUser.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: googleUser.picture },
        });
      }
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        id: sessionId,
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    // Create response
    const response = NextResponse.redirect(new URL("/app", req.url));

    response.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    // Clear the oauth state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("[AUTH_GOOGLE_CALLBACK]", error);
    return NextResponse.redirect(new URL("/login?error=InternalError", req.url));
  }
}
