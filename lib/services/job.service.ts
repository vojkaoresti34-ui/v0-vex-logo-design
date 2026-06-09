import { db } from "@/lib/db";
import crypto from "crypto";
import { eventEmitter, APP_EVENTS } from "./events";


export class JobService {
  /**
   * Retrieves a paginated list of jobs based on filters.
   */
  static async getJobs(filters: {
    search?: string;
    type?: string;
    remote?: string;
    location?: string;
    industry?: string;
  }, limit: number, skip: number): Promise<{ jobs: any[]; total: number }> {
    const conditions: string[] = ['"isActive" = TRUE'];
    const values: any[] = [];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      conditions.push(`(title ILIKE $${values.length} OR company ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }
    if (filters.type) {
      values.push(filters.type);
      conditions.push(`type = $${values.length}`);
    }
    if (filters.remote === "true") {
      conditions.push(`remote = TRUE`);
    }
    if (filters.location) {
      values.push(`%${filters.location}%`);
      conditions.push(`location ILIKE $${values.length}`);
    }
    if (filters.industry) {
      values.push(`%${filters.industry}%`);
      conditions.push(`industry ILIKE $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    const countQuery = `SELECT COUNT(*)::int AS count FROM "Job" WHERE ${whereClause}`;
    const countRes = await db.query(countQuery, values);
    const total = countRes.rows[0]?.count ?? 0;

    const selectQuery = `
      SELECT * FROM "Job" 
      WHERE ${whereClause} 
      ORDER BY "postedAt" DESC 
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    const selectRes = await db.query(selectQuery, [...values, limit, skip]);
    const jobs = selectRes.rows;

    return { jobs, total };
  }

  /**
   * Retrieves details of a specific job by ID.
   */
  static async getJobById(id: string): Promise<any> {
    const { rows: [job] } = await db.query(
      `SELECT * FROM "Job" WHERE id = $1 LIMIT 1`,
      [id]
    );
    return job;
  }

  /**
   * Admin: Creates a new job posting.
   */
  static async createJob(body: any): Promise<any> {
    const {
      title, company, location = null, type = 'FULL_TIME', salary = null,
      salaryMin = null, salaryMax = null, description, requirements = null,
      skills = null, benefits = null, remote = false, source = null,
      sourceUrl = null, expiresAt = null, isActive = true, logoUrl = null,
      industry = null, experienceLevel = 'MID'
    } = body;

    const jobId = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO "Job" (
         id, title, company, location, type, salary, "salaryMin", "salaryMax", 
         description, requirements, skills, benefits, remote, source, "sourceUrl", 
         "postedAt", "expiresAt", "isActive", "logoUrl", industry, "experienceLevel", 
         "createdAt", "updatedAt"
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), $16, $17, $18, $19, $20, NOW(), NOW())
       RETURNING *`,
      [
        jobId,
        title,
        company,
        location,
        type,
        salary,
        salaryMin,
        salaryMax,
        description,
        requirements ? JSON.stringify(requirements) : null,
        skills ? JSON.stringify(skills) : null,
        benefits ? JSON.stringify(benefits) : null,
        remote,
        source,
        sourceUrl,
        expiresAt,
        isActive,
        logoUrl,
        industry,
        experienceLevel
      ]
    );

    return result.rows[0];
  }

