import { db } from "@/lib/db";

export class HeadshotService {
  /**
   * Retrieves all headshots for a user.
   */
  static async getHeadshots(userId: string): Promise<any[]> {
    const { rows } = await db.query(
      `SELECT * FROM "Headshot"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Creates a new headshot and sets it as the active one.
   */
  static async createHeadshot(userId: string, data: any): Promise<any> {
    const { imageUrl, fileKey, style } = data;
    const id = globalThis.crypto.randomUUID();

    return db.transaction(async (client) => {
      // 1. Deactivate existing active headshots
      await client.query(
        `UPDATE "Headshot"
         SET "isActive" = FALSE
         WHERE "userId" = $1`,
        [userId]
      );

      // 2. Insert the new active headshot
      const { rows } = await client.query(
        `INSERT INTO "Headshot" (id, "userId", "imageUrl", "fileKey", style, "isActive")
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING *`,
        [id, userId, imageUrl, fileKey, style || null]
      );

      return rows[0];
    });
  }

  /**
   * Activates a specific headshot by ID and deactivates all others for the user.
   */
  static async activateHeadshot(userId: string, id: string): Promise<boolean> {
    return db.transaction(async (client) => {
      // 1. Deactivate all headshots
      await client.query(
        `UPDATE "Headshot"
         SET "isActive" = FALSE
         WHERE "userId" = $1`,
        [userId]
      );

      // 2. Activate the target headshot
      const result = await client.query(
        `UPDATE "Headshot"
         SET "isActive" = TRUE
         WHERE id = $1 AND "userId" = $2`,
        [id, userId]
      );

      return (result.rowCount ?? 0) > 0;
    });
  }
}
