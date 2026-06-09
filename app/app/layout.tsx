"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser, signOut } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Send,
  FileText,
  MessageSquare,
  MonitorPlay,
  Briefcase,
  Settings,
  Bell,
  Search,
  LogOut,
  KanbanSquare,
  Crosshair,
  Map,
  Globe,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeatureIntro } from "@/components/feature-intro";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/jobs/matches", label: "Job Matches", icon: Briefcase },
  { href: "/app/jobs/tracker", label: "Job Tracker", icon: KanbanSquare },
  { href: "/app/auto-apply", label: "Auto Apply", icon: Send },
  { href: "/app/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/app/ats-analyzer", label: "ATS Analyzer", icon: Crosshair },
  { href: "/app/cover-letter", label: "Cover Letter", icon: FileText },
  { href: "/app/interview-prep", label: "Mock Interviews", icon: MonitorPlay },
  { href: "/app/learning-hub", label: "Learning Hub", icon: BookOpen },
  { href: "/app/career-roadmap", label: "Career Roadmap", icon: Map },
  { href: "/app/portfolio", label: "Portfolio", icon: Globe },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user && user.onboardingDone === false) {
      router.push("/onboarding?from_auth=true");
    }
  }, [isLoaded, user, router]);

  const fullName = user?.name ?? null;
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";
  const plan = user?.plan ?? "FREE";

  async function handleLogout() {
    await signOut();
  }

  function handleSearch(e: React.SyntheticEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/app/jobs/matches?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} onClick={onLinkClick}>
            <span className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide group ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
              <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"} transition-colors`} />
              {link.label}
            </span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#0A0A0A] flex overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 w-72 border-r border-border/50 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-xl hidden md:flex flex-col shadow-2xl shadow-black/[0.02]">
        <div className="p-8 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-primary/20 text-xl">V</div>
          <span className="text-2xl font-black tracking-tighter uppercase italic text-foreground">Vex</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-8 custom-scrollbar">
          <NavLinks />
        </nav>
        <div className="p-4 mt-auto border-t border-border/50">
          <Link href="/app/settings">
            <span className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide group ${pathname === "/app/settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
              <Settings className="w-5 h-5 group-hover:text-primary transition-colors" />
              Settings
            </span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide text-red-500 hover:bg-red-500/10 mt-2">
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed top-0 left-0 bottom-0 w-[280px] z-50 border-r border-border/50 bg-white dark:bg-[#111111] flex flex-col shadow-2xl md:hidden">
              <div className="p-6 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-primary/20 text-xl">V</div>
                  <span className="text-2xl font-black tracking-tighter uppercase italic text-foreground">Vex</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-black/5 dark:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-8 custom-scrollbar">
                <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
              </nav>
              <div className="p-4 mt-auto border-t border-border/50">
                <Link href="/app/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide group ${pathname === "/app/settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
                    <Settings className="w-5 h-5 group-hover:text-primary transition-colors" />
                    Settings
                  </span>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide text-red-500 hover:bg-red-500/10 mt-2">
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden w-full max-w-[100vw]">
        <header className="h-20 md:h-24 px-4 md:px-8 border-b border-border/50 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-md flex items-center justify-between shrink-0 gap-4">
          <button className="md:hidden p-2 -ml-2 text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden md:flex items-center w-96 group">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, resumes, courses..."
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-full py-3 pl-12 pr-6 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-6 ml-auto">
            <ThemeToggle />
            <Link href="/app/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
            </Link>
            <Link href="/app/settings" className="flex items-center gap-3 pl-6 border-l border-border/50 cursor-pointer group">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-foreground">{isLoaded ? (fullName ?? "Account") : "Loading..."}</div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider">{plan} Plan</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary dark:bg-white/10 flex items-center justify-center text-primary dark:text-white font-black group-hover:scale-105 transition-transform shadow-lg shadow-black/5">
                {user?.image ? (
                  <img src={user.image} alt={fullName ?? ""} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  initials
                )}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-full">
            {children}
          </motion.div>
        </div>
      </main>

      {/* First-visit "how to use this" guides for every feature */}
      <FeatureIntro />
    </div>
  );
}