  /**
   * Retrieves saved jobs for a user.
   */
  static async getSavedJobs(userId: string): Promise<any[]> {
    const { rows } = await db.query(
      `SELECT j.*
       FROM "SavedJob" sj
       JOIN "Job" j ON sj."jobId" = j.id
       WHERE sj."userId" = $1
       ORDER BY sj."createdAt" DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Saves or unsaves a job for a user (toggles saved status).
   */
  static async toggleSaveJob(userId: string, jobId: string): Promise<{ saved: boolean }> {
    return db.transaction(async (client) => {
      const existingRes = await client.query(
        `SELECT 1 FROM "SavedJob" 
         WHERE "userId" = $1 AND "jobId" = $2 
         LIMIT 1`,
        [userId, jobId]
      );

      const existing = existingRes.rows[0];

      if (existing) {
        await client.query(
          `DELETE FROM "SavedJob" 
           WHERE "userId" = $1 AND "jobId" = $2`,
          [userId, jobId]
        );
        return { saved: false };
      } else {
        const id = crypto.randomUUID();
        await client.query(
          `INSERT INTO "SavedJob" (id, "userId", "jobId", "createdAt")
           VALUES ($1, $2, $3, NOW())`,
          [id, userId, jobId]
        );
        return { saved: true };
      }
    });
  }

  /**
   * Runs skill-based and industry-based matching algorithms against active jobs.
   */
  static async getJobMatches(userId: string): Promise<any[]> {
    const profileRes = await db.query(
      'SELECT * FROM "Profile" WHERE "userId" = $1 LIMIT 1',
      [userId]
    );
    const profile = profileRes.rows[0];
    if (!profile) return [];

    const userSkills = (profile.skills as string[]) ?? [];
    const userIndustries = ((profile.industries as string[]) ?? []).map((i) => i.toLowerCase());
    const targetRole = (profile.targetRole ?? "").toLowerCase();

    const jobsRes = await db.query(
      'SELECT * FROM "Job" WHERE "isActive" = true ORDER BY "postedAt" DESC LIMIT 100'
    );
    const jobs = jobsRes.rows;

    const scored = jobs
      .map((job) => {
        const jobSkills = (job.skills as string[]) ?? [];
        let score = 0;
        const matchedSkills = userSkills.filter((s) =>
          jobSkills.some((js) => js.toLowerCase().includes(s.toLowerCase()))
        );
        score += matchedSkills.length * 10;
        if (targetRole && job.title.toLowerCase().includes(targetRole)) score += 30;
        if (userIndustries.includes((job.industry ?? "").toLowerCase())) score += 20;
        return { ...job, matchScore: Math.min(score, 100), matchedSkills };
      })
      .filter((j) => j.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    const result = scored.length > 0
      ? scored
      : jobs.slice(0, 10).map((j) => ({ ...j, matchScore: 0, matchedSkills: [] }));

    return result;
  }

  /**
   * Retrieves applications with pagination and status filters.
   */
  static async getApplications(userId: string, status: string | null, limit: number, offset: number): Promise<{ applications: any[]; total: number }> {
    // Retrieve applications count
    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count 
       FROM "Application" 
       WHERE "userId" = $1 AND ($2::text IS NULL OR status = $2)`,
      [userId, status || null]
    );
    const total = countResult.rows[0].count;

    // Retrieve applications with join relations
    const { rows } = await db.query(
      `SELECT 
         a.*,
         r.id AS "resumeIdRelation", r.title AS "resumeTitle",
         c.id AS "coverLetterIdRelation", c.title AS "coverLetterTitle",
         j.id AS "jobIdRelation", j.title AS "jobTitleRelation", j.company AS "jobCompany", j.logoUrl AS "jobLogoUrl"
       FROM "Application" a
       LEFT JOIN "Resume" r ON a."resumeId" = r.id
       LEFT JOIN "CoverLetter" c ON a."coverLetterId" = c.id
       LEFT JOIN "Job" j ON a."jobId" = j.id
       WHERE a."userId" = $1 AND ($2::text IS NULL OR a.status = $2)
       ORDER BY a."updatedAt" DESC
       LIMIT $3 OFFSET $4`,
      [userId, status || null, limit, offset]
    );

    const applications = rows.map(r => ({
      ...r,
      resume: r.resumeIdRelation ? { id: r.resumeIdRelation, title: r.resumeTitle } : null,
      coverLetter: r.coverLetterIdRelation ? { id: r.coverLetterIdRelation, title: r.coverLetterTitle } : null,
      job: r.jobIdRelation ? { id: r.jobIdRelation, title: r.jobTitleRelation, company: r.jobCompany, logoUrl: r.jobLogoUrl } : null,
    }));

    return { applications, total };
  }

