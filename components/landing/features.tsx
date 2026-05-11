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
    <section id="features" className="py-32 relative bg-secondary overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] -z-0" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-6 block">
            Core Features
          </span>
          <h2 className="text-5xl md:text-6xl font-[900] text-white mb-8 tracking-tighter uppercase leading-none">
            Everything You Need to
            <br />
            <span className="text-primary italic">Accelerate Your Career</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed font-medium">
            Four powerful AI-driven tools working together to transform your job search.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-primary/20">
                <feature.icon className="w-8 h-8 text-secondary" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
