"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crosshair,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Scan,
  Loader2,
  AlertCircle,
  History,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  fileUrl?: string;
}

interface ATSResult {
  id: string;
  score: number;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: { section: string; issue: string; fix: string; priority: string }[];
  sections: {
    contact: number;
    summary: number;
    experience: number;
    skills: number;
    education: number;
    formatting: number;
  };
  resume?: { title: string };
  createdAt?: string;
}

function ScoreColor(score: number) {
  if (score >= 80) return "text-green-500 stroke-green-500";
  if (score >= 60) return "text-yellow-500 stroke-yellow-500";
  return "text-red-500 stroke-red-500";
}

function BarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default function AtsAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [history, setHistory] = useState<ATSResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResumes(data);
          if (data[0]) setResumeId(data[0].id);
        }
      });

    fetch("/api/ats/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  async function handleAnalyze(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!resumeId || !jobDescription.trim()) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
      // Refresh history
      fetch("/api/ats/history")
        .then((r) => r.json())
        .then((d) => { if (Array.isArray(d)) setHistory(d); });
    } catch (err: any) {
      setError(err.message ?? "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Crosshair className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
              ATS Score Analyzer
            </h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
            Compare your resume against any job description to find missing keywords.
          </p>
        </div>
        {result && (
          <button
            onClick={() => setResult(null)}
            className="flex items-center gap-2 px-6 py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-transform"
          >
            <Scan className="w-4 h-4" /> New Scan
          </button>
        )}
      </div>

      {!result ? (
        /* Input Form */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resume Selection */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-black mb-6">1. Select Your Resume</h3>

            {resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-secondary/30 dark:text-white/30" />
                </div>
                <p className="font-bold text-secondary dark:text-white mb-2">No resumes uploaded yet</p>
                <p className="text-sm text-secondary/60 dark:text-white/60 mb-6">
                  Upload a resume first to run an ATS analysis.
                </p>
                <Link
                  href="/app/resume-builder"
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  Go to Resume Builder <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <label
                    key={resume.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      resumeId === resume.id
                        ? "border-primary bg-primary/5"
                        : "border-black/5 dark:border-white/5 hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="resume"
                      value={resume.id}
                      checked={resumeId === resume.id}
                      onChange={() => setResumeId(resume.id)}
                      className="accent-primary"
                    />
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-bold text-secondary dark:text-white truncate">{resume.title}</p>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Job Description */}
          <form
            onSubmit={handleAnalyze}
            className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-black mb-4">2. Job Description</h3>
            <textarea
              className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[280px]"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <button
              type="submit"
              disabled={analyzing || !resumeId || !jobDescription.trim()}
              className="w-full mt-4 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-md hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI…
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" /> Analyze Match
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Results View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          {/* Main: Score & Keywords */}
          <div className="xl:col-span-2 space-y-8">
            {/* Top Score */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 flex items-center gap-6">
              <div
                className={`relative w-24 h-24 shrink-0 flex items-center justify-center`}
              >
                <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-black/5 dark:stroke-white/10 fill-none" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40"
                    className={`fill-none ${ScoreColor(result.score).split(" ")[1]}`}
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset={(1 - result.score / 100) * 251.2}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`text-2xl font-black ${ScoreColor(result.score).split(" ")[0]}`}>
                  {result.score}%
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xl leading-tight mb-1">
                  {result.score >= 80 ? "Strong Match" : result.score >= 60 ? "Moderate Match" : "Weak Match"}
                </h4>
                <p className="text-sm font-medium text-secondary/60 dark:text-white/60">
                  {result.presentKeywords.length} keywords matched &bull; {result.missingKeywords.length} missing
                </p>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-8">Keyword Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Missing */}
                <div>
                  <h4 className="font-bold text-red-500 flex items-center gap-2 mb-4 pb-2 border-b border-red-500/20">
                    <XCircle className="w-5 h-5" /> Missing Keywords
                  </h4>
                  {result.missingKeywords.length === 0 ? (
                    <p className="text-sm font-medium text-secondary/60 dark:text-white/60">
                      No missing keywords — great match!
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {result.missingKeywords.map((kw) => (
                        <li key={kw} className="flex justify-between items-center">
                          <span className="font-bold text-sm">{kw}</span>
                          <span className="text-xs font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded">
                            Missing
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Present */}
                <div>
                  <h4 className="font-bold text-green-500 flex items-center gap-2 mb-4 pb-2 border-b border-green-500/20">
                    <CheckCircle2 className="w-5 h-5" /> Matched Keywords
                  </h4>
                  {result.presentKeywords.length === 0 ? (
                    <p className="text-sm font-medium text-secondary/60 dark:text-white/60">
                      No matching keywords found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {result.presentKeywords.slice(0, 8).map((kw) => (
                        <li key={kw} className="flex justify-between items-center">
                          <span className="font-bold text-sm">{kw}</span>
                          <span className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded">
                            Found
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xl font-black mb-6">AI Suggestions</h3>
                <div className="space-y-4">
                  {result.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border flex gap-3 ${
                        s.priority === "high"
                          ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                          : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                      }`}
                    >
                      <TrendingUp
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          s.priority === "high" ? "text-red-500" : "text-blue-500"
                        }`}
                      />
                      <div>
                        <p className="font-bold text-sm mb-0.5">{s.section}: {s.issue}</p>
                        <p className="text-xs font-medium text-secondary/70 dark:text-white/70">{s.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Section Scores */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Section Scores</h3>
              <div className="space-y-5">
                {Object.entries(result.sections).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="capitalize">{key}</span>
                      <span className={val >= 80 ? "text-green-500" : val >= 60 ? "text-yellow-500" : "text-red-500"}>
                        {val}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${BarColor(val)}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/app/resume-builder"
              className="flex items-center gap-3 p-5 bg-primary/5 border border-primary/20 rounded-3xl hover:bg-primary/10 transition-colors group"
            >
              <div className="flex-1">
                <p className="font-bold text-sm text-secondary dark:text-white mb-0.5">
                  Fix in Resume Builder
                </p>
                <p className="text-xs font-medium text-secondary/60 dark:text-white/60">
                  Apply suggestions directly to your resume.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Analysis History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Past Analyses
          </h3>
          {historyLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => setResult(h)}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      h.score >= 80
                        ? "bg-green-500/10 text-green-600"
                        : h.score >= 60
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {h.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{h.resume?.title ?? "Resume"}</p>
                    <p className="text-xs font-medium text-secondary/60 dark:text-white/60">
                      {new Date(h.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary/40 dark:text-white/30 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