  /**
   * Submits a new job application card.
   */
  static async createApplication(userId: string, data: any): Promise<any> {
    const id = crypto.randomUUID();
    const appliedAt = data.status === "APPLIED" ? new Date() : null;

    const allowedFields = [
      "jobId", "resumeId", "coverLetterId", "company", "jobTitle", "jobUrl",
      "status", "notes", "salary", "contacts", "nextAction", "nextActionDate",
      "isAutoApplied", "source", "priority"
    ];

    const fields = ["id", '"userId"', '"appliedAt"'];
    const placeholders = ["$1", "$2", "$3"];
    const values = [id, userId, appliedAt];
    let index = 4;

    for (const field of allowedFields) {
      if (field in data) {
        fields.push(`"${field}"`);
        placeholders.push(`$${index++}`);
        const val = field === "contacts" && data[field] ? JSON.stringify(data[field]) : data[field];
        values.push(val !== undefined ? val : null);
      }
    }

    const { rows } = await db.query(
      `INSERT INTO "Application" (${fields.join(", ")})
       VALUES (${placeholders.join(", ")})
       RETURNING *`,
      values
    );
    const application = rows[0];

    // Create status history log
    await db.query(
      `INSERT INTO "ApplicationStatusHistory" (id, "applicationId", status)
       VALUES ($1, $2, $3)`,
      [crypto.randomUUID(), application.id, application.status]
    );

    // Log the action
    await db.query(
      `INSERT INTO "ActivityLog" (id, "userId", action, entity, "entityId", metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        crypto.randomUUID(),
        userId,
        "application.created",
        "application",
        application.id,
        JSON.stringify({ company: data.company, jobTitle: data.jobTitle })
      ]
    );

    return application;
  }

  /**
   * Retrieves complete application details including histories, resume, and coaching.
   */
  static async getApplicationDetails(userId: string, id: string): Promise<any> {
    // Retrieve the application details
    const appResult = await db.query(
      `SELECT * FROM "Application" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );
    const app = appResult.rows[0];

    if (!app) return null;

    // Get status history
    const historyResult = await db.query(
      `SELECT * FROM "ApplicationStatusHistory" WHERE "applicationId" = $1 ORDER BY "createdAt" DESC`,
      [id]
    );
    app.statusHistory = historyResult.rows;

    // Get associated resume details
    if (app.resumeId) {
      const resumeResult = await db.query(`SELECT * FROM "Resume" WHERE id = $1`, [app.resumeId]);
      app.resume = resumeResult.rows[0] || null;
    } else {
      app.resume = null;
    }

    // Get associated cover letter details
    if (app.coverLetterId) {
      const clResult = await db.query(`SELECT * FROM "CoverLetter" WHERE id = $1`, [app.coverLetterId]);
      app.coverLetter = clResult.rows[0] || null;
    } else {
      app.coverLetter = null;
    }

    // Get associated job details
    if (app.jobId) {
      const jobResult = await db.query(`SELECT * FROM "Job" WHERE id = $1`, [app.jobId]);
      app.job = jobResult.rows[0] || null;
    } else {
      app.job = null;
    }

    // Get interview sessions
    const interviewsResult = await db.query(
      `SELECT * FROM "InterviewSession" WHERE "applicationId" = $1 ORDER BY "createdAt" DESC LIMIT 5`,
      [id]
    );
    app.interviews = interviewsResult.rows;

    return app;
  }

