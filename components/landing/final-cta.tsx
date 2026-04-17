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
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <GlassEffect className="rounded-3xl p-1">
            <div className="bg-card rounded-2xl p-12 md:p-16 text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
                Ready to Land Your
                <br />
                <span className="text-primary">Dream Job?</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Join 10,000+ professionals who stopped job searching and started career building with Vex.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="#pricing"
                  className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:brightness-110 hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/25"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-8 py-4 rounded-xl text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required. 7-day free trial on all Pro features.
              </p>
            </div>
          </GlassEffect>
        </motion.div>
      </div>
    </section>
  );
}
