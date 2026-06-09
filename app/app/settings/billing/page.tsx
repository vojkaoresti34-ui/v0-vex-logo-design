"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface BillingStats {
  plan: string;
  cycleStart: string;
  cycle: {
    applications: number;
    coverLetters: number;
    interviews: number;
    timeSavedHours: number;
  };
  lifetime: {
    applications: number;
    coverLetters: number;
  };
}

const PLAN_CONFIG = {
  FREE: {
    label: "Free",
    price: "$0",
    color: "from-gray-500 to-gray-700",
    features: ["10 Applications / month", "Basic ATS Analysis", "1 Resume", "Community Support"],
    creditLimit: 50,
  },
  PRO: {
    label: "Vex Pro",
    price: "$29",
    color: "from-primary to-blue-600",
    features: [
      "Unlimited Auto-Applications",
      "Priority AI Model Access",
      "Advanced ATS Keyword Optimization",
      "Career Roadmap & Coaching",
    ],
    creditLimit: 5000,
  },
  LIFETIME: {
    label: "Vex Lifetime",
    price: "One-time",
    color: "from-purple-500 to-indigo-600",
    features: [
      "Everything in Pro — forever",
      "No monthly charges",
      "Early access to new features",
      "Priority support",
    ],
    creditLimit: 10000,
  },
};

function daysUntilMonthEnd() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function BillingPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const rawPlan = (stats?.plan ?? "FREE").toUpperCase() as keyof typeof PLAN_CONFIG;
  const plan = PLAN_CONFIG[rawPlan] ?? PLAN_CONFIG.FREE;
  const isPro = rawPlan === "PRO" || rawPlan === "LIFETIME";
  const daysLeft = daysUntilMonthEnd();

  // Credit usage based on this month's activity (rough estimate)
  const creditsUsed = stats
    ? stats.cycle.applications * 2 + stats.cycle.coverLetters * 5 + stats.cycle.interviews * 20
    : 0;
  const creditPct = Math.min(100, Math.round((creditsUsed / plan.creditLimit) * 100));

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <CreditCard className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
            Billing & Plans
          </h1>
        </div>
        <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
          Manage your subscription, AI credits, and usage.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main: Active Plan */}
          <div className="md:col-span-2 space-y-8">
            {/* Plan Card */}
            <div
              className={`bg-gradient-to-br ${plan.color} rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />

              <div className="relative z-10 flex justify-between items-start mb-10">
                <div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                    {isPro ? "Active Plan" : "Current Plan"}
                  </span>
                  <h2 className="text-4xl font-black mb-2">{plan.label}</h2>
                  {isPro ? (
                    <p className="text-white/80 font-medium">
                      Billed monthly &bull; Renews in {daysLeft} days
                    </p>
                  ) : (
                    <p className="text-white/80 font-medium">
                      Upgrade to unlock unlimited AI tools
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black">{plan.price}</span>
                  {isPro && rawPlan !== "LIFETIME" && (
                    <span className="text-white/80 font-medium">/mo</span>
                  )}
                </div>
              </div>

              <div className="relative z-10 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/80 shrink-0" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex flex-wrap gap-4">
                {!isPro ? (
                  <Link
                    href="/#pricing"
                    className="bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Upgrade to Pro
                  </Link>
                ) : (
                  <>
                    {rawPlan === "PRO" && (
                      <Link
                        href="/#pricing"
                        className="bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        Upgrade to Lifetime
                      </Link>
                    )}
                    <a
                      href="mailto:support@vex.app?subject=Cancel%20Subscription"
                      className="bg-transparent border-2 border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
                    >
                      Cancel Subscription
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* No payment processor — honest state */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-2">Payment & Invoices</h3>
              <p className="text-secondary/60 dark:text-white/60 font-medium text-sm mb-6">
                Billing is managed securely by our payment provider.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl">
                <div className="flex-1">
                  <p className="font-bold text-secondary dark:text-white mb-1">
                    Manage your subscription
                  </p>
                  <p className="text-sm text-secondary/60 dark:text-white/60 font-medium">
                    View invoices, update payment method, or change your plan from the billing portal.
                  </p>
                </div>
                <a
                  href="mailto:support@vex.app?subject=Billing%20Portal%20Access"
                  className="shrink-0 flex items-center gap-2 px-5 py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  Contact Billing <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Lifetime stats */}
            {stats && (
              <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xl font-black mb-6">Lifetime Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <p className="text-3xl font-black text-secondary dark:text-white">
                      {stats.lifetime.applications}
                    </p>
                    <p className="text-sm font-medium text-secondary/60 dark:text-white/60 mt-1">
                      Total Applications
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <p className="text-3xl font-black text-secondary dark:text-white">
                      {stats.lifetime.coverLetters}
                    </p>
                    <p className="text-sm font-medium text-secondary/60 dark:text-white/60 mt-1">
                      Cover Letters Generated
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Credit Usage */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> AI Credit Usage
              </h3>

              <div className="mb-6">
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-black">{creditsUsed.toLocaleString()}</span>
                  <span className="text-sm font-medium text-secondary/60 dark:text-white/60 mb-1">
                    &nbsp;/ {plan.creditLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${creditPct > 80 ? "bg-red-500" : "bg-primary"}`}
                    style={{ width: `${creditPct}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-secondary/50 dark:text-white/50 mt-3 flex items-center gap-1 uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> Resets in {daysLeft} days
                </p>
              </div>

              {!isPro && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                    <h4 className="font-bold text-sm text-primary">Need more AI power?</h4>
                  </div>
                  <p className="text-xs font-medium text-secondary/70 dark:text-white/70 mb-3 ml-6">
                    Upgrade to Pro for 5,000 monthly credits and unlimited applications.
                  </p>
                  <Link
                    href="/#pricing"
                    className="block ml-6 w-[calc(100%-24px)] bg-primary text-primary-foreground py-2 rounded-xl text-xs font-bold text-center shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* This billing cycle stats */}
            {stats && (
              <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                <h4 className="font-bold text-sm mb-4 text-secondary/60 dark:text-white/60 uppercase tracking-widest">
                  This Month
                </h4>

                <ul className="space-y-4">
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-medium text-secondary/80 dark:text-white/80">
                      Auto-Applications
                    </span>
                    <span className="font-black text-secondary dark:text-white">
                      {stats.cycle.applications}
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-medium text-secondary/80 dark:text-white/80">
                      Cover Letters Gen.
                    </span>
                    <span className="font-black text-secondary dark:text-white">
                      {stats.cycle.coverLetters}
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-medium text-secondary/80 dark:text-white/80">
                      Mock Interviews
                    </span>
                    <span className="font-black text-secondary dark:text-white">
                      {stats.cycle.interviews}
                    </span>
                  </li>
                  <li className="pt-4 mt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-sm">
                    <span className="font-bold text-secondary dark:text-white">Est. Time Saved</span>
                    <span className="font-black text-green-500">
                      ~{stats.cycle.timeSavedHours}h
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {/* Account info */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm mb-4 text-secondary/60 dark:text-white/60 uppercase tracking-widest">
                Account
              </h4>
              <div className="space-y-2">
                <p className="text-sm font-bold text-secondary dark:text-white truncate">
                  {user?.email ?? "—"}
                </p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    isPro
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 dark:bg-white/10 text-secondary dark:text-white"
                  }`}
                >
                  {plan.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
