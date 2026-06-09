"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BarChart2,
  FileText,
  Briefcase,
  TrendingUp,
  Activity,
  RefreshCw,
  Loader2,
  Crown,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  users: {
    total: number;
    newThisMonth: number;
    newThisWeek: number;
    byPlan: Record<string, number>;
  };
  applications: {
    total: number;
    thisMonth: number;
  };
  resumes: { total: number };
  jobs: { active: number };
  recentActivity: {
    id: string;
    action: string;
    createdAt: string;
    user: { name: string; email: string };
  }[];
  topActions: { action: string; _count: number }[];
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

function actionLabel(action: string) {
  return action.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
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
              <BarChart2 className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
              Platform Analytics
            </h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
            Real-time metrics across users, applications, and platform activity.
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
              icon={<Users className="w-5 h-5" />}
              label="Total Users"
              value={data.users.total.toLocaleString()}
              sub={`+${data.users.newThisWeek} this week`}
              accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Applications"
              value={data.applications.total.toLocaleString()}
              sub={`${data.applications.thisMonth} this month`}
              accent="bg-green-500/10 text-green-600 dark:text-green-400"
            />
            <StatCard
              icon={<FileText className="w-5 h-5" />}
              label="Resumes"
              value={data.resumes.total.toLocaleString()}
              accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
            <StatCard
              icon={<Briefcase className="w-5 h-5" />}
              label="Active Jobs"
              value={data.jobs.active.toLocaleString()}
              accent="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plan Distribution */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" /> Plan Distribution
              </h3>
              <div className="space-y-4">
                {Object.entries(data.users.byPlan).map(([plan, count]) => {
                  const pct = data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0;
                  const colors: Record<string, string> = {
                    FREE: "bg-gray-400",
                    PRO: "bg-primary",
                    LIFETIME: "bg-purple-500",
                  };
                  return (
                    <div key={plan}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className="text-secondary dark:text-white">{plan}</span>
                        <span className="text-secondary/60 dark:text-white/60">
                          {count.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[plan] ?? "bg-gray-400"} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black text-secondary dark:text-white">
                    {data.users.newThisMonth}
                  </p>
                  <p className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest mt-1">
                    New / 30d
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black text-secondary dark:text-white">
                    {data.users.newThisWeek}
                  </p>
                  <p className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest mt-1">
                    New / 7d
                  </p>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Top User Actions
              </h3>
              {data.topActions.length === 0 ? (
                <p className="text-sm text-secondary/60 dark:text-white/60">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topActions.map((a, i) => {
                    const max = data.topActions[0]._count;
                    const pct = max > 0 ? Math.round((a._count / max) * 100) : 0;
                    return (
                      <div key={a.action}>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-secondary dark:text-white truncate max-w-[180px]">
                            {actionLabel(a.action)}
                          </span>
                          <span className="text-secondary/60 dark:text-white/60 ml-2 shrink-0">
                            {a._count.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </h3>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-secondary/60 dark:text-white/60">No recent activity.</p>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {data.recentActivity.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-black">
                        {a.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-secondary dark:text-white truncate">
                          {a.user?.name ?? a.user?.email ?? "User"}
                        </p>
                        <p className="text-xs font-medium text-secondary/60 dark:text-white/60">
                          {actionLabel(a.action)}
                        </p>
                        <p className="text-[10px] text-secondary/40 dark:text-white/30 mt-0.5">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
