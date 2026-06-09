"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AtSign, KeyRound, User, Rocket, Brain, FileText, Target, Loader2 } from "lucide-react";

const features = [
  { icon: FileText, title: "AI CV Optimizer", color: "text-blue-400" },
  { icon: Rocket, title: "Auto Apply Bot", color: "text-primary" },
  { icon: Brain, title: "Skill Gap Analysis", color: "text-purple-400" },
  { icon: Target, title: "Custom Courses", color: "text-orange-400" },
];

export default function SignupPage() {
  const router = useRouter();
  const [isFromOnboarding, setIsFromOnboarding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("plan=ready")) setIsFromOnboarding(true);
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Submit onboarding data collected before signup (non-blocking)
      const stored = localStorage.getItem("vex_onboarding");
      if (stored) {
        try {
          await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: stored,
          });
          localStorage.removeItem("vex_onboarding");
        } catch {
          // non-blocking
        }
      }

      router.push("/app");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#E8E0D5] dark:bg-[#121212] p-4 lg:p-10 font-sans selection:bg-primary/30">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[0%] left-[10%] w-[800px] h-[800px] rounded-full bg-white/40 dark:bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[5%] w-[700px] h-[700px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[40%] w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] grid lg:grid-cols-3 gap-8 items-stretch">

        {/* COLUMN 1: Glass Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 relative overflow-hidden backdrop-blur-3xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-2xl shadow-black/5 flex flex-col"
        >
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <Link href="/" className="font-black text-xl text-secondary dark:text-white uppercase tracking-tighter italic">Vex</Link>
            <Link href="/login" className="text-sm font-bold text-secondary/70 dark:text-white/70 hover:text-primary transition-colors">Log in</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-[900] text-secondary dark:text-white mb-6 md:mb-8 tracking-tight leading-none">
            {isFromOnboarding ? (<>Your Plan<br/>is Ready</>) : (<>Create<br/>Account</>)}
          </h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold">{error}</div>
          )}

          <form className="space-y-4 mb-8 md:mb-10 flex-1" onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-secondary dark:text-white/70" strokeWidth={2.5} />
              </div>
              <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/5 rounded-full py-4 pl-14 pr-6 text-sm font-bold text-secondary dark:text-white placeholder:text-secondary/50 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                <AtSign className="w-4 h-4 text-secondary dark:text-white/70" strokeWidth={2.5} />
              </div>
              <input type="email" placeholder="e-mail address" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/5 rounded-full py-4 pl-14 pr-6 text-sm font-bold text-secondary dark:text-white placeholder:text-secondary/50 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-secondary dark:text-white/70" strokeWidth={2.5} />
              </div>
              <input type="password" placeholder="Create password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/5 rounded-full py-4 pl-14 pr-6 text-sm font-bold text-secondary dark:text-white placeholder:text-secondary/50 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
          </form>

          <div className="relative mb-6 md:mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-secondary/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase tracking-widest font-black">
              <span className="bg-white/30 dark:bg-[#1C1C1C] px-4 text-secondary/50 dark:text-white/40 backdrop-blur-md rounded-full">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-auto">
            <Link
              href="/api/auth/google"
              className="flex-1 bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/5 rounded-full py-3 flex items-center justify-center gap-2 sm:gap-3 hover:bg-white/60 dark:hover:bg-white/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-xs sm:text-sm font-bold text-secondary dark:text-white">Google</span>
            </Link>
            <Link
              href="/api/auth/linkedin"
              className="flex-1 bg-[#0A66C2]/10 border border-[#0A66C2]/20 rounded-full py-3 flex items-center justify-center gap-2 sm:gap-3 hover:bg-[#0A66C2]/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-xs sm:text-sm font-bold text-secondary dark:text-white">LinkedIn</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mt-4">
            <p className="text-[10px] leading-relaxed text-secondary/60 dark:text-white/50 max-w-full sm:max-w-[200px] font-medium">
              By signing up, you agree to our Terms of Service.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-12 pl-6 pr-1.5 rounded-full bg-secondary dark:bg-white text-primary dark:text-secondary flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform group disabled:opacity-60 disabled:hover:scale-100"
            >
              <span className="text-xs font-black uppercase tracking-widest text-white dark:text-secondary">
                {loading ? "Creating..." : "Join"}
              </span>
              <div className="w-9 h-9 rounded-full bg-secondary-foreground dark:bg-secondary flex items-center justify-center shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />}
              </div>
            </button>
          </div>
        </motion.div>

        {/* COLUMN 2: Features */}
        <div className="flex flex-col gap-6 justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="mb-4 px-4">
            <h3 className="text-2xl font-[900] text-secondary dark:text-white tracking-tight mb-2">What you get</h3>
            <p className="text-sm text-secondary/70 dark:text-white/60 font-medium">Your personal AI career co-pilot.</p>
          </motion.div>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#1A1A1A] rounded-[2rem] p-5 sm:p-6 relative overflow-hidden group shadow-xl shadow-black/10 flex items-center gap-4 sm:gap-5 hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center relative z-10 border border-white/5 group-hover:rotate-6 transition-transform">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-white mb-1 tracking-tight">{feature.title}</h4>
                  <p className="text-xs font-medium text-white/50">Included in Pro</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/70 transition-colors relative z-10" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* COLUMN 3 */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-black/5">
          <div className="absolute top-1/3 -right-[30%] -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-primary via-yellow-400 to-orange-500 blur-md pointer-events-none opacity-90" />
          <div className="relative z-10 flex justify-between items-start mb-16 md:mb-20">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[900] text-secondary dark:text-white leading-none mb-1 tracking-tight">Join</h2>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-[900] text-secondary/30 dark:text-white/30 tracking-tight">10k+</div>
            </div>
            <div className="text-right text-[10px] font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest leading-loose">Career building<br />made easy</div>
          </div>
          <div className="relative z-10 my-auto py-10">
            <div className="w-16 h-1 bg-secondary/10 dark:bg-white/10 rounded-full mb-4" />
            <p className="text-xl sm:text-2xl font-medium text-secondary/80 dark:text-white/80 leading-tight italic">"Vex got me 5 interviews in my first week."</p>
          </div>
          <div className="relative z-10">
            <div className="mb-10 md:mb-12">
              <div className="text-sm font-black text-secondary dark:text-white mb-1 tracking-widest">PRO MEMBERS</div>
              <div className="text-sm font-medium text-secondary/70 dark:text-white/70">Silicon Valley</div>
              <div className="text-sm font-medium text-secondary/70 dark:text-white/70">San Francisco</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full border border-secondary/20 dark:border-white/20 flex items-center justify-center">
                  <div className="w-4 h-4 border border-secondary dark:border-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                </div>
                <span className="text-xs font-black text-secondary dark:text-white uppercase tracking-widest">Vex</span>
              </div>
              <div className="text-xs font-bold text-secondary/50 dark:text-white/50 uppercase tracking-widest">2025 Edition</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
