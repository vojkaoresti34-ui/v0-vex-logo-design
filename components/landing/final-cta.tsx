"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlassEffect } from "@/components/ui/liquid-glass";

export function FinalCTA() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-background">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-secondary rounded-[3rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-[900] text-white mb-6 md:mb-8 tracking-tighter uppercase leading-none">
                Ready to Land Your
                <br />
                <span className="text-primary italic">Dream Job?</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-14 font-medium">
                Join 10,000+ professionals who stopped job searching and started career building with Vex.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 bg-primary text-secondary px-8 md:px-12 py-5 md:py-6 rounded-full text-lg md:text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-primary/30 w-full sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-lg font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-10 text-sm text-white/40 font-bold uppercase tracking-widest">
                No credit card required. 7-day free trial.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
