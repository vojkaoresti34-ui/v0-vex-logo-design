import "./env";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";

const jobs = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    company: "TechFlow AI",
    location: "San Francisco, CA",
    type: "FULL_TIME",
    salary: "$140k – $180k",
    salaryMin: 140000,
    salaryMax: 180000,
    remote: true,
    industry: "Technology",
    experienceLevel: "SENIOR",
    skills: ["React", "TypeScript", "Next.js", "CSS", "JavaScript"],
    requirements: ["5+ years frontend", "Expert React & TypeScript", "Next.js experience"],
    benefits: ["Health insurance", "401k", "Remote work", "Learning budget"],
    description:
      "We are looking for a Senior Frontend Engineer to build and maintain high-performance web applications. You'll lead frontend architecture decisions and mentor junior developers.",
  },
  {
    id: "job-2",
    title: "Full Stack Developer",
    company: "GrowthLabs",
    location: "New York, NY",
    type: "FULL_TIME",
    salary: "$110k – $145k",
    salaryMin: 110000,
    salaryMax: 145000,
    remote: false,
    industry: "SaaS",
    experienceLevel: "MID",
    skills: ["Node.js", "React", "PostgreSQL", "AWS", "TypeScript"],
    requirements: ["3+ years full stack", "Node.js proficiency", "Database design"],
    benefits: ["Flexible PTO", "Health & dental", "Annual bonus"],
    description:
      "Join GrowthLabs as a Full Stack Developer. You'll work on our SaaS platform building features from database to UI. Small, high-impact teams with direct founder access.",
  },
  {
    id: "job-3",
    title: "Machine Learning Engineer",
    company: "Nexus Intelligence",
    location: "Austin, TX",
    type: "FULL_TIME",
    salary: "$150k – $200k",
    salaryMin: 150000,
    salaryMax: 200000,
    remote: true,
    industry: "Artificial Intelligence",
    experienceLevel: "SENIOR",
    skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "SQL", "Docker"],
    requirements: ["Strong Python skills", "PyTorch or TensorFlow", "MLOps experience"],
    benefits: ["RSU grants", "Top-tier health", "Conference budget"],
    description:
      "Develop and deploy production ML systems. You'll work on NLP, computer vision, and recommendation systems powering our core product.",
  },
  {
    id: "job-4",
    title: "Product Manager",
    company: "ScaleUp",
    location: "Remote",
    type: "FULL_TIME",
    salary: "$120k – $160k",
    salaryMin: 120000,
    salaryMax: 160000,
    remote: true,
    industry: "SaaS",
    experienceLevel: "MID",
    skills: ["Product Strategy", "Data Analysis", "Agile", "SQL", "Figma"],
    requirements: ["4+ years PM experience", "B2B SaaS background", "Data-driven decisions"],
    benefits: ["Remote first", "Unlimited PTO", "Equity", "Learning stipend"],
    description:
      "Own our enterprise product line. Define roadmap, collaborate with engineers and designers, and drive growth metrics.",
  },
  {
    id: "job-5",
    title: "DevOps Engineer",
    company: "CloudSphere",
    location: "Seattle, WA",
    type: "FULL_TIME",
    salary: "$130k – $165k",
    salaryMin: 130000,
    salaryMax: 165000,
    remote: false,
    industry: "Cloud Computing",
    experienceLevel: "MID",
    skills: ["AWS", "Kubernetes", "Terraform", "Docker", "CI/CD", "Python"],
    requirements: ["3+ years DevOps", "AWS/GCP expertise", "Kubernetes experience"],
    benefits: ["Hybrid work", "Health benefits", "401k", "Home office stipend"],
    description:
      "Manage and scale cloud infrastructure. Build CI/CD pipelines, manage Kubernetes clusters, and improve reliability across production systems.",
  },
];

