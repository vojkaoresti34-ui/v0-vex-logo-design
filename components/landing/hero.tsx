"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      <GlassFilter />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassEffect className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">AI-Powered Career Acceleration</span>
          </GlassEffect>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 text-balance"
          style={{ letterSpacing: "-0.02em" }}
        >
          Land Your Dream Job{" "}
          <span className="text-primary">Faster</span> and{" "}
          <span className="text-primary">Smarter</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Vex identifies your skill gaps, generates personalized courses, improves your CV, 
          and automatically applies to jobs. Your AI career co-pilot.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="#pricing"
            className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:brightness-110 hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/25"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="group flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-foreground hover:bg-secondary transition-all duration-200"
          >
            <span className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Play className="w-4 h-4 fill-current" />
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-primary font-bold text-2xl">87%</div>
                    <div className="text-xs text-muted-foreground">Skill Match</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-primary font-bold text-2xl">12</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-primary font-bold text-2xl">24</div>
                    <div className="text-xs text-muted-foreground">Applications</div>
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
