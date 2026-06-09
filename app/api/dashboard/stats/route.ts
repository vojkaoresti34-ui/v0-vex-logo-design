import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const [
      byStatusRes,
      totalAppsRes,
      totalResumesRes,
      activeResumeRes,
      unreadNotifsRes,
      recentActivityRes,
      profileRes,
      enrollmentsRes,
    ] = await Promise.all([
      db.query(
        `SELECT status, COUNT(*)::int AS count
         FROM "Application"
         WHERE "userId" = $1
         GROUP BY status`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Application" WHERE "userId" = $1`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Resume" WHERE "userId" = $1`,
        [userId]
      ),
      db.query(
        `SELECT * FROM "Resume" WHERE "userId" = $1 AND "isDefault" = TRUE LIMIT 1`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Notification" WHERE "userId" = $1 AND "isRead" = FALSE`,
        [userId]
      ),
      db.query(
        `SELECT * FROM "ActivityLog" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10`,
        [userId]
      ),
      db.query(
        `SELECT "profileStrength" FROM "Profile" WHERE "userId" = $1 LIMIT 1`,
        [userId]
      ),
      db.query(
        `SELECT ce.*, 
                json_build_object(
                  'id', c.id,
                  'title', c.title,
                  'description', c.description,
                  'instructor', c.instructor,
                  'thumbnail', c.thumbnail,
                  'url', c.url,
                  'duration', c.duration,
                  'level', c.level,
                  'category', c.category,
                  'skills', c.skills,
                  'rating', c.rating,
                  'isFree', c."isFree",
                  'source', c.source,
                  'createdAt', c."createdAt"
                ) AS course
         FROM "CourseEnrollment" ce
         JOIN "Course" c ON ce."courseId" = c.id
         WHERE ce."userId" = $1
         LIMIT 3`,
        [userId]
      )
    ]);

    const statusMap = byStatusRes.rows.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        totalApplications: totalAppsRes.rows[0]?.count ?? 0,
        applied: statusMap.APPLIED ?? 0,
        interviewing: statusMap.INTERVIEWING ?? 0,
        offered: statusMap.OFFERED ?? 0,
        rejected: statusMap.REJECTED ?? 0,
        saved: statusMap.SAVED ?? 0,
      },
      totalResumes: totalResumesRes.rows[0]?.count ?? 0,
      activeResume: activeResumeRes.rows[0] ?? null,
      unreadNotifications: unreadNotifsRes.rows[0]?.count ?? 0,
      recentActivity: recentActivityRes.rows,
      profileStrength: profileRes.rows[0]?.profileStrength ?? 0,
      enrollments: enrollmentsRes.rows,
    });
  } catch (error) {
    console.error("Dashboard stats GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

