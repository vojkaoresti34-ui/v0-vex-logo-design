/**
 * Custom session-based auth.
 * All API routes use `auth()` from this file.
 * Returns { user: { id, email, name, image, role, plan } } or null.
 */
import { cookies } from "next/headers";
import { db } from "./db";

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: string;
    plan: string;
    onboardingDone: boolean;
  };
}

export async function auth(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    if (!token) return null;

    const { rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.image, u.role, u.plan, COALESCE(p."onboardingDone", false) as "onboardingDone"
       FROM "Session" s
       JOIN "User" u ON u.id = s."userId"
       LEFT JOIN "Profile" p ON p."userId" = u.id
       WHERE s."sessionToken" = $1 AND s.expires > NOW()
       LIMIT 1`,
      [token]
    );

    if (!rows[0]) return null;

    return {
      user: {
        id: rows[0].id,
        email: rows[0].email,
        name: rows[0].name,
        image: rows[0].image,
        role: rows[0].role,
        plan: rows[0].plan,
        onboardingDone: rows[0].onboardingDone,
      },
    };
  } catch {
    return null;
  }
}
