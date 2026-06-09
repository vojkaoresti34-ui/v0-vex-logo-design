"use client";

import { motion } from "framer-motion";
import { Briefcase, Search, MapPin, DollarSign, Filter, Star, Sparkles, Send } from "lucide-react";
import { useState } from "react";

const jobs = [
  { id: 1, company: "Stripe", role: "Senior Frontend Engineer", location: "Remote, US", salary: "$160k - $210k", type: "Full-time", posted: "2h ago", match: 98, logo: "S" },
  { id: 2, company: "Vercel", role: "Software Engineer, DX", location: "Remote", salary: "$150k - $190k", type: "Full-time", posted: "5h ago", match: 95, logo: "V" },
  { id: 3, company: "Netflix", role: "UI Architect", location: "Los Gatos, CA", salary: "$200k - $250k", type: "Hybrid", posted: "1d ago", match: 88, logo: "N" },
  { id: 4, company: "Linear", role: "Product Engineer", location: "Remote", salary: "$140k - $180k", type: "Full-time", posted: "2d ago", match: 85, logo: "L" },
];

export default function JobBoardPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" /> Job Search
          </h1>
          <p className="text-muted-foreground font-medium">Discover opportunities matched to your profile by AI.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Filters */}
        <div className="w-full lg:w-64 bg-white dark:bg-[#111111] rounded-[2rem] border border-border/50 shadow-xl shadow-black/[0.02] p-6 shrink-0 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase tracking-widest text-foreground">Filters</h3>
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="space-y-6">
            {/* Job Type */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Job Type</h4>
              <div className="space-y-2">
                {['Full-time', 'Contract', 'Internship'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border-2 border-border/50 group-hover:border-primary/50 flex items-center justify-center transition-colors">
                      {type === 'Full-time' && <div className="w-2.5 h-2.5 bg-primary rounded-sm" />}
                    </div>
                    <span className="text-sm font-bold text-foreground">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Location</h4>
              <div className="space-y-2">
                {['Remote', 'On-site', 'Hybrid'].map(loc => (
                  <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border-2 border-border/50 group-hover:border-primary/50 flex items-center justify-center transition-colors">
                      {loc === 'Remote' && <div className="w-2.5 h-2.5 bg-primary rounded-sm" />}
                    </div>
                    <span className="text-sm font-bold text-foreground">{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Min Salary</h4>
              <input type="range" min="50000" max="250000" step="10000" defaultValue="120000" className="w-full accent-primary" />
              <div className="flex justify-between text-xs font-bold text-muted-foreground mt-2">
                <span>$50k</span>
                <span className="text-primary">$120k+</span>
                <span>$250k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Job Listings */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#111111] rounded-[2rem] border border-border/50 shadow-xl shadow-black/[0.02] overflow-hidden">
          
          {/* Search Bar */}
          <div className="p-6 border-b border-border/50 bg-black/5 dark:bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by role, company, or tech stack..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#1A1A1A] border border-border/50 focus:border-primary/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Job Cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {jobs.map((job, idx) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-[2rem] p-6 hover:border-primary/30 transition-all shadow-sm hover:shadow-md group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start sm:items-center gap-6 relative z-10">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center font-black text-2xl text-secondary dark:text-white shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {job.logo}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-foreground">{job.role}</h3>
                      {job.match > 90 && (
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {job.match}% Match
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-muted-foreground mb-3">{job.company}</div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-secondary dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-secondary dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> {job.salary}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-secondary dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> {job.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end relative z-10 shrink-0">
                  <button className="flex-1 sm:flex-none bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> 1-Click Apply
                  </button>
                  <button className="w-12 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-2 rounded-xl border border-border/50 text-muted-foreground font-bold text-sm hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                    <Star className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" /> <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
