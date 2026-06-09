import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      console.error("LinkedIn OAuth Error:", error, errorDescription);
      return NextResponse.redirect(new URL("/login?error=OAuthFailed", req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/login?error=InvalidOAuthRequest", req.url));
    }

    const savedState = req.cookies.get("oauth_state")?.value;
    if (!savedState || savedState !== state) {
      return NextResponse.redirect(new URL("/login?error=InvalidState", req.url));
    }

    const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error("Missing LinkedIn OAuth credentials");
      return NextResponse.redirect(new URL("/login?error=ConfigurationError", req.url));
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const redirectUri = `${protocol}://${host}/api/auth/linkedin/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("Failed to get LinkedIn token:", errData);
      return NextResponse.redirect(new URL("/login?error=TokenExchangeFailed", req.url));
    }

    const tokenData = await tokenRes.json();
    const { access_token } = tokenData;

    // Fetch user info using OpenID Connect (OIDC)
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userRes.ok) {
      console.error("Failed to fetch LinkedIn user info");
      return NextResponse.redirect(new URL("/login?error=UserInfoFailed", req.url));
    }

    const linkedInUser = await userRes.json();
    
    const email = linkedInUser.email.toLowerCase();

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: linkedInUser.name || "User",
          image: linkedInUser.picture || null,
          role: "USER",
          plan: "FREE",
          password: "", 
        },
      });

      await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
        },
      });
    } else {
      if (!user.image && linkedInUser.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: linkedInUser.picture },
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

    const response = NextResponse.redirect(new URL("/app", req.url));

    response.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("[AUTH_LINKEDIN_CALLBACK]", error);
    return NextResponse.redirect(new URL("/login?error=InternalError", req.url));
  }
}
