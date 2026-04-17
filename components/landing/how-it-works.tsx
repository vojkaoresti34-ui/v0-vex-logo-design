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
    <section id="how-it-works" className="py-24 relative bg-card/30">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
            From Signup to Hired
            <br />
            <span className="text-primary">In 4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our streamlined process gets you from where you are to where you want to be.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-border">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-primary origin-left"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg mb-6 relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
