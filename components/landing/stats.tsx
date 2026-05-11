"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 10000, suffix: "+", label: "Users Hired", description: "Successfully placed candidates" },
  { value: 240, suffix: "%", label: "Interview Rate", description: "Increase in callbacks" },
  { value: 85, suffix: "%", label: "Skill Match", description: "Average improvement" },
  { value: 14, suffix: " days", label: "Average Time", description: "From signup to hired" },
];

function CountUp({ end, suffix, duration = 2 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function Stats() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-32 relative bg-background border-y border-border/50">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="text-center group"
            >
              <div className="text-5xl md:text-6xl font-[900] text-primary mb-4 tracking-tighter uppercase tabular-nums">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-black text-foreground mb-3 uppercase tracking-[0.2em]">{stat.label}</div>
              <div className="text-sm text-[#898A8D] font-medium leading-relaxed max-w-[160px] mx-auto">{stat.description}</div>
              
              {/* Bottom bar animation */}
              <motion.div 
                initial={{ width: 0 }}
                animate={isInView ? { width: "40px" } : {}}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className="h-1 bg-primary mx-auto mt-6"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