  /**
   * Modifies columns on a specific application card.
   */
  static async updateApplication(userId: string, id: string, data: any): Promise<any> {
    const existingResult = await db.query(
      `SELECT * FROM "Application" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );
    const application = existingResult.rows[0];
    if (!application) return null;

    let appliedAt = application.appliedAt;
    if (data.status === "APPLIED" && !application.appliedAt) {
      appliedAt = new Date();
    }

    const allowedFields = [
      "jobId", "resumeId", "coverLetterId", "company", "jobTitle", "jobUrl",
      "status", "notes", "salary", "contacts", "nextAction", "nextActionDate",
      "isAutoApplied", "source", "priority"
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const field of allowedFields) {
      if (field in data) {
        updates.push(`"${field}" = $${index++}`);
        const val = field === "contacts" && data[field] ? JSON.stringify(data[field]) : data[field];
        values.push(val !== undefined ? val : null);
      }
    }

    if (appliedAt !== application.appliedAt) {
      updates.push(`"appliedAt" = $${index++}`);
      values.push(appliedAt);
    }

    if (updates.length === 0) {
      return application;
    }

    values.push(id);
    values.push(userId);

    const { rows } = await db.query(
      `UPDATE "Application"
       SET ${updates.join(", ")}, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $${index} AND "userId" = $${index + 1}
       RETURNING *`,
      values
    );

    const updated = rows[0];
    if (!updated) return null;

    if (data.status && data.status !== application.status) {
      await db.query(
        `INSERT INTO "ApplicationStatusHistory" (id, "applicationId", status, notes)
         VALUES ($1, $2, $3, $4)`,
        [crypto.randomUUID(), id, data.status, data.notes || null]
      );
    }

    return updated;
  }

  /**
   * Deletes a specific application card.
   */
  static async deleteApplication(userId: string, id: string): Promise<boolean> {
    const result = await db.query(
      `DELETE FROM "Application" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Shifts workflow state status and triggers transactional push notifications.
   */
  static async updateApplicationStatus(userId: string, id: string, status: string, notes: string | null): Promise<any> {
    const existingResult = await db.query(
      `SELECT * FROM "Application" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );
    const application = existingResult.rows[0];
    if (!application) return null;

    const appliedAt = status === "APPLIED" && !application.appliedAt ? new Date() : application.appliedAt;

    return db.transaction(async (client) => {
      // 1. Update Application status and appliedAt
      const updateRes = await client.query(
        `UPDATE "Application"
         SET status = $1, "appliedAt" = $2, "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, appliedAt, id]
      );

      // 2. Insert into status history log
      await client.query(
        `INSERT INTO "ApplicationStatusHistory" (id, "applicationId", status, notes)
         VALUES ($1, $2, $3, $4)`,
        [crypto.randomUUID(), id, status, notes || null]
      );

      // 3. Create a notification
      await client.query(
        `INSERT INTO "Notification" (id, "userId", type, title, message, link)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          crypto.randomUUID(),
          userId,
          "APPLICATION_UPDATE",
          "Application Updated",
          `${application.jobTitle} at ${application.company} → ${status}`,
          `/app/jobs/tracker`
        ]
      );

      return updateRes.rows[0];
    });
  }

  /**
   * Retrieves the current AutoApply settings configuration.
   */
  static async getAutoApplyConfig(userId: string): Promise<any> {
    const configRes = await db.query(
      'SELECT * FROM "AutoApplyConfig" WHERE "userId" = $1 LIMIT 1',
      [userId]
    );

    let config = configRes.rows[0];
    if (!config) {
      const id = crypto.randomUUID();
      const insertRes = await db.query(
        'INSERT INTO "AutoApplyConfig" (id, "userId") VALUES ($1, $2) RETURNING *',
        [id, userId]
      );
      config = insertRes.rows[0];
    }

    return config;
  }

  /**
   * Updates AutoApply filters and toggles.
   */
  static async updateAutoApplyConfig(userId: string, body: any): Promise<any> {
    const configRes = await db.query(
      'SELECT * FROM "AutoApplyConfig" WHERE "userId" = $1 LIMIT 1',
      [userId]
    );

    let config = configRes.rows[0];
    
    const allowedFields = [
      "isEnabled",
      "maxApplications",
      "jobTypes",
      "locations",
      "salaryMin",
      "keywords",
      "blacklistCompanies",
      "dailyLimit",
      "appliedCount"
    ];

    const fieldsToSet: string[] = [];
    const values: any[] = [];

    // Add fields that are in body and allowed
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        fieldsToSet.push(key);
        // JSONB columns must be stringified or kept as JSON
        if (["jobTypes", "locations", "keywords", "blacklistCompanies"].includes(key)) {
          values.push(body[key] ? JSON.stringify(body[key]) : null);
        } else {
          values.push(body[key]);
        }
      }
    }

    if (!config) {
      // Create new
      const id = crypto.randomUUID();
      const insertFields = ["id", "userId", ...fieldsToSet];
      const insertValues = [id, userId, ...values];
      const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(", ");
      
      const queryText = `
        INSERT INTO "AutoApplyConfig" (${insertFields.map(f => `"${f}"`).join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const insertRes = await db.query(queryText, insertValues);
      config = insertRes.rows[0];
    } else {
      // Update existing
      if (fieldsToSet.length > 0) {
        const setClause = fieldsToSet.map((field, i) => `"${field}" = $${i + 1}`).join(", ");
        values.push(userId);
        const queryText = `
          UPDATE "AutoApplyConfig"
          SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "userId" = $${values.length}
          RETURNING *
        `;
        const updateRes = await db.query(queryText, values);
        config = updateRes.rows[0];
      }
    }

    return config;
  }

  /**
   * Matches candidate criteria and automatically inserts application documents.
   */
  static async runAutoApply(userId: string): Promise<{ applied: number; jobs: any[] }> {
    const config = await this.getAutoApplyConfig(userId);

    if (!config?.isEnabled) {
      throw new Error("Auto-apply is not enabled");
    }

    const profileRes = await db.query(
      'SELECT * FROM "Profile" WHERE "userId" = $1 LIMIT 1',
      [userId]
    );
    const profile = profileRes.rows[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppliedRes = await db.query(
      `SELECT COUNT(*)::int as count FROM "Application"
       WHERE "userId" = $1 AND "isAutoApplied" = true AND "appliedAt" >= $2`,
      [userId, today]
    );
    const todayApplied = todayAppliedRes.rows[0]?.count ?? 0;

    if (todayApplied >= config.dailyLimit) {
      throw new Error("Daily auto-apply limit reached");
    }

    const alreadyAppliedRes = await db.query(
      'SELECT company FROM "Application" WHERE "userId" = $1',
      [userId]
    );
    const alreadyApplied = alreadyAppliedRes.rows;

    const blacklist = (config.blacklistCompanies as string[]) ?? [];
    const keywords = (config.keywords as string[]) ?? [];
    const locations = (config.locations as string[]) ?? [];

    const appliedCompanies = [
      ...new Set(alreadyApplied.map(a => a.company.toLowerCase())),
      ...blacklist.map((c) => c.toLowerCase()),
    ];

    let queryText = 'SELECT * FROM "Job" WHERE "isActive" = true';
    const params: any[] = [];

    // appliedCompanies filter
    if (appliedCompanies.length > 0) {
      params.push(appliedCompanies);
      queryText += ` AND NOT (LOWER("company") = ANY($${params.length}))`;
    }

    // salaryMin filter
    if (config.salaryMin) {
      params.push(config.salaryMin);
      queryText += ` AND ("salaryMin" >= $${params.length})`;
    }

    // locations filter
    if (locations.length > 0) {
      params.push(locations);
      queryText += ` AND ("location" = ANY($${params.length}))`;
    }

    // Keywords and targetRole OR clauses
    const orClauses: string[] = [];
    if (keywords.length > 0) {
      params.push(keywords);
      orClauses.push(`"title" = ANY($${params.length})`);
    }
    if (profile?.targetRole) {
      params.push(`%${profile.targetRole}%`);
      orClauses.push(`"title" ILIKE $${params.length}`);
    }

    if (orClauses.length > 0) {
      queryText += ` AND (${orClauses.join(" OR ")})`;
    }

    // Limit
    const limit = config.dailyLimit - todayApplied;
    params.push(limit);
    queryText += ` LIMIT $${params.length}`;

    const jobsResult = await db.query(queryText, params);
    const jobs = jobsResult.rows;

    let appliedCount = 0;

    if (jobs.length > 0) {
      await db.transaction(async (client) => {
        for (const job of jobs) {
          const applicationId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "Application" (
              id, "userId", "jobId", "company", "jobTitle", "jobUrl", status, "appliedAt", "isAutoApplied", source
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              applicationId,
              userId,
              job.id,
              job.company,
              job.title,
              job.sourceUrl,
              "APPLIED",
              new Date(),
              true,
              "auto-apply",
            ]
          );
          appliedCount++;
        }

        await client.query(
          `UPDATE "AutoApplyConfig"
           SET "appliedCount" = "appliedCount" + $1, "lastRunAt" = CURRENT_TIMESTAMP
           WHERE "userId" = $2`,
          [appliedCount, userId]
        );

        if (appliedCount > 0) {
          const notificationId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "Notification" (id, "userId", type, title, message, link)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              notificationId,
              userId,
              "APPLICATION_UPDATE",
              "Auto-Apply Completed",
              `Applied to ${appliedCount} new job${appliedCount > 1 ? "s" : ""} on your behalf`,
              "/app/jobs/tracker",
            ]
          );
        }

        const logId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "ActivityLog" (id, "userId", action, metadata)
           VALUES ($1, $2, $3, $4)`,
          [
            logId,
            userId,
            "auto_apply.ran",
            JSON.stringify({ appliedCount }),
          ]
        );
      });

      if (appliedCount > 0) {
        eventEmitter.emit(APP_EVENTS.NOTIFICATION_CREATED, {
          userId,
          type: "APPLICATION_UPDATE",
          title: "Auto-Apply Completed",
          message: `Applied to ${appliedCount} new job${appliedCount > 1 ? "s" : ""} on your behalf`,
          link: "/app/jobs/tracker",
        });
      }
    }

    return {
      applied: appliedCount,
      jobs: jobs.map((j) => ({ title: j.title, company: j.company })),
    };
  }
}
