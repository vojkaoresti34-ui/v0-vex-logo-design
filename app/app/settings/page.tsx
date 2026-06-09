"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { CreditCard, Link2, Bell, UserCircle, ChevronRight, Shield } from "lucide-react";

const SECTIONS = [
  {
    href: "/app/profile",
    icon: <UserCircle className="w-6 h-6" />,
    title: "Profile",
    description: "Edit your name, bio, location, and career preferences.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    href: "/app/settings/billing",
    icon: <CreditCard className="w-6 h-6" />,
    title: "Billing & Plans",
    description: "View your plan, AI credits, and monthly usage stats.",
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/app/settings/integrations",
    icon: <Link2 className="w-6 h-6" />,
    title: "Integrations",
    description: "Connect LinkedIn, GitHub, Google Calendar, and ATS platforms.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    href: "/app/notifications",
    icon: <Bell className="w-6 h-6" />,
    title: "Notifications",
    description: "Control which alerts and emails you receive from Vex.",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
];

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="max-w-[700px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">
            Settings
          </h1>
        </div>
        {user && (
          <p className="text-secondary/60 dark:text-white/60 font-medium text-lg">
            {user.email}
          </p>
        )}
      </div>

      {/* Section links */}
      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-5 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg text-secondary dark:text-white mb-0.5">{s.title}</p>
              <p className="text-sm font-medium text-secondary/60 dark:text-white/60 truncate">
                {s.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-secondary/30 dark:text-white/30 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
