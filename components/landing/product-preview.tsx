"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FileText, Map, Zap } from "lucide-react";
import { GlassEffect } from "@/components/ui/liquid-glass";

const previews = [
  {
    id: "cv",
    icon: FileText,
    title: "CV Enhancement",
    description: "AI rewrites and optimizes your resume for ATS systems and human recruiters.",
    preview: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">JD</div>
          <div>
            <div className="font-semibold text-foreground">John Doe</div>
            <div className="text-sm text-muted-foreground">Senior Software Engineer</div>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">ATS Score: 94%</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-foreground">5+ years experience highlighted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-foreground">Keywords optimized for tech roles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-foreground">Achievement-focused bullet points</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "roadmap",
    icon: Map,
    title: "Skill Roadmap",
    description: "Visual learning path showing exactly what skills to acquire and in what order.",
    preview: (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Your Progress</span>
          <span className="text-primary font-semibold">68%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-6">
          <div className="h-full w-[68%] bg-primary rounded-full" />
        </div>
        <div className="space-y-3">
          {["React Advanced", "System Design", "TypeScript", "AWS Fundamentals"].map((skill, i) => (
            <div key={skill} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < 2 ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i < 2 ? "text-foreground" : "text-muted-foreground"}`}>{skill}</span>
              {i < 2 && <span className="ml-auto text-xs text-primary">Completed</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "automation",
    icon: Zap,
    title: "Job Automation",
    description: "Watch as Vex automatically applies to matching positions across platforms.",
    preview: (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Applications Today</span>
          <span className="text-primary font-semibold">12 Sent</span>
        </div>
        <div className="space-y-3">
          {[
            { company: "TechCorp", role: "Senior Dev", status: "Applied", match: "95%" },
            { company: "StartupX", role: "Full Stack", status: "Applied", match: "89%" },
            { company: "BigTech", role: "Engineer", status: "Pending", match: "87%" },
          ].map((job) => (
            <div key={job.company} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {job.company[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{job.role}</div>
                <div className="text-xs text-muted-foreground">{job.company}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${job.status === "Applied" ? "text-primary" : "text-muted-foreground"}`}>{job.status}</div>
                <div className="text-xs text-muted-foreground">{job.match} match</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function ProductPreview() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("cv");

  const activePreview = previews.find((p) => p.id === activeTab);

  return (
    <section className="py-20 md:py-32 relative bg-background overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em] mb-6 block">
            Product Preview
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-[900] text-foreground mb-6 md:mb-8 tracking-tighter uppercase leading-none">
            See Vex <span className="text-primary italic">In Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Experience the power of AI-driven career advancement tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {previews.map((preview) => (
              <button
                key={preview.id}
                onClick={() => setActiveTab(preview.id)}
                className={`w-full text-left p-6 sm:p-8 rounded-[2rem] border-2 transition-all duration-500 transform ${
                  activeTab === preview.id
                    ? "bg-card border-primary shadow-2xl shadow-primary/10 scale-[1.02]"
                    : "bg-card/50 border-border/10 hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeTab === preview.id ? "bg-primary shadow-lg shadow-primary/20 rotate-3" : "bg-secondary/5"
                  }`}>
                    <preview.icon className={`w-8 h-8 transition-colors duration-500 ${activeTab === preview.id ? "text-secondary" : "text-muted-foreground"}`} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black mb-2 uppercase tracking-tight italic ${activeTab === preview.id ? "text-secondary" : "text-muted-foreground"}`}>
                      {preview.title}
                    </h3>
                    <p className="text-base text-muted-foreground font-medium leading-relaxed">{preview.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Backdrop Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-0 rounded-full" />
            
            <div className="bg-secondary rounded-[3rem] p-2 relative z-10 shadow-2xl overflow-hidden border border-white/10">
              <div className="bg-[#141414] rounded-[2.5rem] p-6 sm:p-10 min-h-[500px]">
                <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="ml-4 text-xs font-black uppercase tracking-widest text-white/30 italic">{activePreview?.title}</span>
                  <div className="ml-auto w-32 h-1 bg-white/5 rounded-full" />
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-medium">
                  {activePreview?.preview}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
