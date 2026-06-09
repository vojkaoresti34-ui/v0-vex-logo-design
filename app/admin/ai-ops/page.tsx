"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  TrendingUp,
  Activity,
  Server,
} from "lucide-react";

interface AiOpsData {
  summary: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalRequests: number;
    successCount: number;
    failCount: number;
    successRate: number;
  };
  byProvider: { provider: string; tokens: number; requests: number; successes: number }[];
  byAction: { action: string; tokens: number; requests: number; successRate: number }[];
  dailyUsage: { day: string; tokens: number; requests: number }[];
  failures: { action: string; total: number; failures: number; last_error: string | null }[];
  topExpensive: { action: string; model: string; tokens: number }[];
  recentLogs: {
    id: string;
    action: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    status: string;
    errorMessage: string | null;
    createdAt: string;
  }[];
  modelStats: { model: string; avg_tokens: number; max_tokens: number }[];
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${accent ?? "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-1">{label}</p>
      <p className="text-3xl font-black text-secondary dark:text-white">{value}</p>
      {sub && <p className="text-xs font-medium text-secondary/60 dark:text-white/60 mt-1">{sub}</p>}
    </div>
  );
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function actionLabel(a: string) {
  return a.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminAiOpsPage() {
  const [data, setData] = useState<AiOpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ai-ops");
      if (!res.ok) throw new Error("Failed to load AI ops data");
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Cpu className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
              AI Automation Center
            </h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
            Monitor LLM token usage, provider health, and fallback activity.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl font-bold text-sm hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      ) : data ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              label="Total Tokens (30d)"
              value={fmtTokens(data.summary.totalTokens)}
              sub={`${fmtTokens(data.summary.promptTokens)} prompt / ${fmtTokens(data.summary.completionTokens)} completion`}
              accent="bg-primary/10 text-primary"
            />
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Total Requests"
              value={data.summary.totalRequests.toLocaleString()}
              sub={`${data.summary.successCount} succeeded`}
              accent="bg-green-500/10 text-green-600 dark:text-green-400"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Success Rate"
              value={`${data.summary.successRate}%`}
              sub={`${data.summary.failCount} failed`}
              accent={
                data.summary.successRate >= 95
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : data.summary.successRate >= 80
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }
            />
            <StatCard
              icon={<Server className="w-5 h-5" />}
              label="Providers"
              value={data.byProvider.length}
              sub={data.byProvider.map((p) => p.provider).join(", ")}
              accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Provider Breakdown */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" /> Provider Usage
              </h3>
              {data.byProvider.length === 0 ? (
                <p className="text-sm text-secondary/60 dark:text-white/60">No AI calls logged yet.</p>
              ) : (
                <div className="space-y-5">
                  {data.byProvider.map((p) => {
                    const total = data.summary.totalTokens;
                    const pct = total > 0 ? Math.round((p.tokens / total) * 100) : 0;
                    const successPct = p.requests > 0 ? Math.round((p.successes / p.requests) * 100) : 100;
                    return (
                      <div key={p.provider}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-black text-sm capitalize text-secondary dark:text-white">
                            {p.provider}
                          </span>
                          <div className="flex items-center gap-3 text-xs font-bold text-secondary/60 dark:text-white/60">
                            <span>{fmtTokens(p.tokens)} tokens</span>
                            <span className={successPct >= 95 ? "text-green-500" : "text-yellow-500"}>
                              {successPct}% ok
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Model stats */}
              {data.modelStats.length > 0 && (
                <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/5">
                  <h4 className="font-bold text-sm mb-3 text-secondary/60 dark:text-white/50 uppercase tracking-widest">
                    Avg Tokens by Model
                  </h4>
                  <div className="space-y-2">
                    {data.modelStats.map((m) => (
                      <div key={m.model} className="flex justify-between text-sm">
                        <span className="font-medium text-secondary dark:text-white truncate max-w-[200px]">
                          {m.model}
                        </span>
                        <span className="font-bold text-secondary/60 dark:text-white/60">
                          avg {fmtTokens(m.avg_tokens)} / max {fmtTokens(m.max_tokens)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Breakdown */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Token Usage by Feature
              </h3>
              {data.byAction.length === 0 ? (
                <p className="text-sm text-secondary/60 dark:text-white/60">No AI calls logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.byAction.map((a) => {
                    const max = data.byAction[0].tokens;
                    const pct = max > 0 ? Math.round((a.tokens / max) * 100) : 0;
                    return (
                      <div key={a.action}>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-secondary dark:text-white truncate max-w-[200px]">
                            {actionLabel(a.action)}
                          </span>
                          <span className="text-secondary/60 dark:text-white/60 ml-2 shrink-0">
                            {fmtTokens(a.tokens)} · {a.requests}req
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${a.successRate >= 95 ? "bg-primary" : a.successRate >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Daily Usage Sparkline */}
          {data.dailyUsage.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6">Daily Token Usage (14 days)</h3>
              <div className="flex items-end gap-1.5 h-32">
                {(() => {
                  const max = Math.max(...data.dailyUsage.map((d) => d.tokens), 1);
                  return data.dailyUsage.map((d) => {
                    const h = Math.max(4, Math.round((d.tokens / max) * 100));
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full bg-primary/20 group-hover:bg-primary rounded-t transition-colors"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[9px] font-medium text-secondary/40 dark:text-white/30 hidden md:block">
                          {new Date(d.day).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-secondary dark:bg-white text-white dark:text-secondary text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                          {fmtTokens(d.tokens)} tokens · {d.requests} reqs
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Failures */}
          {data.failures.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Failed Requests (30d)
              </h3>
              <div className="space-y-3">
                {data.failures.map((f) => (
                  <div
                    key={f.action}
                    className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-red-800 dark:text-red-300">
                        {actionLabel(f.action)}
                      </p>
                      {f.last_error && (
                        <p className="text-xs font-medium text-red-700/80 dark:text-red-400/80 truncate">
                          {f.last_error}
                        </p>
                      )}
                    </div>
                    <span className="font-black text-red-600 dark:text-red-400 shrink-0">
                      {f.failures} failures
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Recent AI Calls
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-xs uppercase tracking-widest text-secondary/50 dark:text-white/50">
                    <th className="pb-4 font-bold">Action</th>
                    <th className="pb-4 font-bold">Model</th>
                    <th className="pb-4 font-bold">Tokens</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-3 text-sm font-bold text-secondary dark:text-white">
                        {actionLabel(log.action)}
                      </td>
                      <td className="py-3 text-xs font-medium text-secondary/60 dark:text-white/60">
                        {log.model}
                      </td>
                      <td className="py-3 text-sm font-bold">
                        {fmtTokens(log.totalTokens)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            log.status === "success"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs font-medium text-secondary/60 dark:text-white/60 text-right whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
