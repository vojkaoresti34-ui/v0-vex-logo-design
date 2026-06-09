"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass";
import { Globe } from "@/components/ui/cobe-globe";

const markers = [
  { id: "sf", location: [37.7595, -122.4367] as [number, number], label: "San Francisco" },
  { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
  { id: "tokyo", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
  { id: "london", location: [51.5074, -0.1278] as [number, number], label: "London" },
  { id: "sydney", location: [-33.8688, 151.2093] as [number, number], label: "Sydney" },
  { id: "capetown", location: [-33.9249, 18.4241] as [number, number], label: "Cape Town" },
  { id: "dubai", location: [25.2048, 55.2708] as [number, number], label: "Dubai" },
  { id: "paris", location: [48.8566, 2.3522] as [number, number], label: "Paris" },
  { id: "saopaulo", location: [-23.5505, -46.6333] as [number, number], label: "São Paulo" },
];

const arcs = [
  { id: "sf-tokyo", from: [37.7595, -122.4367] as [number, number], to: [35.6762, 139.6503] as [number, number], label: "SF → Tokyo" },
  { id: "nyc-london", from: [40.7128, -74.006] as [number, number], to: [51.5074, -0.1278] as [number, number], label: "NYC → London" },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
      <GlassFilter />
      
      {/* Background Effects - Refined for Light UI */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-[120px]"
        />
      </div>

      {/* Interactive Globe Background */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] opacity-80 pointer-events-none z-0">
        <Globe
          markers={markers}
          arcs={arcs}
          markerColor={[0.9, 1.0, 0.16]}
          baseColor={[0.3, 0.3, 0.3]} // Darker base color to be visible on light background
          arcColor={[0.04, 0.29, 0.31]}
          glowColor={[0.94, 0.93, 0.91]}
          dark={0}
          mapBrightness={6}
          markerSize={0.025}
          markerElevation={0.01}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10 bg-card border border-border shadow-sm">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI-Powered Career Acceleration</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-[900] tracking-[-0.04em] text-foreground mb-6 sm:mb-8 text-balance uppercase leading-[1.1]"
        >
          Land Your Dream Job{" "}
          <span className="inline-block relative">
            <span className="relative z-10 italic">Faster</span>
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute bottom-2 left-0 h-[0.15em] bg-primary/30 -z-0"
            />
          </span>{" "}
          <span className="text-secondary">& Smarter</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed font-medium"
        >
          Vex identifies your skill gaps, generates personalized courses, improves your CV, 
          and automatically applies to jobs. Your AI career co-pilot.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            href="/onboarding"
            className="group bg-primary text-primary-foreground px-10 py-5 rounded-full text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 shadow-2xl shadow-primary/40 border-b-4 border-primary/20"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="group flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold text-foreground hover:bg-secondary/5 transition-all duration-300 border border-border"
          >
            <span className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current ml-1" />
            </span>
            See How It Works
          </Link>
        </motion.div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <GlassEffect className="rounded-2xl p-1 max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-secondary rounded-full w-3/4 mb-2" />
                    <div className="h-2 bg-secondary/50 rounded-full w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-secondary rounded-lg p-3 sm:p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center">
                    <div className="text-primary font-bold text-xl sm:text-2xl">87%</div>
                    <div className="text-[10px] sm:text-xs text-secondary-foreground/60">Skill Match</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 sm:p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center">
                    <div className="text-primary font-bold text-xl sm:text-2xl">12</div>
                    <div className="text-[10px] sm:text-xs text-secondary-foreground/60">Courses</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 sm:p-4 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center">
                    <div className="text-primary font-bold text-xl sm:text-2xl">24</div>
                    <div className="text-[10px] sm:text-xs text-secondary-foreground/60">Applications</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-primary/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassEffect>
        </motion.div>
      </div>
    </section>
  );
}
