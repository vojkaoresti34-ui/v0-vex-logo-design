import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { title, description, technologies, imageUrl, liveUrl, githubUrl, featured } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const project = await db.transaction(async (client) => {
      // 1. Find or create portfolio
      let portfolioRes = await client.query(
        `SELECT id FROM "Portfolio" WHERE "userId" = $1 LIMIT 1`,
        [userId]
      );
      let portfolio = portfolioRes.rows[0];

      if (!portfolio) {
        const userRes = await client.query(`SELECT name FROM "User" WHERE id = $1 LIMIT 1`, [userId]);
        const user = userRes.rows[0];
        const slug = `${(user?.name ?? "user").toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`;
        
        const newPortfolioId = crypto.randomUUID();
        const insertPortfolioRes = await client.query(
          `INSERT INTO "Portfolio" (id, "userId", slug, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, NOW(), NOW())
           RETURNING id`,
          [newPortfolioId, userId, slug]
        );
        portfolio = insertPortfolioRes.rows[0];
      }

      // 2. Count existing projects
      const countRes = await client.query(
        `SELECT COUNT(*)::int AS count FROM "PortfolioProject" WHERE "portfolioId" = $1`,
        [portfolio.id]
      );
      const count = countRes.rows[0]?.count ?? 0;

      // 3. Create the project
      const projectId = crypto.randomUUID();
      const insertProjectRes = await client.query(
        `INSERT INTO "PortfolioProject" (id, "portfolioId", title, description, technologies, "imageUrl", "liveUrl", "githubUrl", featured, "order", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          projectId,
          portfolio.id,
          title,
          description,
          JSON.stringify(technologies ?? []),
          imageUrl ?? null,
          liveUrl ?? null,
          githubUrl ?? null,
          featured ?? false,
          count
        ]
      );

      return insertProjectRes.rows[0];
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Portfolio project POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

