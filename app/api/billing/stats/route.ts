import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const cycleStart = new Date();
    cycleStart.setDate(1);
    cycleStart.setHours(0, 0, 0, 0);

    const [appsRes, coverLettersRes, interviewsRes, totalAppsRes, totalCLRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Application"
         WHERE "userId" = $1 AND "createdAt" >= $2`,
        [userId, cycleStart]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "CoverLetter"
         WHERE "userId" = $1 AND "createdAt" >= $2`,
        [userId, cycleStart]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "InterviewSession"
         WHERE "userId" = $1 AND "startedAt" >= $2`,
        [userId, cycleStart]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Application" WHERE "userId" = $1`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "CoverLetter" WHERE "userId" = $1`,
        [userId]
      ),
    ]);

    const cycleApps = appsRes.rows[0]?.count ?? 0;
    const cycleInterviews = interviewsRes.rows[0]?.count ?? 0;
    const cycleCoverLetters = coverLettersRes.rows[0]?.count ?? 0;

    // Estimate time saved: ~12 min per application, ~8 min per cover letter, ~20 min per mock interview
    const timeSavedMinutes = cycleApps * 12 + cycleCoverLetters * 8 + cycleInterviews * 20;
    const timeSavedHours = Math.round(timeSavedMinutes / 60 * 10) / 10;

    return NextResponse.json({
      plan: session.user.plan,
      cycleStart: cycleStart.toISOString(),
      cycle: {
        applications: cycleApps,
        coverLetters: cycleCoverLetters,
        interviews: cycleInterviews,
        timeSavedHours,
      },
      lifetime: {
        applications: totalAppsRes.rows[0]?.count ?? 0,
        coverLetters: totalCLRes.rows[0]?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("[BILLING_STATS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
