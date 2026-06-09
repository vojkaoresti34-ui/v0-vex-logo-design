import { db } from "./db";

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  plan: string;
}

/**
 * Returns the DB user record for a given user ID (our own UUID primary key).
 */
export async function getDbUser(userId: string): Promise<DbUser | null> {
  try {
    const { rows } = await db.query(
      `SELECT id, email, name, image, role, plan FROM "User" WHERE id = $1 LIMIT 1`,
      [userId]
    );
    return (rows[0] as DbUser) ?? null;
  } catch (err) {
    console.error("[DB_USER_ERROR]", err);
    return null;
  }
}

export async function getDbUserId(userId: string): Promise<string | null> {
  return userId || null;
}
