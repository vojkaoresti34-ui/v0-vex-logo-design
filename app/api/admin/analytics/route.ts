import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsersRes,
      newUsersThisMonthRes,
      newUsersThisWeekRes,
      totalApplicationsRes,
      applicationsThisMonthRes,
      totalResumesRes,
      totalJobsRes,
      usersByPlanRes,
      recentActivityRes,
      topActionsRes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int as count FROM "User"'),
      db.query('SELECT COUNT(*)::int as count FROM "User" WHERE "createdAt" >= $1', [thirtyDaysAgo]),
      db.query('SELECT COUNT(*)::int as count FROM "User" WHERE "createdAt" >= $1', [sevenDaysAgo]),
      db.query('SELECT COUNT(*)::int as count FROM "Application"'),
      db.query('SELECT COUNT(*)::int as count FROM "Application" WHERE "createdAt" >= $1', [thirtyDaysAgo]),
      db.query('SELECT COUNT(*)::int as count FROM "Resume"'),
      db.query('SELECT COUNT(*)::int as count FROM "Job" WHERE "isActive" = true'),
      db.query('SELECT plan, COUNT(*)::int as count FROM "User" GROUP BY plan'),
      db.query(
        `SELECT al.*, json_build_object('name', u.name, 'email', u.email) as user
         FROM "ActivityLog" al
         JOIN "User" u ON al."userId" = u.id
         ORDER BY al."createdAt" DESC
         LIMIT 20`
      ),
      db.query(
        `SELECT action, COUNT(*)::int as count
         FROM "ActivityLog"
         GROUP BY action
         ORDER BY count DESC
         LIMIT 10`
      ),
    ]);

    const totalUsers = totalUsersRes.rows[0]?.count ?? 0;
    const newUsersThisMonth = newUsersThisMonthRes.rows[0]?.count ?? 0;
    const newUsersThisWeek = newUsersThisWeekRes.rows[0]?.count ?? 0;
    const totalApplications = totalApplicationsRes.rows[0]?.count ?? 0;
    const applicationsThisMonth = applicationsThisMonthRes.rows[0]?.count ?? 0;
    const totalResumes = totalResumesRes.rows[0]?.count ?? 0;
    const totalJobs = totalJobsRes.rows[0]?.count ?? 0;

    const usersByPlan = usersByPlanRes.rows.map(row => ({
      plan: row.plan,
      _count: row.count,
    }));
    const recentActivity = recentActivityRes.rows;
    const topActions = topActionsRes.rows.map(row => ({
      action: row.action,
      _count: row.count,
    }));

    const planMap = usersByPlan.reduce((acc: any, item) => {
      acc[item.plan] = item._count;
      return acc;
    }, {});

    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        newThisWeek: newUsersThisWeek,
        byPlan: planMap,
      },
      applications: {
        total: totalApplications,
        thisMonth: applicationsThisMonth,
      },
      resumes: { total: totalResumes },
      jobs: { active: totalJobs },
      recentActivity,
      topActions,
    });
  } catch (error) {
    console.error("[ADMIN_ANALYTICS_GET]", error);
    return NextResponse.json({ error: "Failed to generate admin analytics" }, { status: 500 });
  }
}

