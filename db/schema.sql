-- ==========================================
-- VEX AI — POSTGRESQL DDL SCHEMA (PURE SQL)
-- ==========================================

-- ─── Clean Existing Tables ──────────────────────────────────────────────────
DROP TABLE IF EXISTS "AiTokenLog" CASCADE;
DROP TABLE IF EXISTS "SavedJob" CASCADE;
DROP TABLE IF EXISTS "EmailCampaign" CASCADE;
DROP TABLE IF EXISTS "Headshot" CASCADE;
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "AutoApplyConfig" CASCADE;
DROP TABLE IF EXISTS "UserSettings" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "ConversationMember" CASCADE;
DROP TABLE IF EXISTS "Conversation" CASCADE;
DROP TABLE IF EXISTS "PortfolioProject" CASCADE;
DROP TABLE IF EXISTS "Portfolio" CASCADE;
DROP TABLE IF EXISTS "CourseEnrollment" CASCADE;
DROP TABLE IF EXISTS "Course" CASCADE;
DROP TABLE IF EXISTS "Milestone" CASCADE;
DROP TABLE IF EXISTS "CareerRoadmap" CASCADE;
DROP TABLE IF EXISTS "InterviewQA" CASCADE;
DROP TABLE IF EXISTS "InterviewSession" CASCADE;
DROP TABLE IF EXISTS "ATSAnalysis" CASCADE;
DROP TABLE IF EXISTS "CoverLetter" CASCADE;
DROP TABLE IF EXISTS "ApplicationStatusHistory" CASCADE;
DROP TABLE IF EXISTS "Application" CASCADE;
DROP TABLE IF EXISTS "Job" CASCADE;
DROP TABLE IF EXISTS "Resume" CASCADE;
DROP TABLE IF EXISTS "Profile" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ─── 1. Auth & Users ────────────────────────────────────────────────────────
CREATE TABLE "User" (
  "id" VARCHAR(255) PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "name" VARCHAR(255),
  "image" TEXT,
  "password" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'USER' NOT NULL,
  "plan" VARCHAR(50) DEFAULT 'FREE' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Account" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" VARCHAR(255) NOT NULL,
  "provider" VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" VARCHAR(255),
  "scope" VARCHAR(255),
  "id_token" TEXT,
  "session_state" VARCHAR(255),
  CONSTRAINT "uq_Account_provider_providerAccountId" UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id" VARCHAR(255) PRIMARY KEY,
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP NOT NULL
);

CREATE TABLE "VerificationToken" (
  "identifier" VARCHAR(255) NOT NULL,
  "token" VARCHAR(255) NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  CONSTRAINT "uq_VerificationToken_identifier_token" UNIQUE ("identifier", "token")
);

CREATE UNIQUE INDEX "idx_VerificationToken_token" ON "VerificationToken"("token");

-- ─── 2. Profiles & Customization ────────────────────────────────────────────
CREATE TABLE "Profile" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "headline" VARCHAR(255),
  "bio" TEXT,
  "location" VARCHAR(255),
  "phone" VARCHAR(255),
  "website" VARCHAR(255),
  "linkedinUrl" VARCHAR(255),
  "githubUrl" VARCHAR(255),
  "twitterUrl" VARCHAR(255),
  "currentRole" VARCHAR(255),
  "targetRole" VARCHAR(255),
  "yearsExperience" INTEGER,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "jobTypes" JSONB,
  "industries" JSONB,
  "profileStrength" INTEGER DEFAULT 0 NOT NULL,
  "avatarUrl" TEXT,
  "avatarKey" VARCHAR(255),
  "isPublic" BOOLEAN DEFAULT FALSE NOT NULL,
  "onboardingDone" BOOLEAN DEFAULT FALSE NOT NULL,
  "goal" VARCHAR(255),
  "tone" VARCHAR(255),
  "blacklistCompanies" JSONB,
  "employmentStatus" VARCHAR(255),
  "startDate" VARCHAR(255),
  "workAuth" VARCHAR(255),
  "country" VARCHAR(255),
  "skills" JSONB,
  "languages" JSONB,
  "biggestWin" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 3. Resumes & Portfolios ───────────────────────────────────────────────
