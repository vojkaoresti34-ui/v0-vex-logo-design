import { db } from "@/lib/db";
import crypto from "crypto";

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  weeklyDigest: boolean;
  autoApplyEnabled: boolean;
  theme: string;
  language: string;
  timezone: string;
  profileVisibility: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  currentRole?: string;
  targetRole?: string;
  yearsExperience?: number;
  salaryMin?: number;
  salaryMax?: number;
  jobTypes?: string[];
  industries?: string[];
  avatarUrl?: string;
  avatarKey?: string;
  isPublic: boolean;
  onboardingDone: boolean;
  goal?: string;
  tone?: string;
  blacklistCompanies?: string[];
  employmentStatus?: string;
  startDate?: string;
  workAuth?: string;
  country?: string;
  skills?: string[];
  languages?: string[];
  biggestWin?: string;
  profileStrength: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name?: string;
    email?: string;
    image?: string;
    plan?: string;
    createdAt?: Date;
  };
}

export class UserService {
  /**
   * Retrieves or initializes user settings.
   */
  static async getSettings(userId: string): Promise<UserSettings> {
    const { rows } = await db.query(
      `SELECT * FROM "UserSettings" WHERE "userId" = $1`,
      [userId]
    );
    let settings = rows[0];

    if (!settings) {
      const id = crypto.randomUUID();
      const insertResult = await db.query(
        `INSERT INTO "UserSettings" (id, "userId")
         VALUES ($1, $2)
         RETURNING *`,
        [id, userId]
      );
      settings = insertResult.rows[0];
    }

    return settings;
  }

  /**
   * Updates user settings.
   */
  static async updateSettings(userId: string, body: any): Promise<UserSettings> {
    const allowedFields = [
      "emailNotifications",
      "jobAlerts",
      "applicationUpdates",
      "weeklyDigest",
      "autoApplyEnabled",
      "theme",
      "language",
      "timezone",
      "profileVisibility",
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`"${field}" = $${index++}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return this.getSettings(userId);
    }

    values.push(userId);
    const updateQuery = `
      UPDATE "UserSettings"
      SET ${updates.join(", ")}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "userId" = $${index}
      RETURNING *
    `;

    const { rows } = await db.query(updateQuery, values);
    let settings = rows[0];

    if (!settings) {
      const id = crypto.randomUUID();
      const insertFields = ["id", '"userId"'];
      const insertValues = [id, userId];
      const placeholders = ["$1", "$2"];
      let insIdx = 3;

      for (const field of allowedFields) {
        if (field in body) {
          insertFields.push(`"${field}"`);
          insertValues.push(body[field]);
          placeholders.push(`$${insIdx++}`);
        }
      }

      const insertResult = await db.query(
        `INSERT INTO "UserSettings" (${insertFields.join(", ")})
         VALUES (${placeholders.join(", ")})
         RETURNING *`,
        insertValues
      );
      settings = insertResult.rows[0];
    }

    return settings;
  }

  /**
   * Retrieves and calculates a user profile's strength.
   */
  static async getProfile(userId: string): Promise<UserProfile> {
    const profileResult = await db.query(
      `SELECT p.*,
              u.name AS "userName", u.email AS "userEmail", u.image AS "userImage", u.plan AS "userPlan", u."createdAt" AS "userCreatedAt"
       FROM "Profile" p
       JOIN "User" u ON p."userId" = u.id
       WHERE p."userId" = $1`,
      [userId]
    );
    let profile = profileResult.rows[0];

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Map user fields to match the nested shape expected by Next.js components
    profile.user = {
      name: profile.userName,
      email: profile.userEmail,
      image: profile.userImage,
      plan: profile.userPlan,
      createdAt: profile.userCreatedAt,
    };

    // Calculate profile strength
    let strength = 0;
    if (profile.user.name) strength += 10;
    if (profile.user.image) strength += 10;
    if (profile.headline) strength += 10;
    if (profile.bio) strength += 10;
    if (profile.location) strength += 5;
    if (profile.linkedinUrl) strength += 15;
    if (profile.currentRole) strength += 10;
    if (profile.targetRole) strength += 10;

    const skillsLen = Array.isArray(profile.skills) ? profile.skills.length : 0;
    if (skillsLen > 0) strength += 10;
    if (profile.phone) strength += 5;
    if (profile.githubUrl) strength += 5;

    await db.query(
      `UPDATE "Profile" SET "profileStrength" = $1 WHERE "userId" = $2`,
      [strength, userId]
    );

    profile.profileStrength = strength;
    return profile;
  }

  /**
   * Updates user profile fields and username.
   */
  static async updateProfile(userId: string, name: string | undefined, profileData: any): Promise<any> {
    const allowedFields = [
      "headline", "bio", "location", "phone", "website",
      "linkedinUrl", "githubUrl", "twitterUrl", "currentRole", "targetRole",
      "yearsExperience", "salaryMin", "salaryMax", "jobTypes", "industries",
      "avatarUrl", "avatarKey", "isPublic", "onboardingDone", "goal",
      "tone", "blacklistCompanies", "employmentStatus", "startDate",
      "workAuth", "country", "skills", "languages", "biggestWin"
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const field of allowedFields) {
      if (field in profileData) {
        updates.push(`"${field}" = $${index++}`);
        const val = ["jobTypes", "industries", "blacklistCompanies", "skills", "languages"].includes(field) && profileData[field]
          ? JSON.stringify(profileData[field])
          : profileData[field];
        values.push(val !== undefined ? val : null);
      }
    }

    const updatedProfile = await db.transaction(async (client) => {
      let pResult = null;
      if (updates.length > 0) {
        values.push(userId);
        const res = await client.query(
          `UPDATE "Profile"
           SET ${updates.join(", ")}, "updatedAt" = CURRENT_TIMESTAMP
           WHERE "userId" = $${index}
           RETURNING *`,
          values
        );
        pResult = res.rows[0];
      } else {
        const res = await client.query(`SELECT * FROM "Profile" WHERE "userId" = $1`, [userId]);
        pResult = res.rows[0];
      }

      if (name !== undefined) {
        await client.query(
          `UPDATE "User" SET name = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
          [name, userId]
        );
      }

