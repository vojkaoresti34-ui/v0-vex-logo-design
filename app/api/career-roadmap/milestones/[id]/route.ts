import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;
  const { completed } = await req.json();

  try {
    const result = await db.transaction(async (client) => {
      // 1. Fetch milestone and verify ownership
      const milestoneRes = await client.query(
        `SELECT m.*, r."userId" AS "roadmapUserId"
         FROM "Milestone" m
         JOIN "CareerRoadmap" r ON m."roadmapId" = r.id
         WHERE m.id = $1
         LIMIT 1`,
        [id]
      );

      const milestone = milestoneRes.rows[0];
      if (!milestone || milestone.roadmapUserId !== userId) {
        return { error: "Not found", status: 404 };
      }

      // 2. Update milestone status
      const completedAt = completed ? new Date() : null;
      await client.query(
        `UPDATE "Milestone"
         SET completed = $1, "completedAt" = $2
         WHERE id = $3`,
        [completed, completedAt, id]
      );

      // 3. Query all milestones for this roadmap to calculate new progress
      const allMilestonesRes = await client.query(
        `SELECT completed FROM "Milestone" WHERE "roadmapId" = $1`,
        [milestone.roadmapId]
      );

      const allMilestones = allMilestonesRes.rows;
      const completedCount = allMilestones.filter((m: any) => m.completed).length;
      const progress = allMilestones.length > 0 
        ? Math.round((completedCount / allMilestones.length) * 100)
        : 0;

      // 4. Update career roadmap progress
      await client.query(
        `UPDATE "CareerRoadmap"
         SET progress = $1, "updatedAt" = NOW()
         WHERE id = $2`,
        [progress, milestone.roadmapId]
      );

      return { progress };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, progress: result.progress });
  } catch (error) {
    console.error("Milestone PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

