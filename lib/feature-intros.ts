/**
 * First-visit feature intros.
 * Keyed by the app route. The <FeatureIntro /> component (rendered once in the
 * app layout) looks up the current pathname here and shows a one-time guide.
 *
 * `steps` = how to use the feature. `recommendWhen` = optional hint logic used on
 * the dashboard to suggest which feature to start with based on the user's data.
 */

export interface FeatureIntro {
  /** Stable id used for the localStorage "seen" flag. */
  id: string;
  /** Emoji shown in the intro header. */
  emoji: string;
  title: string;
  tagline: string;
  /** Short, numbered "how to use it" steps. */
  steps: string[];
  /** Primary call-to-action label shown on the dismiss button. */
  cta?: string;
}

export const FEATURE_INTROS: Record<string, FeatureIntro> = {
  "/app": {
    id: "dashboard",
    emoji: "👋",
    title: "Welcome to Vex",
    tagline: "Your AI career co-pilot. Here's how to get the most out of it.",
    steps: [
      "Start with the Resume Builder — upload a PDF and Vex parses it into an editable, ATS-ready resume.",
      "Run the ATS Analyzer against a job description to see your match score and missing keywords.",
      "Turn on Auto Apply to let Vex apply to matching jobs for you in the background.",
      "Practice with Mock Interviews and track everything on your Job Tracker board.",
    ],
    cta: "Let's go",
  },
  "/app/resume-builder": {
    id: "resume-builder",
    emoji: "📄",
    title: "Resume Builder",
    tagline: "Build and refine an ATS-friendly resume with AI.",
    steps: [
      "Create a new resume or upload an existing PDF — Vex parses it into structured sections.",
      "Edit your summary, skills, and experience bullets inline.",
      "Select any bullet and hit 'Rewrite with AI' to make it metric-driven and ATS-optimized.",
      "Save — your resume is stored and reused across Cover Letters, ATS Analyzer, and Auto Apply.",
    ],
    cta: "Start building",
  },
  "/app/ats-analyzer": {
    id: "ats-analyzer",
    emoji: "🎯",
    title: "ATS Analyzer",
    tagline: "See how a recruiter's screening software scores your resume.",
    steps: [
      "Pick one of your saved resumes.",
      "Paste the full job description you're targeting.",
      "Run the analysis to get a 0–100 match score, missing keywords, and section-by-section scoring.",
      "Apply the suggested fixes, then re-run to watch your score climb.",
    ],
    cta: "Analyze a resume",
  },
  "/app/cover-letter": {
    id: "cover-letter",
    emoji: "✍️",
    title: "Cover Letter Generator",
    tagline: "Tailored cover letters in seconds — no writer's block.",
    steps: [
      "Optionally pick a resume so the letter pulls from your real experience.",
      "Enter the job title and company, and paste the job description for deeper personalization.",
      "Choose a tone (professional, startup, or creative story).",
      "Generate, tweak, and copy — every letter is grounded in your actual background.",
    ],
    cta: "Write a letter",
  },
  "/app/interview-prep": {
    id: "interview-prep",
    emoji: "🎤",
    title: "Mock Interviews",
    tagline: "Practice realistic interviews and get scored feedback.",
    steps: [
      "Start a new session and pick the type — technical, behavioral, or mixed.",
      "Vex generates role-specific questions that get progressively harder.",
      "Answer each one — you'll get a STAR-calibrated score and specific feedback.",
      "Finish for a full debrief with strengths, gaps, and a 30-day action plan.",
    ],
    cta: "Start practicing",
  },
  "/app/auto-apply": {
    id: "auto-apply",
    emoji: "🚀",
    title: "Auto Apply",
    tagline: "Let Vex apply to matching jobs for you, automatically.",
    steps: [
      "Open 'Configure Criteria' and set target roles, locations, minimum salary, and a daily limit.",
      "Blacklist any companies you want to skip.",
      "Activate the agent — or hit 'Run Now' for an immediate batch.",
      "Every application is tracked below and on your Job Tracker board.",
    ],
    cta: "Configure agent",
  },
  "/app/jobs/matches": {
    id: "job-matches",
    emoji: "💼",
    title: "Job Matches",
    tagline: "AI-ranked jobs based on your profile and skills.",
    steps: [
      "Browse jobs scored by how well they fit your profile.",
      "Open 'AI Analysis' on any card to see why it matched.",
      "Save jobs to review later, or apply directly in one click.",
      "Filter to 90%+ matches to focus on your strongest fits.",
    ],
    cta: "Browse jobs",
  },
  "/app/jobs/tracker": {
    id: "job-tracker",
    emoji: "📋",
    title: "Job Tracker",
    tagline: "Your whole pipeline on one Kanban board.",
    steps: [
      "Every job you apply to appears here automatically.",
      "Drag cards between Saved, Applied, Interviewing, Offer, and Rejected.",
      "Click a card to add notes, contacts, and next actions.",
      "Use it as your single source of truth for the job hunt.",
    ],
    cta: "Open board",
  },
  "/app/career-roadmap": {
    id: "career-roadmap",
    emoji: "🗺️",
    title: "Career Roadmap",
    tagline: "A personalized, milestone-by-milestone path to your target role.",
    steps: [
      "Enter your current role, target role, and a timeline.",
      "Vex runs a skill-gap analysis and builds 8–12 concrete milestones.",
      "Check off milestones as you complete them to track progress.",
      "Recalculate any time your goals change.",
    ],
    cta: "Build my roadmap",
  },
  "/app/learning-hub": {
    id: "learning-hub",
    emoji: "📚",
    title: "Learning Hub",
    tagline: "Close the skill gaps your roadmap and ATS scans reveal.",
    steps: [
      "Browse courses by category or search for a specific skill.",
      "See AI-recommended courses tailored to your target role.",
      "Enroll and track progress as you complete them.",
    ],
    cta: "Explore courses",
  },
  "/app/portfolio": {
    id: "portfolio",
    emoji: "🌐",
    title: "Portfolio Builder",
    tagline: "A shareable personal site in a few clicks.",
    steps: [
      "Set your portfolio title, bio, and public URL slug.",
      "Add projects with descriptions, tech stacks, and live/GitHub links.",
      "Mark your best work as featured.",
      "Publish and share your public portfolio link.",
    ],
    cta: "Build portfolio",
  },
};

export function getFeatureIntro(pathname: string): FeatureIntro | null {
  return FEATURE_INTROS[pathname] ?? null;
}