      return pResult;
    });

    await db.query(
      `INSERT INTO "ActivityLog" (id, "userId", action, entity)
       VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), userId, "profile.updated", "profile"]
    );

    return updatedProfile;
  }

  /**
   * Submits user onboarding answers and constructs/creates a profile.
   */
  static async completeOnboarding(userId: string, data: any): Promise<boolean> {
    const skillsArray = data.skills ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    const languagesArray = data.languages ? data.languages.split(",").map((l: string) => l.trim()).filter(Boolean) : [];
    const industriesArray = data.industries ? data.industries.split(",").map((i: string) => i.trim()).filter(Boolean) : [];

    const profileId = crypto.randomUUID();
    const parsedExp = data.yearsExperience ? parseInt(data.yearsExperience) : null;
    const yearsExperience = parsedExp !== null && !isNaN(parsedExp) ? parsedExp : null;
    const blacklistCompanies = JSON.stringify(data.blacklistCompanies ?? []);
    const skillsJson = JSON.stringify(skillsArray);
    const languagesJson = JSON.stringify(languagesArray);
    const industriesJson = JSON.stringify(industriesArray);

    await db.query(
      `INSERT INTO "Profile" (
         id, "userId", goal, "currentRole", "targetRole", "employmentStatus",
         "yearsExperience", country, "workAuth", "startDate", "biggestWin",
         tone, "blacklistCompanies", skills, languages, industries,
         "linkedinUrl", "githubUrl", "onboardingDone"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT ("userId") DO UPDATE SET
         goal = EXCLUDED.goal,
         "currentRole" = EXCLUDED."currentRole",
         "targetRole" = EXCLUDED."targetRole",
         "employmentStatus" = EXCLUDED."employmentStatus",
         "yearsExperience" = EXCLUDED."yearsExperience",
         country = EXCLUDED.country,
         "workAuth" = EXCLUDED."workAuth",
         "startDate" = EXCLUDED."startDate",
         "biggestWin" = EXCLUDED."biggestWin",
         tone = EXCLUDED.tone,
         "blacklistCompanies" = EXCLUDED."blacklistCompanies",
         skills = EXCLUDED.skills,
         languages = EXCLUDED.languages,
         industries = EXCLUDED.industries,
         "linkedinUrl" = EXCLUDED."linkedinUrl",
         "githubUrl" = EXCLUDED."githubUrl",
         "onboardingDone" = EXCLUDED."onboardingDone",
         "updatedAt" = CURRENT_TIMESTAMP`,
      [
        profileId,
        userId,
        data.goal || null,
        data.currentRole || null,
        data.targetRole || null,
        data.employmentStatus || null,
        yearsExperience,
        data.country || null,
        data.workAuth || null,
        data.startDate || null,
        data.biggestWin || null,
        data.tone || null,
        blacklistCompanies,
        skillsJson,
        languagesJson,
        industriesJson,
        data.linkedinUrl || null,
        data.githubUrl || null,
        true,
      ]
    );

    await db.query(
      `INSERT INTO "ActivityLog" (id, "userId", action)
       VALUES ($1, $2, $3)`,
      [crypto.randomUUID(), userId, "onboarding.completed"]
    );

    return true;
  }

  /**
   * Retrieves activity log entries for a user.
   */
  static async getActivityLogs(userId: string, limit = 20): Promise<any[]> {
    const result = await db.query(
      `SELECT * FROM "ActivityLog"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  /**
   * Admin: Retrieves a paginated list of users with search filters.
   */
  static async getUsersAdmin(search: string, page: number, limit: number): Promise<{ users: any[]; total: number }> {
    let queryText = `
      SELECT u.id, u.name, u.email, u.role, u.plan, u."createdAt",
             (SELECT COUNT(*)::int FROM "Application" a WHERE a."userId" = u.id) as "appCount",
             (SELECT COUNT(*)::int FROM "Resume" r WHERE r."userId" = u.id) as "resCount",
             p."onboardingDone" as "profileOnboardingDone",
             p."profileStrength" as "profileStrength"
      FROM "User" u
      LEFT JOIN "Profile" p ON u.id = p."userId"
    `;

    let countQueryText = 'SELECT COUNT(*)::int as count FROM "User" u';

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      const searchStr = `(u.name ILIKE $1 OR u.email ILIKE $1)`;
      whereClauses.push(searchStr);
    }

    if (whereClauses.length > 0) {
      const whereStr = ` WHERE ${whereClauses.join(" AND ")}`;
      queryText += whereStr;
      countQueryText += whereStr;
    }

    queryText += ' ORDER BY u."createdAt" DESC';

    const skip = (page - 1) * limit;
    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(skip);
    const skipParam = `$${params.length}`;

    queryText += ` LIMIT ${limitParam} OFFSET ${skipParam}`;

    const [usersRes, totalRes] = await Promise.all([
      db.query(queryText, params),
      db.query(countQueryText, params.slice(0, params.length - 2))
    ]);

    const users = usersRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      plan: row.plan,
      createdAt: row.createdAt,
      _count: {
        applications: row.appCount,
        resumes: row.resCount,
      },
      profile: row.profileOnboardingDone !== null ? {
        onboardingDone: row.profileOnboardingDone,
        profileStrength: row.profileStrength,
      } : null,
    }));

    const total = totalRes.rows[0]?.count ?? 0;

    return { users, total };
  }

  /**
   * Admin: Updates a user's subscription or privilege plan.
   */
  static async updateUserPlanAdmin(userId: string, plan: string): Promise<any> {
    const { rows } = await db.query(
      `UPDATE "User"
       SET plan = $1, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, plan`,
      [plan, userId]
    );

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    return rows[0];
  }
}
