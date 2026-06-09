"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, DollarSign, X, Heart, Sparkles } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  tags: string[];
  logoBg: string;
  logoText: string;
}

const initialJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Vercel",
    location: "Remote",
    salary: "$160k - $200k",
    match: 98,
    tags: ["React", "Next.js", "TypeScript"],
    logoBg: "bg-black dark:bg-white",
    logoText: "text-white dark:text-black",
  },
  {
    id: "2",
    title: "Product Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Hybrid)",
    salary: "$180k - $220k",
    match: 95,
    tags: ["React", "Node.js", "GraphQL"],
    logoBg: "bg-indigo-600",
    logoText: "text-white",
  },
  {
    id: "3",
    title: "Lead UI Developer",
    company: "Linear",
    location: "Remote",
    salary: "$150k - $190k",
    match: 92,
    tags: ["React", "Framer Motion", "Tailwind"],
    logoBg: "bg-purple-600",
    logoText: "text-white",
  },
];

// Reusable card component for both mobile and desktop
function JobCard({ 
  job, 
  onPass, 
  onApply,
  isMobileSwipeable = false,
  index = 0
}: { 
  job: Job; 
  onPass: () => void; 
  onApply: () => void;
  isMobileSwipeable?: boolean;
  index?: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const applyOpacity = useTransform(x, [20, 100], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      onApply();
    } else if (info.offset.x < -100) {
      onPass();
    }
  };

  const cardContent = (
    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-border/50 shadow-xl shadow-black/[0.02] flex flex-col h-full relative overflow-hidden group w-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
      
      {isMobileSwipeable && (
        <>
          <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 border-4 border-destructive text-destructive font-black text-3xl rounded-xl px-4 py-1 rotate-12 z-50 pointer-events-none tracking-widest bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            PASS
          </motion.div>
          <motion.div style={{ opacity: applyOpacity }} className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-black text-3xl rounded-xl px-4 py-1 -rotate-12 z-50 pointer-events-none tracking-widest bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            MATCH
          </motion.div>
        </>
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${job.logoBg} ${job.logoText}`}>
          {job.company.charAt(0)}
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {job.match}% Match
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-xl font-black text-foreground leading-tight mb-1">{job.title}</h3>
        <p className="text-sm font-medium text-muted-foreground mb-4">{job.company}</p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-secondary/70 dark:text-white/70">
            <MapPin className="w-4 h-4" /> {job.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary/70 dark:text-white/70">
            <DollarSign className="w-4 h-4" /> {job.salary}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.tags.map(tag => (
            <span key={tag} className="px-2 py-1 rounded-md bg-muted/50 dark:bg-white/5 text-xs font-bold text-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {!isMobileSwipeable && (
        <div className="flex items-center gap-3 relative z-10 mt-auto pt-6 border-t border-border/50">
          <button 
            onClick={onPass}
            className="flex-1 py-3 rounded-xl border border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-bold transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Pass
          </button>
          <button 
            onClick={onApply}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 font-bold transition-all flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" /> Candidate
          </button>
        </div>
      )}
    </div>
  );

  if (isMobileSwipeable) {
    return (
      <motion.div
        style={{ x, rotate, opacity, scale }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 w-full cursor-grab active:cursor-grabbing origin-bottom"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
        whileTap={{ scale: 1.02 }}
        layout
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
      layout
    >
      {cardContent}
    </motion.div>
  );
}

export function JobMatches() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const handlePass = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleApply = (id: string) => {
    // Here you would typically trigger an API call to save the job
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-12 border border-border/50 shadow-xl shadow-black/[0.02] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-black text-foreground mb-2">You're all caught up!</h3>
        <p className="text-muted-foreground font-medium max-w-md mx-auto">
          Vex AI is analyzing the market for new roles that match your profile. Check back later for more recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-[900] text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Vex Job Matches
          </h2>
          <p className="text-muted-foreground font-medium">Swipe or select jobs you want to candidate for.</p>
        </div>
      </div>

      {/* Mobile Swipe View */}
      <div className="md:hidden relative w-full max-w-sm mx-auto flex flex-col items-center">
        <div className="relative h-[420px] w-full mb-6">
          <AnimatePresence>
            {jobs.map((job, index) => (
              index >= jobs.length - 2 && (
                <div key={job.id} className="absolute inset-0" style={{ zIndex: index }}>
                  <JobCard 
                    job={job} 
                    onPass={() => handlePass(job.id)} 
                    onApply={() => handleApply(job.id)} 
                    isMobileSwipeable
                  />
                </div>
              )
            ))}
          </AnimatePresence>
        </div>
        
        {/* Tinder-style floating action buttons for Mobile */}
        {jobs.length > 0 && (
          <div className="flex items-center justify-center gap-8 pb-4">
            <button 
              onClick={() => handlePass(jobs[jobs.length - 1].id)} 
              className="w-16 h-16 rounded-full bg-white dark:bg-[#111111] border border-border/50 shadow-xl flex items-center justify-center text-destructive hover:scale-110 active:scale-95 transition-all"
            >
              <X size={32} />
            </button>
            <button 
              onClick={() => handleApply(jobs[jobs.length - 1].id)} 
              className="w-16 h-16 rounded-full bg-white dark:bg-[#111111] border border-border/50 shadow-xl flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-all"
            >
              <Heart size={32} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        <AnimatePresence>
          {jobs.map((job, index) => (
            <JobCard 
              key={job.id} 
              job={job} 
              index={index}
              onPass={() => handlePass(job.id)} 
              onApply={() => handleApply(job.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