const courses = [
  {
    id: "course-1",
    title: "React & TypeScript Masterclass",
    description:
      "Learn React with TypeScript from scratch. Build production-ready applications with hooks, context, and modern patterns. Includes 15 real-world projects.",
    instructor: "Sarah Johnson",
    duration: 40,
    level: "intermediate",
    category: "Frontend",
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
    rating: 4.8,
    isFree: false,
    source: "Udemy",
    url: "https://www.udemy.com",
  },
  {
    id: "course-2",
    title: "CS50: Introduction to Computer Science",
    description:
      "Harvard's legendary intro to CS. Learn programming fundamentals, algorithms, data structures, and more. Best free course online.",
    instructor: "David Malan",
    duration: 100,
    level: "beginner",
    category: "Computer Science",
    skills: ["Python", "C", "JavaScript", "SQL", "Algorithms"],
    rating: 4.9,
    isFree: true,
    source: "edX",
    url: "https://cs50.harvard.edu/x",
  },
  {
    id: "course-3",
    title: "System Design Interview Guide",
    description:
      "Master system design for technical interviews. Scalable architectures, databases, caching, load balancing, microservices, and real FAANG examples.",
    instructor: "Alex Xu",
    duration: 25,
    level: "advanced",
    category: "System Design",
    skills: ["System Design", "Distributed Systems", "Databases", "Scalability"],
    rating: 4.9,
    isFree: false,
    source: "ByteByteGo",
    url: "https://bytebytego.com",
  },
];

