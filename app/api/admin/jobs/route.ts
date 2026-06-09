import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const jobId = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO "Job" (
        id, title, company, location, type, salary, "salaryMin", "salaryMax",
        description, requirements, skills, benefits, remote, source, "sourceUrl",
        "logoUrl", industry, "experienceLevel", "expiresAt"
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        jobId,
        body.title,
        body.company,
        body.location || null,
        body.type ?? "FULL_TIME",
        body.salary || null,
        body.salaryMin || null,
        body.salaryMax || null,
        body.description,
        body.requirements ? JSON.stringify(body.requirements) : null,
        body.skills ? JSON.stringify(body.skills) : null,
        body.benefits ? JSON.stringify(body.benefits) : null,
        body.remote ?? false,
        body.source || null,
        body.sourceUrl || null,
        body.logoUrl || null,
        body.industry || null,
        body.experienceLevel ?? "MID",
        body.expiresAt ? new Date(body.expiresAt) : null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[ADMIN_JOBS_POST]", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const [jobsRes, totalRes] = await Promise.all([
      db.query(
        `SELECT j.*, COUNT(a.id)::int as "applicationCount"
         FROM "Job" j
         LEFT JOIN "Application" a ON j.id = a."jobId"
         GROUP BY j.id
         ORDER BY j."createdAt" DESC
         LIMIT $1 OFFSET $2`,
        [limit, skip]
      ),
      db.query('SELECT COUNT(*)::int as count FROM "Job"'),
    ]);

    const jobs = jobsRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      type: row.type,
      salary: row.salary,
      salaryMin: row.salaryMin,
      salaryMax: row.salaryMax,
      description: row.description,
      requirements: row.requirements,
      skills: row.skills,
      benefits: row.benefits,
      remote: row.remote,
      source: row.source,
      sourceUrl: row.sourceUrl,
      postedAt: row.postedAt,
      expiresAt: row.expiresAt,
      isActive: row.isActive,
      logoUrl: row.logoUrl,
      industry: row.industry,
      experienceLevel: row.experienceLevel,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: {
        applications: row.applicationCount,
      },
    }));

    const total = totalRes.rows[0]?.count ?? 0;

    return NextResponse.json({ jobs, total });
  } catch (error) {
    console.error("[ADMIN_JOBS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

