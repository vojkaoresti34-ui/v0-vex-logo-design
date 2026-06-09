"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MonitorPlay,
  MessageSquare,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Activity,
  Brain,
  Bot,
  Sparkles,
  Terminal,
  Search,
  Loader2,
  ArrowRight,
  ClipboardCheck,
  Check,
  Plus,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface InterviewSession {
  id: string;
  type: string;
  role: string | null;
  company: string | null;
  status: string;
  duration: number | null;
  overallScore: number | null;
  feedback: string | null;
  createdAt: string;
  _count: { questions: number };
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-500 bg-green-500/10" : score >= 60 ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10";
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${color}`}>
      {score}/100
    </span>
  );
}

export default function InterviewPrepPage() {
  const [prepView, setPrepView] = useState<"simulator" | "manus">("simulator");
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  // Manus agent state
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [taskProgressMsg, setTaskProgressMsg] = useState<string[]>([]);
  const [dossierResult, setDossierResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/interview/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSessions(data);
          if (data[0]) setSelectedSession(data[0]);
        }
      })
      .finally(() => setSessionsLoading(false));
  }, []);

  // Poll Manus task status
  useEffect(() => {
    if (!taskId || taskStatus === "stopped" || taskStatus === "error") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/manus/task/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();
        setTaskStatus(data.status);
        if (data.status === "stopped") {
          const assistantMsg = data.messages?.find((m: any) => m.role === "assistant");
          if (assistantMsg) setDossierResult(assistantMsg.content);
          setIsLaunching(false);
          clearInterval(interval);
        } else if (data.status === "error") {
          setIsLaunching(false);
          clearInterval(interval);
        }
      } catch {}
    }, 2500);
    return () => clearInterval(interval);
  }, [taskId, taskStatus]);

  // Simulate progress messages while Manus works
  useEffect(() => {
    if (!isLaunching) return;
    const messages = [
      "[INFO] Initializing Manus agent session...",
      "[WEB] Crawling live web indexes for recent corporate press releases...",
      "[CRAWL] Scraping engineering blogs & team culture portals...",
      "[AI] Customizing technical mock questions & preparation strategy...",
      "[SUCCESS] Complete briefing dossier compiled!",
    ];
    setTaskProgressMsg([messages[0]]);
    const timers = messages.slice(1).map((msg, i) =>
      setTimeout(() => setTaskProgressMsg((prev) => [...prev, msg]), (i + 1) * 3500)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLaunching]);

  async function handleLaunchManusResearch(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName || !roleTitle) return;
    setIsLaunching(true);
    setDossierResult(null);
    setTaskId(null);
    setTaskStatus("running");
    setTaskProgressMsg([]);
    try {
      const res = await fetch("/api/manus/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, roleTitle }),
      });
      const data = await res.json();
      if (res.ok && data.taskId) {
        setTaskId(data.taskId);
      } else {
        throw new Error(data.error ?? "Failed to trigger agent");
      }
    } catch {
      setTaskStatus("error");
      setTaskProgressMsg((prev) => [...prev, "❌ Failed to initiate autonomous research task."]);
      setIsLaunching(false);
    }
  }

  function handleCopyDossier() {
    if (!dossierResult) return;
    navigator.clipboard.writeText(dossierResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <MonitorPlay className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
              AI Mock Interviews
            </h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
            Practice with AI or deploy autonomous research agents.
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1.5 rounded-2xl border border-black/5 dark:border-white/5 gap-2 shrink-0">
          <button
            onClick={() => setPrepView("simulator")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              prepView === "simulator"
                ? "bg-white dark:bg-[#2c2c2c] shadow text-primary"
                : "text-secondary/60 dark:text-white/60 hover:text-secondary"
            }`}
          >
            <MonitorPlay className="w-4 h-4" /> Mock Simulator
          </button>
          <button
            onClick={() => setPrepView("manus")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${
              prepView === "manus"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                : "text-secondary/60 dark:text-white/60 hover:text-secondary"
            }`}
          >
            <Bot className="w-4 h-4" /> Manus Agent
            <span className="absolute -top-1.5 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {prepView === "simulator" ? (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8"
          >
            {/* Session Viewer */}
            <div className="xl:col-span-2 space-y-6">
              {sessionsLoading ? (
                <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-12 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">No sessions yet</h2>
                  <p className="text-secondary/60 dark:text-white/60 font-medium mb-8 max-w-sm">
                    Start your first AI mock interview to practice answering real interview questions with instant feedback.
                  </p>
                  <Link
                    href="/app/interview-prep/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:scale-105 transition-transform"
                  >
                    <Plus className="w-5 h-5" /> Start First Interview
                  </Link>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6 border-b border-black/5 dark:border-white/5 pb-6">
                    <div>
                      <h2 className="text-2xl font-black mb-1">
                        {selectedSession?.company
                          ? `${selectedSession.company} — ${selectedSession.role ?? "Interview"}`
                          : selectedSession?.role ?? "Mock Interview"}
                      </h2>
                      <p className="text-secondary/60 dark:text-white/60 font-medium text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedSession
                          ? new Date(selectedSession.createdAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                        {selectedSession?.duration
                          ? ` · ${Math.round(selectedSession.duration / 60)}m`
                          : ""}
                      </p>
                    </div>
                    {selectedSession?.overallScore !== null && selectedSession?.overallScore !== undefined && (
                      <ScoreBadge score={selectedSession.overallScore} />
                    )}
                  </div>

                  {/* Session feedback or placeholder */}
                  <div className="space-y-4">
                    {selectedSession?.feedback ? (
                      <div className="p-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 mb-1">Session Feedback</h4>
                          <p className="text-sm font-medium text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                            {selectedSession.feedback}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <PlayCircle className="w-12 h-12 text-primary/30 mb-4" />
                        <p className="font-bold text-secondary dark:text-white mb-1">
                          {selectedSession?.status === "active" ? "Session in Progress" : "Session Complete"}
                        </p>
                        <p className="text-sm text-secondary/60 dark:text-white/60">
                          {selectedSession?._count.questions ?? 0} questions answered
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/app/interview-prep/${selectedSession?.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                      >
                        View Full Session <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/app/interview-prep/new"
                        className="flex items-center gap-2 px-5 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> New
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Session List & Stats */}
            <div className="space-y-6">
              {sessions.length > 0 && (
                <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Session History</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSession(s)}
                        className={`w-full text-left p-4 rounded-2xl transition-all ${
                          selectedSession?.id === s.id
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-sm truncate">
                            {s.company ?? s.role ?? s.type ?? "Session"}
                          </p>
                          {s.overallScore !== null && <ScoreBadge score={s.overallScore} />}
                        </div>
                        <p className="text-xs font-medium text-secondary/60 dark:text-white/60">
                          {new Date(s.createdAt).toLocaleDateString()} · {s._count.questions}Q
                        </p>
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/app/interview-prep/new"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
                  >
                    <Plus className="w-4 h-4" /> New Session
                  </Link>
                </div>
              )}

              {sessions.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Your Stats
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center text-sm">
                      <span className="font-medium text-secondary/70 dark:text-white/70">Total Sessions</span>
                      <span className="font-black text-secondary dark:text-white">{sessions.length}</span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="font-medium text-secondary/70 dark:text-white/70">Avg. Score</span>
                      <span className="font-black text-secondary dark:text-white">
                        {sessions.filter((s) => s.overallScore !== null).length > 0
                          ? Math.round(
                              sessions
                                .filter((s) => s.overallScore !== null)
                                .reduce((acc, s) => acc + (s.overallScore ?? 0), 0) /
                                sessions.filter((s) => s.overallScore !== null).length
                            )
                          : "—"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="font-medium text-secondary/70 dark:text-white/70">Questions Answered</span>
                      <span className="font-black text-secondary dark:text-white">
                        {sessions.reduce((acc, s) => acc + s._count.questions, 0)}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="manus"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-black/5 dark:border-white/5 mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black">Manus Autonomous Preparation Agent</h2>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-secondary/70 dark:text-white/60 text-sm font-medium">
                    Deploy an autonomous AI agent to browse live engineering blogs, company boards, and Glassdoor to build a tailored technical dossier.
                  </p>
                </div>
              </div>

              {!dossierResult && !isLaunching ? (
                <form onSubmit={handleLaunchManusResearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-secondary/60 dark:text-white/60">
                        Company Name
                      </label>
                      <div className="relative flex items-center">
                        <Search className="absolute left-4 w-5 h-5 text-secondary/40" />
                        <input
                          type="text"
                          placeholder="e.g. Stripe, Google, Airbnb"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm font-semibold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-secondary/60 dark:text-white/60">
                        Target Role Title
                      </label>
                      <div className="relative flex items-center">
                        <Terminal className="absolute left-4 w-5 h-5 text-secondary/40" />
                        <input
                          type="text"
                          placeholder="e.g. Senior Frontend Engineer"
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm font-semibold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!companyName || !roleTitle}
                      className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                    >
                      Assemble Autonomous Dossier <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : isLaunching ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-4 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black mb-2 animate-pulse text-secondary dark:text-white">
                    Manus Agent at Work…
                  </h3>
                  <p className="text-secondary/60 dark:text-white/60 text-sm font-medium mb-8 text-center max-w-md">
                    Our agent is accessing a cloud sandbox terminal to perform live search queries.
                  </p>
                  <div className="w-full max-w-2xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed space-y-3 max-h-[300px] overflow-y-auto">
                    {taskProgressMsg.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 ${
                          msg.startsWith("[SUCCESS]")
                            ? "text-green-500"
                            : msg.startsWith("❌")
                            ? "text-red-500"
                            : "text-violet-500 dark:text-violet-300"
                        }`}
                      >
                        <span className="shrink-0 text-secondary/40 select-none">&gt;&gt;</span>
                        <span className="font-semibold">{msg}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 text-secondary/40 animate-pulse pl-5">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary/40" />
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary/40" />
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary/40" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-[#222]/30 border border-black/5 dark:border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-violet-500" />
                      <div className="text-sm font-bold text-secondary dark:text-white">
                        Dossier compiled for{" "}
                        <span className="text-violet-600 dark:text-violet-400 font-extrabold">{companyName}</span>{" "}
                        ({roleTitle})
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyDossier}
                        className="px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        {copied ? (
                          <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                        ) : (
                          <><ClipboardCheck className="w-4 h-4" /> Copy Dossier</>
                        )}
                      </button>
                      <button
                        onClick={() => setDossierResult(null)}
                        className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors shadow-sm"
                      >
                        Run New Agent
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#FAF9F6] dark:bg-[#161616] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-inner prose dark:prose-invert max-w-none font-sans text-secondary/90 dark:text-white/90">
                    <div className="space-y-6 whitespace-pre-wrap leading-relaxed text-sm">
                      {dossierResult}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
