"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import {
  ArrowRight,
  Send,
  FileText,
  MessageSquare,
  Briefcase,
  Clock,
  Activity,
  Sparkles,
  Zap,
  Crosshair,
  MonitorPlay,
  BookOpen,
  Video,
  PlayCircle,
  Loader2,
  Rocket
} from "lucide-react";
import Link from "next/link";
import { JobMatches } from "@/components/dashboard/job-matches";

interface DashboardStats {
  applied: number;
  interviewing: number;
  offers: number;
  profileStrength: number;
}

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  rating: number;
  isFree: boolean;
  source: string;
}

const STATS_FALLBACK: DashboardStats = {
  applied: 0,
  interviewing: 0,
  offers: 0,
  profileStrength: 0,
};

const quickTools = [
  { name: "Auto Apply Bot", desc: "Let AI apply for you", icon: Send, href: "/app/auto-apply", color: "from-green-500/20 to-emerald-500/5" },
  { name: "Resume Builder", desc: "Optimize for ATS", icon: FileText, href: "/app/resume-builder", color: "from-blue-500/20 to-cyan-500/5" },
  { name: "Cover Letters", desc: "1-click generation", icon: MessageSquare, href: "/app/cover-letter", color: "from-purple-500/20 to-fuchsia-500/5" },
  { name: "Skill Gap Scanner", desc: "Find missing keywords", icon: Crosshair, href: "/app/ats-analyzer", color: "from-orange-500/20 to-amber-500/5" },
  { name: "Interview Prep", desc: "Mock AI interviews", icon: MonitorPlay, href: "/app/interview-prep", color: "from-pink-500/20 to-rose-500/5" },
  { name: "Job Board", desc: "Find your next role", icon: Briefcase, href: "/app/jobs/matches", color: "from-yellow-500/20 to-amber-500/5" },
];

