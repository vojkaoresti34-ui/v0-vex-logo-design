import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  try {
    const body = await req.json();

    const result = await db.transaction(async (client) => {
      // 1. Fetch project and verify ownership
      const projectRes = await client.query(
        `SELECT pp.*, p."userId" AS "portfolioUserId"
         FROM "PortfolioProject" pp
         JOIN "Portfolio" p ON pp."portfolioId" = p.id
         WHERE pp.id = $1
         LIMIT 1`,
        [id]
      );

      const project = projectRes.rows[0];
      if (!project || project.portfolioUserId !== userId) {
        return { error: "Not found", status: 404 };
      }

      // 2. Perform dynamic patch merge
      const title = body.title !== undefined ? body.title : project.title;
      const description = body.description !== undefined ? body.description : project.description;
      const technologies = body.technologies !== undefined ? JSON.stringify(body.technologies) : JSON.stringify(project.technologies ?? []);
      const imageUrl = body.imageUrl !== undefined ? body.imageUrl : project.imageUrl;
      const liveUrl = body.liveUrl !== undefined ? body.liveUrl : project.liveUrl;
      const githubUrl = body.githubUrl !== undefined ? body.githubUrl : project.githubUrl;
      const featured = body.featured !== undefined ? body.featured : project.featured;
      const order = body.order !== undefined ? body.order : project.order;

      // 3. Update project
      const updateRes = await client.query(
        `UPDATE "PortfolioProject"
         SET title = $1, description = $2, technologies = $3, "imageUrl" = $4, "liveUrl" = $5, "githubUrl" = $6, featured = $7, "order" = $8, "updatedAt" = NOW()
         WHERE id = $9
         RETURNING *`,
        [title, description, technologies, imageUrl, liveUrl, githubUrl, featured, order, id]
      );

      return { data: updateRes.rows[0] };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Portfolio project PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  try {
    const result = await db.transaction(async (client) => {
      // 1. Fetch project and verify ownership
      const projectRes = await client.query(
        `SELECT pp.id, p."userId" AS "portfolioUserId"
         FROM "PortfolioProject" pp
         JOIN "Portfolio" p ON pp."portfolioId" = p.id
         WHERE pp.id = $1
         LIMIT 1`,
        [id]
      );

      const project = projectRes.rows[0];
      if (!project || project.portfolioUserId !== userId) {
        return { error: "Not found", status: 404 };
      }

      // 2. Delete the project
      await client.query(`DELETE FROM "PortfolioProject" WHERE id = $1`, [id]);
      return { success: true };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio project DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

