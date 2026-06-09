"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Connect Your Profile",
    description: "Link your LinkedIn, upload your resume, and tell us about your dream role. Our AI starts analyzing immediately.",
  },
  {
    number: "02",
    title: "Identify Skill Gaps",
    description: "Vex compares your skills against thousands of job listings to pinpoint exactly what you need to learn.",
  },
  {
    number: "03",
    title: "Learn & Improve",
    description: "Access personalized mini-courses and watch your CV transform with AI-powered enhancements.",
  },
  {
    number: "04",
    title: "Auto-Apply & Land",
    description: "Sit back while Vex applies to matching jobs. Track everything in your dashboard until you get hired.",
  },
];

export function HowItWorks() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-20 md:py-32 relative bg-background">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em] mb-6 block">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-[900] text-foreground mb-8 tracking-tighter uppercase leading-none">
            From Signup to Hired
            <br />
            <span className="text-secondary italic">In 4 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Our streamlined process gets you from where you are to where you want to be.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-[5.5rem] left-[12.5%] right-[12.5%] h-1 bg-border/30">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-primary origin-left"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative group pt-10"
            >
              <div className="bg-card border-2 border-border/10 rounded-[2.5rem] p-10 h-full hover:border-primary transition-all duration-500 shadow-xl shadow-black/[0.02] dark:shadow-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xl mb-8 relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  {step.number}
                </div>
                <h3 className="text-2xl font-black text-secondary mb-4 uppercase tracking-tight italic">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