function getActivityIcon(action: string): { icon: typeof FileText; color: string; bg: string } {
  if (action.includes("resume") || action.includes("RESUME")) return { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" };
  if (action.includes("apply") || action.includes("APPLICATION")) return { icon: Send, color: "text-green-500", bg: "bg-green-500/10" };
  if (action.includes("cover") || action.includes("COVER")) return { icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" };
  if (action.includes("job") || action.includes("JOB")) return { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" };
  return { icon: Activity, color: "text-primary", bg: "bg-primary/10" };
}

function formatAction(log: ActivityLog): string {
  const label = log.action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  if (log.metadata && typeof log.metadata === "object") {
    const m = log.metadata as Record<string, string>;
    if (m.company && m.jobTitle) return `Applied to ${m.jobTitle} at ${m.company}`;
    if (m.title) return `${label}: ${m.title}`;
  }
  return label;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AppDashboard() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [stats, setStats] = useState<DashboardStats>(STATS_FALLBACK);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: DashboardStats) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    fetch("/api/activity?limit=5")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: ActivityLog[]) => setActivities(Array.isArray(data) ? data : []))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));

    fetch("/api/learning/recommendations")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: Course[]) => setCourses(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const isNewUser = !statsLoading && stats.applied === 0 && stats.interviewing === 0;
  const strengthOffset = (1 - stats.profileStrength / 100) * 251.2;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Welcome Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground font-medium">
            Here's what your AI career co-pilot has been up to.
          </p>
        </div>
        <Link
          href="/app/jobs/matches"
          className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4" /> Start New Application
        </Link>
      </div>

      {/* New user onboarding checklist */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-[2rem] p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-foreground">Get started with Vex</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Upload your resume", desc: "Let AI parse and optimize it", href: "/app/resume-builder", icon: FileText },
              { title: "Find matching jobs", desc: "AI matched to your profile", href: "/app/jobs/matches", icon: Briefcase },
              { title: "Enable auto-apply", desc: "Let the bot apply for you", href: "/app/auto-apply", icon: Send },
            ].map((step) => (
              <Link key={step.href} href={step.href} className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-border/50 hover:border-primary/40 hover:scale-[1.02] transition-all group">
                <step.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-black text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <JobMatches />

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Profile Strength */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02] flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
          <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white mb-8 self-start w-full">Profile Strength</h3>
          <div className="relative w-48 h-48 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="stroke-muted/30 fill-none" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40"
                className="stroke-primary fill-none transition-all duration-700"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={statsLoading ? 251.2 : strengthOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {statsLoading ? (
                <div className="w-12 h-6 bg-muted/50 rounded animate-pulse" />
              ) : (
                <span className="text-4xl font-black text-foreground">{stats.profileStrength}%</span>
              )}
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {stats.profileStrength >= 80 ? "Excellent" : stats.profileStrength >= 50 ? "Good" : "Needs Work"}
              </span>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-6 font-medium">
            {stats.profileStrength < 100
              ? "Complete your profile to get better job matches."
              : "Your profile is complete! Keep it updated."}
          </p>
          <Link href="/app/resume-builder" className="w-full bg-secondary dark:bg-white/10 text-white dark:text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-colors text-center block">
            Complete Profile
          </Link>
        </div>

        {/* Application Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white">Application Pipeline</h3>
            <Link href="/app/jobs/tracker" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 h-[200px] mb-6">
            {[
              { label: "Applied", value: stats.applied, colorClass: "bg-blue-500/10 dark:bg-blue-500/20", barColor: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", height: "h-[180px]" },
              { label: "Interviewing", value: stats.interviewing, colorClass: "bg-purple-500/10 dark:bg-purple-500/20", barColor: "bg-purple-500", textColor: "text-purple-600 dark:text-purple-400", height: "h-[80px]" },
              { label: "Offers", value: stats.offers, colorClass: "bg-green-500/10 dark:bg-green-500/20", barColor: "bg-green-500", textColor: "text-green-600 dark:text-green-400", height: "h-[40px]" },
            ].map((stage) => (
              <Link key={stage.label} href="/app/jobs/tracker" className="w-full flex flex-col items-center group cursor-pointer">
                <div className={`w-full ${stage.colorClass} rounded-t-2xl ${stage.height} relative transition-all group-hover:brightness-110`}>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    {statsLoading ? (
                      <div className={`w-10 h-8 ${stage.colorClass} rounded animate-pulse mx-auto`} />
                    ) : (
                      <span className={`text-3xl font-black ${stage.textColor}`}>{stage.value}</span>
                    )}
                  </div>
                </div>
                <div className={`w-full py-3 ${stage.barColor} rounded-b-2xl text-center text-white font-bold text-xs uppercase tracking-widest`}>
                  {stage.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Quick Tools Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white mb-6">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {quickTools.map((tool) => (
              <Link key={tool.name} href={tool.href}>
                <div className="bg-white dark:bg-[#111111] border border-border/50 rounded-[2rem] p-6 hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/[0.02] group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${tool.color} rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="w-12 h-12 rounded-xl bg-muted/50 dark:bg-white/5 flex items-center justify-center mb-6">
                    <tool.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-xl font-black text-foreground mb-2">{tool.name}</h4>
                  <p className="text-sm font-medium text-muted-foreground">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Activity Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white">AI Activity</h3>
            <Activity className="w-5 h-5 text-primary animate-pulse" />
          </div>

          {activitiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground/70">Start applying to jobs to see your AI activity here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((log, index) => {
                const { icon: Icon, color, bg } = getActivityIcon(log.action);
                return (
                  <div key={log.id} className="flex gap-4 relative">
                    {index !== activities.length - 1 && (
                      <div className="absolute top-10 left-5 bottom-[-20px] w-px bg-border/50" />
                    )}
                    <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${bg} z-10`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-snug mb-1">{formatAction(log)}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/app/notifications" className="w-full mt-8 bg-muted/50 dark:bg-white/5 text-foreground px-4 py-3 rounded-xl font-bold text-sm hover:bg-muted dark:hover:bg-white/10 transition-colors block text-center">
            View All Logs
          </Link>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Skill Learner
          </h3>
          <Link href="/app/learning-hub" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            View Learning Hub <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {coursesLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#111111] border border-border/50 rounded-[2rem] p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] border border-border/50 rounded-[2rem] p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-muted-foreground">No recommendations yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Complete your profile to get personalized course recommendations.</p>
            <Link href="/app/learning-hub" className="inline-block mt-4 text-sm font-bold text-primary hover:underline">Browse all courses</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href="/app/learning-hub">
                <div className="bg-white dark:bg-[#111111] border border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group flex flex-col cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg mb-2 text-secondary dark:text-white line-clamp-2">{course.title}</h4>
                  <p className="text-sm text-secondary/60 dark:text-white/60 mb-6 flex-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md text-secondary/70 dark:text-white/70 capitalize">
                      {course.level} · {course.isFree ? "Free" : "Pro"}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                      <PlayCircle className="w-4 h-4" /> Start
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
