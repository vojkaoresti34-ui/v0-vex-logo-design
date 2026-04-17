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
    <section className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Product Preview
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
            See Vex in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI-driven career advancement tools.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {previews.map((preview) => (
              <button
                key={preview.id}
                onClick={() => setActiveTab(preview.id)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  activeTab === preview.id
                    ? "bg-card border-primary/50 shadow-lg shadow-primary/5"
                    : "bg-card/50 border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    activeTab === preview.id ? "bg-primary/20" : "bg-secondary"
                  }`}>
                    <preview.icon className={`w-6 h-6 ${activeTab === preview.id ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${activeTab === preview.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {preview.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{preview.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassEffect className="rounded-2xl p-1">
              <div className="bg-card rounded-xl p-6 min-h-[400px]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-muted-foreground">{activePreview?.title}</span>
                </div>
                {activePreview?.preview}
              </div>
            </GlassEffect>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
