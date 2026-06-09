import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateJSON } from "@/lib/ai";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const { rows: [roadmap] } = await db.query(
      `SELECT r.*,
              (
                SELECT json_agg(json_build_object(
                  'id', m.id,
                  'roadmapId', m."roadmapId",
                  'title', m.title,
                  'description', m.description,
                  'dueDate', m."dueDate",
                  'completed', m.completed,
                  'completedAt', m."completedAt",
                  'order', m."order",
                  'category', m.category,
                  'createdAt', m."createdAt"
                ) ORDER BY m."order" ASC)
                FROM "Milestone" m
                WHERE m."roadmapId" = r.id
              ) AS milestones
       FROM "CareerRoadmap" r
       WHERE r."userId" = $1
       LIMIT 1`,
      [userId]
    );

    if (!roadmap) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      ...roadmap,
      milestones: roadmap.milestones ?? [],
    });
  } catch (error) {
    console.error("Career roadmap GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { currentRole, targetRole, timelineMonths = 12 } = await req.json();

  if (!currentRole || !targetRole) {
    return NextResponse.json({ error: "currentRole and targetRole are required" }, { status: 400 });
  }

  try {
    const profileRes = await db.query(
      `SELECT skills FROM "Profile" WHERE "userId" = $1 LIMIT 1`,
      [userId]
    );
    const skills = profileRes.rows[0]?.skills ?? [];

    interface MilestoneItem {
      title: string;
      description: string;
      category: string;
      monthOffset: number;
    }

    const aiPlan = await generateJSON<{ milestones: MilestoneItem[] }>(
      `You are building a precise, actionable career transition roadmap.

TRANSITION: ${currentRole} → ${targetRole}
TIMELINE: ${timelineMonths} months
CURRENT SKILLS: ${skills.join(", ") || "General professional skills"}

Your task: Generate 8-12 concrete milestones that represent a realistic path from the current role to the target role. Each milestone must:

1. Be **specific and actionable** (not "learn Python" but "Complete Python for Data Science course on Coursera and build 2 portfolio projects demonstrating pandas/NumPy/scikit-learn")
2. Include the **business rationale** (why this milestone matters for the transition)
3. Be **realistically spaced** over the ${timelineMonths}-month timeline (front-load learning, middle-weight projects/certs, back-load applications)
4. Cover all 5 categories proportionally:
   - **skill**: Technical or soft skill acquisition with specific resources
   - **certification**: Industry-recognized credentials relevant to ${targetRole}
   - **project**: Portfolio or work deliverables that demonstrate the new capability
   - **networking**: Specific outreach, communities, or conferences to join
   - **application**: Job search activities (resume refresh, apply to X companies, interview prep)

Skill gap analysis:
- The candidate currently has: ${skills.join(", ") || "general professional skills"}
- The target role (${targetRole}) typically requires: [infer from role title]
- Identify the 3 most critical skill gaps and create milestones to close them first

Return ONLY valid JSON — no markdown fences, no explanation:
{
  "milestones": [
    {
      "title": "Concise milestone title (max 8 words)",
      "description": "2-3 sentences explaining what to do, how to do it, and why it matters for the transition",
      "category": "skill|networking|application|certification|project",
      "monthOffset": <1 to ${timelineMonths}>
    }
  ]
}`,
      "You are a senior career strategist with deep expertise in professional development and job market transitions. You create highly specific, research-backed career roadmaps tailored to the individual's starting point and target destination. Your roadmaps are used by professionals to navigate real career transitions successfully.",
      "gemini-2.5-pro"
    );

    const fullRoadmap = await db.transaction(async (client) => {
      // Find existing
      const existingRes = await client.query(
        `SELECT id FROM "CareerRoadmap" WHERE "userId" = $1 LIMIT 1`,
        [userId]
      );
      const existing = existingRes.rows[0];

      if (existing) {
        // Delete milestones
        await client.query(
          `DELETE FROM "Milestone" WHERE "roadmapId" = $1`,
          [existing.id]
        );
      }

      let roadmapId = existing?.id;

      if (existing) {
        await client.query(
          `UPDATE "CareerRoadmap"
           SET "currentRole" = $1, "targetRole" = $2, "timelineMonths" = $3, "aiPlan" = $4, progress = 0, "updatedAt" = NOW()
           WHERE "userId" = $5`,
          [currentRole, targetRole, timelineMonths, JSON.stringify(aiPlan), userId]
        );
      } else {
        roadmapId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "CareerRoadmap" (id, "userId", "currentRole", "targetRole", "timelineMonths", "aiPlan", progress, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, 0, NOW(), NOW())`,
          [roadmapId, userId, currentRole, targetRole, timelineMonths, JSON.stringify(aiPlan)]
        );
      }

      // Insert milestones
      const now = new Date();
      if (aiPlan.milestones && aiPlan.milestones.length > 0) {
        const insertParts: string[] = [];
        const values: any[] = [];
        aiPlan.milestones.forEach((m: MilestoneItem, i: number) => {
          const dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + m.monthOffset);

          const base = i * 7;
          insertParts.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, FALSE, NOW())`);
          values.push(crypto.randomUUID(), roadmapId, m.title, m.description, m.category, i + 1, dueDate);
        });

        await client.query(
          `INSERT INTO "Milestone" (id, "roadmapId", title, description, category, "order", "dueDate", completed, "createdAt")
           VALUES ${insertParts.join(", ")}`,
          values
        );
      }

      // Fetch the fully joined roadmap
      const detailRes = await client.query(
        `SELECT r.*,
                (
                  SELECT json_agg(json_build_object(
                    'id', m.id,
                    'roadmapId', m."roadmapId",
                    'title', m.title,
                    'description', m.description,
                    'dueDate', m."dueDate",
                    'completed', m.completed,
                    'completedAt', m."completedAt",
                    'order', m."order",
                    'category', m.category,
                    'createdAt', m."createdAt"
                  ) ORDER BY m."order" ASC)
                  FROM "Milestone" m
                  WHERE m."roadmapId" = r.id
                ) AS milestones
         FROM "CareerRoadmap" r
         WHERE r.id = $1`,
        [roadmapId]
      );

      return detailRes.rows[0];
    });

    return NextResponse.json({
      ...fullRoadmap,
      milestones: fullRoadmap.milestones ?? [],
    }, { status: 201 });
  } catch (error) {
    console.error("Career roadmap POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