CREATE TABLE "Resume" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "fileUrl" TEXT,
  "fileKey" VARCHAR(255),
  "parsedContent" JSONB,
  "rawText" TEXT,
  "template" VARCHAR(255) DEFAULT 'modern' NOT NULL,
  "isDefault" BOOLEAN DEFAULT FALSE NOT NULL,
  "atsScore" INTEGER,
  "version" INTEGER DEFAULT 1 NOT NULL,
  "language" VARCHAR(50) DEFAULT 'en' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Resume_userId" ON "Resume"("userId");

-- ─── 4. Jobs & Applications ─────────────────────────────────────────────────
CREATE TABLE "Job" (
  "id" VARCHAR(255) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "company" VARCHAR(255) NOT NULL,
  "location" VARCHAR(255),
  "type" VARCHAR(50) DEFAULT 'FULL_TIME' NOT NULL,
  "salary" VARCHAR(255),
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "description" TEXT NOT NULL,
  "requirements" JSONB,
  "skills" JSONB,
  "benefits" JSONB,
  "remote" BOOLEAN DEFAULT FALSE NOT NULL,
  "source" VARCHAR(255),
  "sourceUrl" TEXT,
  "postedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "logoUrl" TEXT,
  "industry" VARCHAR(255),
  "experienceLevel" VARCHAR(50) DEFAULT 'MID' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Job_isActive" ON "Job"("isActive");
CREATE INDEX "idx_Job_industry" ON "Job"("industry");

CREATE TABLE "CoverLetter" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "jobTitle" VARCHAR(255),
  "company" VARCHAR(255),
  "tone" VARCHAR(255) DEFAULT 'professional' NOT NULL,
  "isGenerated" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_CoverLetter_userId" ON "CoverLetter"("userId");

CREATE TABLE "Application" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "jobId" VARCHAR(255) REFERENCES "Job"("id") ON DELETE SET NULL,
  "resumeId" VARCHAR(255) REFERENCES "Resume"("id") ON DELETE SET NULL,
  "coverLetterId" VARCHAR(255) REFERENCES "CoverLetter"("id") ON DELETE SET NULL,
  "company" VARCHAR(255) NOT NULL,
  "jobTitle" VARCHAR(255) NOT NULL,
  "jobUrl" TEXT,
  "status" VARCHAR(50) DEFAULT 'SAVED' NOT NULL,
  "appliedAt" TIMESTAMP,
  "notes" TEXT,
  "salary" VARCHAR(255),
  "contacts" JSONB,
  "nextAction" VARCHAR(255),
  "nextActionDate" TIMESTAMP,
  "isAutoApplied" BOOLEAN DEFAULT FALSE NOT NULL,
  "source" VARCHAR(255),
  "priority" VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Application_userId" ON "Application"("userId");
CREATE INDEX "idx_Application_status" ON "Application"("status");

CREATE TABLE "ApplicationStatusHistory" (
  "id" VARCHAR(255) PRIMARY KEY,
  "applicationId" VARCHAR(255) NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
  "status" VARCHAR(50) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_ApplicationStatusHistory_applicationId" ON "ApplicationStatusHistory"("applicationId");

-- ─── 5. ATS & Interviews ────────────────────────────────────────────────────
CREATE TABLE "ATSAnalysis" (
  "id" VARCHAR(255) PRIMARY KEY,
  "resumeId" VARCHAR(255) NOT NULL REFERENCES "Resume"("id") ON DELETE CASCADE,
  "jobDescription" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "missingKeywords" JSONB,
  "presentKeywords" JSONB,
  "suggestions" JSONB,
  "sections" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_ATSAnalysis_resumeId" ON "ATSAnalysis"("resumeId");

CREATE TABLE "InterviewSession" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "applicationId" VARCHAR(255) REFERENCES "Application"("id") ON DELETE SET NULL,
  "type" VARCHAR(50) DEFAULT 'BEHAVIORAL' NOT NULL,
  "role" VARCHAR(255),
  "company" VARCHAR(255),
  "status" VARCHAR(50) DEFAULT 'IN_PROGRESS' NOT NULL,
  "duration" INTEGER,
  "overallScore" INTEGER,
  "feedback" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_InterviewSession_userId" ON "InterviewSession"("userId");

CREATE TABLE "InterviewQA" (
  "id" VARCHAR(255) PRIMARY KEY,
  "sessionId" VARCHAR(255) NOT NULL REFERENCES "InterviewSession"("id") ON DELETE CASCADE,
  "question" TEXT NOT NULL,
  "answer" TEXT,
  "feedback" TEXT,
  "score" INTEGER,
  "category" VARCHAR(255),
  "timeSpent" INTEGER,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_InterviewQA_sessionId" ON "InterviewQA"("sessionId");

-- ─── 6. Career Coaching & roadmap ───────────────────────────────────────────
CREATE TABLE "CareerRoadmap" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "currentRole" VARCHAR(255) NOT NULL,
  "targetRole" VARCHAR(255) NOT NULL,
  "timelineMonths" INTEGER DEFAULT 12 NOT NULL,
  "progress" INTEGER DEFAULT 0 NOT NULL,
  "aiPlan" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Milestone" (
  "id" VARCHAR(255) PRIMARY KEY,
  "roadmapId" VARCHAR(255) NOT NULL REFERENCES "CareerRoadmap"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMP,
  "completed" BOOLEAN DEFAULT FALSE NOT NULL,
  "completedAt" TIMESTAMP,
  "order" INTEGER NOT NULL,
  "category" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Milestone_roadmapId" ON "Milestone"("roadmapId");

-- ─── 7. Learning & Courses ──────────────────────────────────────────────────
CREATE TABLE "Course" (
  "id" VARCHAR(255) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "instructor" VARCHAR(255),
  "thumbnail" TEXT,
  "url" TEXT,
  "duration" INTEGER,
  "level" VARCHAR(50) DEFAULT 'beginner' NOT NULL,
  "category" VARCHAR(255) NOT NULL,
  "skills" JSONB,
  "rating" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
  "isFree" BOOLEAN DEFAULT TRUE NOT NULL,
  "source" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Course_category" ON "Course"("category");

CREATE TABLE "CourseEnrollment" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "courseId" VARCHAR(255) NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE,
  "progress" INTEGER DEFAULT 0 NOT NULL,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "uq_CourseEnrollment_user_course" UNIQUE ("userId", "courseId")
);

-- ─── 8. Portfolios & Public showcase ─────────────────────────────────────────
CREATE TABLE "Portfolio" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" VARCHAR(255),
  "bio" TEXT,
  "theme" VARCHAR(255) DEFAULT 'minimal' NOT NULL,
  "customDomain" VARCHAR(255),
  "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "views" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "PortfolioProject" (
  "id" VARCHAR(255) PRIMARY KEY,
  "portfolioId" VARCHAR(255) NOT NULL REFERENCES "Portfolio"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "technologies" JSONB,
  "imageUrl" TEXT,
  "liveUrl" TEXT,
  "githubUrl" TEXT,
  "featured" BOOLEAN DEFAULT FALSE NOT NULL,
  "order" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_PortfolioProject_portfolioId" ON "PortfolioProject"("portfolioId");

-- ─── 9. Recruiter Messages ──────────────────────────────────────────────────
CREATE TABLE "Conversation" (
  "id" VARCHAR(255) PRIMARY KEY,
  "title" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "ConversationMember" (
  "id" VARCHAR(255) PRIMARY KEY,
  "conversationId" VARCHAR(255) NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "lastReadAt" TIMESTAMP,
  CONSTRAINT "uq_ConversationMember_conversation_user" UNIQUE ("conversationId", "userId")
);

CREATE TABLE "Message" (
  "id" VARCHAR(255) PRIMARY KEY,
  "conversationId" VARCHAR(255) NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "senderId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Message_conversationId" ON "Message"("conversationId");

-- ─── 10. Notifications ──────────────────────────────────────────────────────
CREATE TABLE "Notification" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "link" VARCHAR(255),
  "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Notification_user_read" ON "Notification"("userId", "isRead");

-- ─── 11. Custom Settings ────────────────────────────────────────────────────
CREATE TABLE "UserSettings" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "emailNotifications" BOOLEAN DEFAULT TRUE NOT NULL,
  "jobAlerts" BOOLEAN DEFAULT TRUE NOT NULL,
  "applicationUpdates" BOOLEAN DEFAULT TRUE NOT NULL,
  "weeklyDigest" BOOLEAN DEFAULT TRUE NOT NULL,
  "autoApplyEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
  "theme" VARCHAR(255) DEFAULT 'system' NOT NULL,
  "language" VARCHAR(255) DEFAULT 'en' NOT NULL,
  "timezone" VARCHAR(255) DEFAULT 'UTC' NOT NULL,
  "profileVisibility" VARCHAR(255) DEFAULT 'private' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 12. Automated Job Apply Bot ───────────────────────────────────────────
CREATE TABLE "AutoApplyConfig" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "isEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
  "maxApplications" INTEGER DEFAULT 10 NOT NULL,
  "jobTypes" JSONB,
  "locations" JSONB,
  "salaryMin" INTEGER,
  "keywords" JSONB,
  "blacklistCompanies" JSONB,
  "dailyLimit" INTEGER DEFAULT 5 NOT NULL,
  "appliedCount" INTEGER DEFAULT 0 NOT NULL,
  "lastRunAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 13. Audit & Outreach ───────────────────────────────────────────────────
CREATE TABLE "ActivityLog" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "action" VARCHAR(255) NOT NULL,
  "entity" VARCHAR(255),
  "entityId" VARCHAR(255),
  "metadata" JSONB,
  "ipAddress" VARCHAR(255),
  "userAgent" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_ActivityLog_userId" ON "ActivityLog"("userId");
CREATE INDEX "idx_ActivityLog_createdAt" ON "ActivityLog"("createdAt");

CREATE TABLE "Headshot" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "imageUrl" TEXT NOT NULL,
  "fileKey" VARCHAR(255) NOT NULL,
  "style" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_Headshot_userId" ON "Headshot"("userId");

CREATE TABLE "EmailCampaign" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "subject" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "recipient" VARCHAR(255) NOT NULL,
  "company" VARCHAR(255),
  "status" VARCHAR(50) DEFAULT 'draft' NOT NULL,
  "sentAt" TIMESTAMP,
  "openedAt" TIMESTAMP,
  "repliedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_EmailCampaign_userId" ON "EmailCampaign"("userId");

CREATE TABLE "SavedJob" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "jobId" VARCHAR(255) NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "uq_SavedJob_user_job" UNIQUE ("userId", "jobId")
);

CREATE TABLE "AiTokenLog" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) REFERENCES "User"("id") ON DELETE SET NULL,
  "action" VARCHAR(100) NOT NULL,
  "provider" VARCHAR(50) NOT NULL,
  "model" VARCHAR(50) NOT NULL,
  "promptTokens" INTEGER NOT NULL DEFAULT 0,
  "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL DEFAULT 0,
  "status" VARCHAR(50) NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_AiTokenLog_userId" ON "AiTokenLog"("userId");
CREATE INDEX "idx_AiTokenLog_createdAt" ON "AiTokenLog"("createdAt");


