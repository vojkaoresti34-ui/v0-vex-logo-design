"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, HelpCircle } from "lucide-react";
import { getFeatureIntro } from "@/lib/feature-intros";
import { useUser } from "@/hooks/use-user";

function seenKey(userId: string, introId: string) {
  return `vex_intro_${userId}_${introId}`;
}

/**
 * Rendered once in the app layout. On first visit to any feature route it shows a
 * one-time "what this does + how to use it" guide. After dismissal it's replaced
 * by a small floating "?" button so users can reopen the guide any time.
 */
export function FeatureIntro() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true); // assume seen until we confirm otherwise

  const intro = getFeatureIntro(pathname);
  const userId = user?.id;

  // Decide whether to auto-open on first visit to this route.
  useEffect(() => {
    if (!isLoaded || !userId || !intro) {
      setOpen(false);
      return;
    }
    let alreadySeen = true;
    try {
      alreadySeen = localStorage.getItem(seenKey(userId, intro.id)) === "1";
    } catch {
      alreadySeen = false;
    }
    setSeen(alreadySeen);
    setOpen(!alreadySeen);
  }, [pathname, isLoaded, userId, intro]);

  if (!intro || !userId) return null;

  function dismiss() {
    setOpen(false);
    setSeen(true);
    try {
      if (userId) localStorage.setItem(seenKey(userId, intro!.id), "1");
    } catch {
      /* ignore */
    }
  }

  function reopen() {
    setOpen(true);
  }

  return (
    <>
      {/* Floating reopen button once the intro has been seen/dismissed */}
      {seen && !open && (
        <button
          onClick={reopen}
          aria-label="How to use this page"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-secondary dark:bg-white text-white dark:text-secondary shadow-xl shadow-black/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismiss}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#161616] border border-black/5 dark:border-white/10 shadow-2xl shadow-black/20">
                {/* glow */}
                <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-primary/30 blur-3xl pointer-events-none" />

                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-secondary/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-[1] p-8">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-black uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" /> Quick start
                    </span>
                  </div>

                  <div className="text-5xl mb-3">{intro.emoji}</div>
                  <h2 className="text-3xl font-[900] tracking-tight text-secondary dark:text-white mb-2">
                    {intro.title}
                  </h2>
                  <p className="text-secondary/70 dark:text-white/60 font-medium mb-6">
                    {intro.tagline}
                  </p>

                  <ol className="space-y-3 mb-8">
                    {intro.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-secondary/80 dark:text-white/75 leading-relaxed">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <button
                    onClick={dismiss}
                    className="w-full h-12 rounded-xl bg-secondary dark:bg-white text-white dark:text-secondary font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    {intro.cta ?? "Got it"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
