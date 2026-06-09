"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { N8nWorkflowBlock } from "@/components/ui/n8n-workflow-block-shadcnui";

export function WorkflowSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="workflow" className="py-20 md:py-32 relative bg-background border-t border-border/10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em] mb-6 block">
            Powerful Automation
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] text-foreground mb-6 tracking-tighter uppercase leading-none">
            The Logic Behind The <span className="text-secondary italic">Magic</span>
          </h2>
          <p className="text-xl text-[#898A8D] max-w-2xl mx-auto leading-relaxed font-medium">
            See how our AI processes your requirements through an automated workflow to generate the perfect logo concepts in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Decorative elements around the workflow block */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          
          <N8nWorkflowBlock />
        </motion.div>
      </div>
    </section>
  );
}
