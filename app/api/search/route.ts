import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const userId = session.user.id;
  const searchPattern = `%${q}%`;

  try {
    const [jobsRes, resumesRes, appsRes] = await Promise.all([
      db.query(
        `SELECT id, title, company FROM "Job" 
         WHERE "isActive" = TRUE AND (title ILIKE $1 OR company ILIKE $1) 
         LIMIT 5`,
        [searchPattern]
      ),
      db.query(
        `SELECT id, title FROM "Resume" 
         WHERE "userId" = $1 AND title ILIKE $2 
         LIMIT 3`,
        [userId, searchPattern]
      ),
      db.query(
        `SELECT id, "jobTitle", company FROM "Application" 
         WHERE "userId" = $1 AND (company ILIKE $2 OR "jobTitle" ILIKE $2) 
         LIMIT 3`,
        [userId, searchPattern]
      )
    ]);

    const jobs = jobsRes.rows;
    const resumes = resumesRes.rows;
    const applications = appsRes.rows;

    return NextResponse.json({
      results: [
        ...jobs.map(j => ({ type: "job", id: j.id, title: j.title, subtitle: j.company, href: `/app/job-board` })),
        ...resumes.map(r => ({ type: "resume", id: r.id, title: r.title, subtitle: "Resume", href: `/app/resume-builder` })),
        ...applications.map(a => ({ type: "application", id: a.id, title: a.jobTitle, subtitle: a.company, href: `/app/jobs/tracker` })),
      ],
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