async function main() {
  console.log("🌱 Seeding Vex AI database with Pure SQL...\n");

  const hashedPassword = await bcrypt.hash("password123", 12);
  const demoUserId = "demo-user-id";

  // 1. Create/Update Demo User
  await db.query(
    `INSERT INTO "User" (id, email, name, password, plan, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       password = EXCLUDED.password,
       plan = EXCLUDED.plan,
       role = EXCLUDED.role`,
    [demoUserId, "demo@vexai.app", "Alex Rivera", hashedPassword, "PRO", "USER"]
  );
  console.log("✅ Demo user inserted or updated.");

  // 2. Create/Update Profile
  const skillsJson = JSON.stringify(["React", "TypeScript", "Node.js", "System Design", "Leadership"]);
  const industriesJson = JSON.stringify(["Technology", "SaaS", "Fintech"]);
  const jobTypesJson = JSON.stringify(["FULL_TIME", "REMOTE"]);

  await db.query(
    `INSERT INTO "Profile" (
       id, "userId", headline, "currentRole", "targetRole", location,
       "linkedinUrl", "githubUrl", skills, industries, "yearsExperience",
       "salaryMin", "salaryMax", "jobTypes", "biggestWin", tone,
       "onboardingDone", "profileStrength"
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     ON CONFLICT ("userId") DO UPDATE SET
       headline = EXCLUDED.headline,
       "currentRole" = EXCLUDED."currentRole",
       "targetRole" = EXCLUDED."targetRole",
       location = EXCLUDED.location,
       skills = EXCLUDED.skills,
       "profileStrength" = EXCLUDED."profileStrength"`,
    [
      "profile-1",
      demoUserId,
      "Senior Software Engineer → Engineering Manager",
      "Senior Software Engineer",
      "Engineering Manager",
      "San Francisco, CA",
      "https://linkedin.com/in/alexrivera",
      "https://github.com/alexrivera",
      skillsJson,
      industriesJson,
      7,
      180000,
      250000,
      jobTypesJson,
      "Led migration of monolith to microservices, reducing API latency by 60% and saving $200k/year in infrastructure costs.",
      "startup",
      true,
      85,
    ]
  );
  console.log("✅ Demo profile inserted or updated.");

  // 3. Create Settings
  await db.query(
    `INSERT INTO "UserSettings" (id, "userId", theme, language)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("userId") DO NOTHING`,
    ["settings-1", demoUserId, "system", "en"]
  );
  console.log("✅ Demo settings inserted.");

  // 4. Create Jobs
  for (const job of jobs) {
    const jobSkills = JSON.stringify(job.skills);
    const jobReqs = JSON.stringify(job.requirements);
    const jobBenefits = JSON.stringify(job.benefits);

    await db.query(
      `INSERT INTO "Job" (
         id, title, company, location, type, salary, "salaryMin", "salaryMax",
         description, requirements, skills, benefits, remote, industry, "experienceLevel"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        job.id,
        job.title,
        job.company,
        job.location,
        job.type,
        job.salary,
        job.salaryMin,
        job.salaryMax,
        job.description,
        jobReqs,
        jobSkills,
        jobBenefits,
        job.remote,
        job.industry,
        job.experienceLevel,
      ]
    );
  }
  console.log(`✅ Created sample jobs.`);

  // 5. Create Courses
  for (const course of courses) {
    const courseSkills = JSON.stringify(course.skills);

    await db.query(
      `INSERT INTO "Course" (
         id, title, description, instructor, duration, level, category, skills, rating, "isFree", source, url
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [
        course.id,
        course.title,
        course.description,
        course.instructor,
        course.duration,
        course.level,
        course.category,
        courseSkills,
        course.rating,
        course.isFree,
        course.source,
        course.url,
      ]
    );
  }
  console.log(`✅ Created sample courses.`);

  // 6. Create Applications
  await db.query(`DELETE FROM "Application" WHERE "userId" = $1`, [demoUserId]);

  const sampleApps = [
    { company: "Stripe", jobTitle: "Staff Engineer", status: "INTERVIEWING", priority: "HIGH" },
    { company: "Vercel", jobTitle: "Senior Engineer", status: "APPLIED", priority: "HIGH" },
    { company: "Linear", jobTitle: "Engineering Manager", status: "SCREENING", priority: "HIGH" },
    { company: "Notion", jobTitle: "Senior Frontend Engineer", status: "SAVED", priority: "MEDIUM" },
    { company: "Figma", jobTitle: "Tech Lead", status: "APPLIED", priority: "MEDIUM" },
    { company: "GitHub", jobTitle: "Staff Engineer", status: "REJECTED", priority: "MEDIUM" },
  ];

  for (let i = 0; i < sampleApps.length; i++) {
    const app = sampleApps[i];
    await db.query(
      `INSERT INTO "Application" (id, "userId", company, "jobTitle", status, priority, "appliedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        `app-id-${i}`,
        demoUserId,
        app.company,
        app.jobTitle,
        app.status,
        app.priority,
        new Date(Date.now() - i * 3 * 86400000),
      ]
    );
  }
  console.log(`✅ Created demo user applications.`);

  // 7. Create Notifications
  await db.query(`DELETE FROM "Notification" WHERE "userId" = $1`, [demoUserId]);

  const sampleNotifs = [
    { type: "JOB_MATCH", title: "15 New Job Matches", message: "15 new jobs match your profile this week", link: "/app/jobs/matches", isRead: false },
    { type: "APPLICATION_UPDATE", title: "Application Update", message: "Linear moved you to Screening stage", link: "/app/jobs/tracker", isRead: false },
    { type: "AI_INSIGHT", title: "AI Insight", message: "Your ATS score can be improved by adding keywords", link: "/app/ats-analyzer", isRead: false },
    { type: "COURSE_RECOMMENDATION", title: "New Course Match", message: "System Design Interview Guide matches your target role", link: "/app/learning-hub", isRead: true },
  ];

  for (let i = 0; i < sampleNotifs.length; i++) {
    const notif = sampleNotifs[i];
    await db.query(
      `INSERT INTO "Notification" (id, "userId", type, title, message, link, "isRead")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`notif-id-${i}`, demoUserId, notif.type, notif.title, notif.message, notif.link, notif.isRead]
    );
  }
  console.log("✅ Created demo user notifications.");

  console.log("\n🚀 Pure SQL seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
