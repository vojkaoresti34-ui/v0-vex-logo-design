import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const { rows: [portfolio] } = await db.query(
      `SELECT p.*,
              (
                SELECT json_agg(json_build_object(
                  'id', pp.id,
                  'portfolioId', pp."portfolioId",
                  'title', pp.title,
                  'description', pp.description,
                  'technologies', pp.technologies,
                  'imageUrl', pp."imageUrl",
                  'liveUrl', pp."liveUrl",
                  'githubUrl', pp."githubUrl",
                  'featured', pp.featured,
                  'order', pp."order",
                  'createdAt', pp."createdAt",
                  'updatedAt', pp."updatedAt"
                ) ORDER BY pp.featured DESC, pp."order" ASC)
                FROM "PortfolioProject" pp
                WHERE pp."portfolioId" = p.id
              ) AS projects
       FROM "Portfolio" p
       WHERE p."userId" = $1
       LIMIT 1`,
      [userId]
    );

    if (!portfolio) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      ...portfolio,
      projects: portfolio.projects ?? [],
    });
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { title = null, bio = null, theme = 'minimal', customDomain = null, isPublished = false } = body;

    const userRes = await db.query(`SELECT name FROM "User" WHERE id = $1 LIMIT 1`, [userId]);
    const user = userRes.rows[0];

    const slug = `${(user?.name ?? "user").toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`;

    const portfolio = await db.transaction(async (client) => {
      const existingRes = await client.query(
        `SELECT id, slug FROM "Portfolio" WHERE "userId" = $1 LIMIT 1`,
        [userId]
      );
      const existing = existingRes.rows[0];

      if (existing) {
        const updateRes = await client.query(
          `UPDATE "Portfolio"
           SET title = $1, bio = $2, theme = $3, "customDomain" = $4, "isPublished" = $5, "updatedAt" = NOW()
           WHERE "userId" = $6
           RETURNING *`,
          [title, bio, theme, customDomain, isPublished, userId]
        );
        return updateRes.rows[0];
      } else {
        const newId = crypto.randomUUID();
        const insertRes = await client.query(
          `INSERT INTO "Portfolio" (id, "userId", slug, title, bio, theme, "customDomain", "isPublished", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           RETURNING *`,
          [newId, userId, slug, title, bio, theme, customDomain, isPublished]
        );
        return insertRes.rows[0];
      }
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

