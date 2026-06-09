"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Map,
  Target,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  BookOpen,
  Lock,
  Loader2,
  Sparkles,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  order: number;
  category: string;
}

interface Roadmap {
  id: string;
  currentRole: string;
  targetRole: string;
  timelineMonths: number;
  progress: number;
  milestones: Milestone[];
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  skill: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  networking: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  application: { bg: "bg-primary/10", text: "text-primary" },
  certification: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  project: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
};

export default function CareerRoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate form state
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [timelineMonths, setTimelineMonths] = useState(12);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  async function fetchRoadmap() {
    setLoading(true);
    try {
      const res = await fetch("/api/career-roadmap");
      if (!res.ok) throw new Error("Failed to load roadmap");
      const data = await res.json();
      setRoadmap(data);
    } catch {
      setError("Failed to load your career roadmap.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!currentRole.trim() || !targetRole.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/career-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole: currentRole.trim(), targetRole: targetRole.trim(), timelineMonths }),
      });
      if (!res.ok) throw new Error("Failed to generate roadmap");
      const data = await res.json();
      setRoadmap(data);
    } catch {
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleMilestone(milestone: Milestone) {
    setTogglingId(milestone.id);
    try {
      const res = await fetch(`/api/career-roadmap/milestones/${milestone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !milestone.completed }),
      });
      if (!res.ok) throw new Error();
      await fetchRoadmap();
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-3">AI Career Roadmap</h1>
          <p className="text-muted-foreground text-lg font-medium">
            Tell us where you are and where you want to go. Our AI will generate a personalized milestone plan.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold">{error}</div>
        )}

        <form onSubmit={handleGenerate} className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Current Role</label>
            <input
              type="text"
              required
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-black/5 dark:bg-white/5 border border-border/50 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Target Role</label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff Engineer"
              className="w-full bg-black/5 dark:bg-white/5 border border-border/50 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Timeline</label>
            <select
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(Number(e.target.value))}
              className="w-full bg-black/5 dark:bg-white/5 border border-border/50 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={18}>18 months</option>
              <option value={24}>2 years</option>
              <option value={36}>3 years</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={generating}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating your roadmap...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate AI Roadmap</>
            )}
          </button>
        </form>
      </div>
    );
  }

  const completedCount = roadmap.milestones.filter((m) => m.completed).length;
  const progress = roadmap.milestones.length > 0
    ? Math.round((completedCount / roadmap.milestones.length) * 100)
    : 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Map className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-foreground tracking-tight">AI Career Roadmap</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg">
            {roadmap.currentRole} → {roadmap.targetRole} · {roadmap.timelineMonths} months
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRoadmap(null)}
            className="px-5 py-3 bg-white dark:bg-white/5 border border-border/50 text-foreground rounded-xl text-sm font-bold shadow-sm hover:border-primary/40 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Recalculate Path
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold">{error}</div>
      )}

      {/* Progress bar */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground">Overall Progress</span>
          <span className="text-sm font-black text-primary">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-primary rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-medium">
          {completedCount} of {roadmap.milestones.length} milestones completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Milestones Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-xl font-black mb-8 text-foreground">Milestones</h2>

          <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/30 before:to-muted/20">
            {roadmap.milestones.map((milestone) => {
              const colors = categoryColors[milestone.category] ?? categoryColors.skill;
              const isToggling = togglingId === milestone.id;
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  <button
                    onClick={() => toggleMilestone(milestone)}
                    disabled={isToggling}
                    className="absolute -left-8 top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-white dark:bg-[#1A1A1A] disabled:opacity-60"
                    style={{ borderColor: milestone.completed ? "var(--primary)" : undefined }}
                    aria-label={milestone.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : milestone.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  <div className={`ml-2 p-5 rounded-2xl border transition-all ${milestone.completed ? "bg-primary/5 border-primary/20 opacity-70" : "bg-white dark:bg-[#111] border-border/50 hover:border-primary/30"}`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`font-black text-base ${milestone.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {milestone.title}
                      </h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${colors.bg} ${colors.text}`}>
                        {milestone.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-3">{milestone.description}</p>
                    {milestone.dueDate && (
                      <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {new Date(milestone.dueDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-foreground">Summary</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Target</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{roadmap.targetRole}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Timeline</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{roadmap.timelineMonths} months</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Completed</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{completedCount} / {roadmap.milestones.length} milestones</p>
                </div>
              </div>
              {roadmap.milestones.some((m) => !m.completed) && (
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Remaining</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {roadmap.milestones.filter((m) => !m.completed).length} milestones left
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white shadow-lg">
            <h4 className="font-black text-xl mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Learning Hub
            </h4>
            <p className="text-sm text-white/80 mb-6">
              Browse courses matched to your skill gaps on the path to {roadmap.targetRole}.
            </p>
            <Link href="/app/learning-hub" className="w-full bg-white text-primary py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
