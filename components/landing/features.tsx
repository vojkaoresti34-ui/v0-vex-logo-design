"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, FileText, Rocket, Target } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Skill Analysis",
    description: "Our AI analyzes your current skills, experience, and career goals to identify exactly what you need to learn next.",
  },
  {
    icon: Target,
    title: "Personalized Courses",
    description: "Get custom-generated mini-courses tailored to fill your specific skill gaps and match market demands.",
  },
  {
    icon: FileText,
    title: "CV Enhancement",
    description: "AI-powered CV optimization that highlights your strengths and matches you with ideal job opportunities.",
  },
  {
    icon: Rocket,
    title: "Auto-Apply Jobs",
    description: "Sit back while Vex automatically applies to relevant positions, tracking every application for you.",
  },
];

export function Features() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Core Features
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
            Everything You Need to
            <br />
            <span className="text-primary">Accelerate Your Career</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four powerful AI-driven tools working together to transform your job search.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
