import { db } from "@/lib/db";

export interface CourseFilterOptions {
  category?: string | null;
  level?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
}

export class LearningService {
  /**
   * Retrieves paginated courses by categories, levels, or search query.
   */
  static async getCourses(options: CourseFilterOptions): Promise<{ courses: any[]; total: number }> {
    const { category, level, search, page = 1, limit = 20 } = options;

    let queryText = 'SELECT * FROM "Course"';
    let countQueryText = 'SELECT COUNT(*)::int as count FROM "Course"';
    
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (category) {
      params.push(`%${category}%`);
      whereClauses.push(`"category" ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      whereClauses.push(`"level" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`("title" ILIKE $${params.length} OR "description" ILIKE $${params.length})`);
    }

    if (whereClauses.length > 0) {
      const whereStr = ` WHERE ${whereClauses.join(" AND ")}`;
      queryText += whereStr;
      countQueryText += whereStr;
    }

    queryText += ' ORDER BY "rating" DESC';

    const skip = (page - 1) * limit;
    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(skip);
    const skipParam = `$${params.length}`;

    queryText += ` LIMIT ${limitParam} OFFSET ${skipParam}`;

    const [coursesRes, totalRes] = await Promise.all([
      db.query(queryText, params),
      db.query(countQueryText, params.slice(0, params.length - 2))
    ]);

    return {
      courses: coursesRes.rows,
      total: totalRes.rows[0]?.count ?? 0,
    };
  }

  /**
   * Retrieves all course enrollments with course details for a user.
   */
  static async getEnrollments(userId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT ce.*, row_to_json(c.*) as course
       FROM "CourseEnrollment" ce
       JOIN "Course" c ON ce."courseId" = c.id
       WHERE ce."userId" = $1
       ORDER BY ce."updatedAt" DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Enrolls a user in a specific course (upsert).
   */
  static async enroll(userId: string, courseId: string): Promise<any> {
    const enrollmentRes = await db.query(
      `INSERT INTO "CourseEnrollment" (id, "userId", "courseId")
       VALUES ($1, $2, $3)
       ON CONFLICT ("userId", "courseId") DO UPDATE SET "userId" = EXCLUDED."userId"
       RETURNING *`,
      [globalThis.crypto.randomUUID(), userId, courseId]
    );
    return enrollmentRes.rows[0];
  }

  /**
   * Updates user enrollment progress and sets completion timestamp if progress is 100%.
   */
  static async updateProgress(userId: string, courseId: string, progress: number): Promise<any> {
    let queryText = 'UPDATE "CourseEnrollment" SET progress = $1, "updatedAt" = CURRENT_TIMESTAMP';
    const params = [progress, userId, courseId];
    
    if (progress >= 100) {
      queryText += ', "completedAt" = CURRENT_TIMESTAMP';
    }
    
    queryText += ' WHERE "userId" = $2 AND "courseId" = $3 RETURNING *';

    const enrollmentRes = await db.query(queryText, params);
    return enrollmentRes.rows[0] || null;
  }

  /**
   * Generates skill-matching and role-matching course recommendations for a user.
   */
  static async getRecommendations(userId: string): Promise<any[]> {
    const profileRes = await db.query(
      'SELECT * FROM "Profile" WHERE "userId" = $1 LIMIT 1',
      [userId]
    );
    const profile = profileRes.rows[0];

    const enrolledRes = await db.query(
      'SELECT "courseId" FROM "CourseEnrollment" WHERE "userId" = $1',
      [userId]
    );
    const enrolledCourseIds = enrolledRes.rows.map(e => e.courseId);

    const targetRole = profile?.targetRole ?? "";

    let queryText = 'SELECT * FROM "Course"';
    const params: any[] = [];

    if (enrolledCourseIds.length > 0) {
      params.push(enrolledCourseIds);
      queryText += ` WHERE NOT (id = ANY($${params.length}))`;
    }

    queryText += ' ORDER BY "rating" DESC LIMIT 50';

    const coursesRes = await db.query(queryText, params);
    const allCourses = coursesRes.rows;

    const userSkillsArr = (profile?.skills as string[]) ?? [];
    const keyword = targetRole.split(" ")[0]?.toLowerCase() ?? "";

    const filtered = allCourses.filter((c) => {
      const courseSkills = (c.skills as string[]) ?? [];
      const titleMatch = keyword && c.title.toLowerCase().includes(keyword);
      const skillMatch = userSkillsArr.some((s) =>
        courseSkills.some((cs) => cs.toLowerCase().includes(s.toLowerCase()))
      );
      return titleMatch || skillMatch;
    });

    const courses = (filtered.length > 0 ? filtered : allCourses).slice(0, 6);
    return courses;
  }
}
