"use client";

import { useState } from "react";
import {
  Link2,
  GitBranch,
  Briefcase,
  Calendar,
  Globe,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Sparkles,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  pro: boolean;
  connectUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Import your profile, sync experience, and auto-apply with LinkedIn Easy Apply.",
    icon: <Briefcase className="w-6 h-6" />,
    connected: false,
    pro: false,
    connectUrl: "https://www.linkedin.com/oauth/v2/authorization",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Pull your repos and contributions into your portfolio automatically.",
    icon: <GitBranch className="w-6 h-6" />,
    connected: false,
    pro: false,
    connectUrl: "https://github.com/login/oauth/authorize",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Get interview reminders and schedule prep sessions directly in your calendar.",
    icon: <Calendar className="w-6 h-6" />,
    connected: false,
    pro: false,
  },
  {
    id: "greenhouse",
    name: "Greenhouse ATS",
    description: "Track applications submitted through Greenhouse ATS in one place.",
    icon: <Globe className="w-6 h-6" />,
    connected: false,
    pro: true,
  },
  {
    id: "workday",
    name: "Workday",
    description: "Sync application status from Workday-powered companies automatically.",
    icon: <Globe className="w-6 h-6" />,
    connected: false,
    pro: true,
  },
];

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  async function handleConnect(integration: Integration) {
    if (integration.pro) return;
    setConnecting(integration.id);
    // Simulate OAuth handshake — replace with real OAuth redirect when ready
    await new Promise((r) => setTimeout(r, 1200));
    setConnected((prev) => {
      const next = new Set(prev);
      next.add(integration.id);
      return next;
    });
    setConnecting(null);
  }

  function handleDisconnect(id: string) {
    setConnected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const connectedCount = connected.size;

  return (
    <div className="max-w-[900px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Link2 className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
              Integrations
            </h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
            Connect your accounts to supercharge your job search.
          </p>
        </div>
        {connectedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-bold text-green-700 dark:text-green-400">
              {connectedCount} connected
            </span>
          </div>
        )}
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const isConnected = connected.has(integration.id);
          const isConnecting = connecting === integration.id;

          return (
            <div
              key={integration.id}
              className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isConnected
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-white/5 text-secondary dark:text-white"
                }`}
              >
                {integration.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-lg text-secondary dark:text-white">
                    {integration.name}
                  </h3>
                  {integration.pro && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                      <Sparkles className="w-3 h-3" /> Pro
                    </span>
                  )}
                  {isConnected && (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-secondary/60 dark:text-white/60">
                  {integration.description}
                </p>
              </div>

              {/* Action */}
              <div className="shrink-0">
                {integration.pro ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm font-bold text-secondary/40 dark:text-white/30 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" /> Pro Only
                  </button>
                ) : isConnected ? (
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="px-5 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(integration)}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/40 dark:border-secondary/40 border-t-white dark:border-t-secondary rounded-full animate-spin" />
                        Connecting…
                      </span>
                    ) : (
                      <>
                        Connect <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs font-medium text-secondary/40 dark:text-white/30">
        OAuth integrations are in beta. Connection state resets on page refresh until server-side OAuth is fully wired.
      </p>
    </div>
  );
}
