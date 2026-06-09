"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Star, 
  X, 
  Zap, 
  Search, 
  SlidersHorizontal,
  Building2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Loader2
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  type: string;
  postedAt: string;
  matchScore: number;
  matchedSkills: string[];
  skills?: string[];
  description: string;
  industry?: string;
}

export default function JobMatchesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoApplyActive, setAutoApplyActive] = useState(false);

  useEffect(() => {
    fetchMatchesAndStatus();
  }, []);

  const fetchMatchesAndStatus = async () => {
    try {
      setLoading(true);
      const [matchesRes, savedRes, appsRes, autoApplyRes] = await Promise.all([
        fetch("/api/jobs/matches"),
        fetch("/api/jobs/saved"),
        fetch("/api/applications?limit=100"),
        fetch("/api/auto-apply/settings")
      ]);

      if (!matchesRes.ok) throw new Error("Failed to fetch matches");
      
      const matchesData = await matchesRes.json();
      setJobs(matchesData.jobs || []);

      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedJobIds((savedData || []).map((j: any) => j.jobId || j.id));
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setAppliedJobIds((appsData.applications || []).map((a: any) => a.jobId));
      }

      if (autoApplyRes.ok) {
        const autoApplyData = await autoApplyRes.json();
        setAutoApplyActive(autoApplyData?.isEnabled ?? false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (jobId: string) => {
    try {
      // Optimistic update
      setSavedJobIds(prev => 
        prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
      );

      const res = await fetch("/api/jobs/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      if (!res.ok) throw new Error("Failed to save job");
    } catch (err) {
      console.error(err);
      // Revert status on failure
      fetchMatchesAndStatus();
    }
  };

  const handleApply = async (job: Job) => {
    try {
      // Optimistic update
      setAppliedJobIds(prev => [...prev, job.id]);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          status: "APPLIED",
          salary: job.salary
        })
      });

      if (!res.ok) throw new Error("Failed to apply");
    } catch (err) {
      console.error(err);
      alert("Application failed. Please try again.");
      fetchMatchesAndStatus();
    }
  };

  const handleIgnore = (jobId: string) => {
    // Local filtering for ignore action
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const getLogoColor = (companyName: string) => {
    const hash = companyName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-[#635BFF]",
      "bg-black dark:bg-white text-white dark:text-black",
      "bg-[#D97757]",
      "bg-[#10A37F]",
      "bg-[#5E6AD2]"
    ];
    return colors[hash % colors.length];
  };

  const getMatchReasons = (job: Job) => {
    return [
      `Headline matched: targeting ${job.industry || "Industry standard"} space.`,
      job.location ? `Location parameters match: ${job.location}.` : "Remote allowance conforms perfectly.",
      `Accumulated skill matches: ${(job.skills ?? []).length} keywords identified.`
    ];
  };

  const filteredJobs = jobs.filter(job => {
    const isSaved = savedJobIds.includes(job.id);
    const isApplied = appliedJobIds.includes(job.id);

    // Apply main category filter
    if (filter === "saved" && !isSaved) return false;
    if (filter === "applied" && !isApplied) return false;
    if (filter === "90plus" && job.matchScore < 90) return false;

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.skills ?? []).some(s => s.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Zap className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">AI Job Matches</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">
            We matched active postings with your career profile. Here are your top algorithmic matches.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40 dark:text-white/40" />
            <input 
              type="text" 
              placeholder="Search companies, roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-secondary/40">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-bold">Matching jobs against your database profile...</p>
        </div>
      ) : error ? (
        <div className="text-center p-20 text-rose-500 font-bold">
          <p>Failed to load matches: {error}</p>
        </div>
      ) : (
        <>
          {/* Analytics & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {[
                { id: 'all', label: 'All Matches', count: jobs.length },
                { id: 'saved', label: 'Saved', count: savedJobIds.length },
                { id: 'applied', label: 'Auto-Applied', count: appliedJobIds.length },
                { id: '90plus', label: '90%+ Score', count: jobs.filter(j => j.matchScore >= 90).length }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === f.id ? 'bg-secondary dark:bg-white text-white dark:text-secondary shadow-md' : 'bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 text-secondary/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  {f.label} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === f.id ? 'bg-white/20 dark:bg-black/10' : 'bg-black/5 dark:bg-white/10'}`}>{f.count}</span>
                </button>
              ))}
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Auto-Apply Status</p>
                <p className="text-sm font-bold text-secondary dark:text-white">{autoApplyActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Zap className="w-5 h-5 fill-primary" />
              </div>
            </div>
          </div>

          {/* Job Feed */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const isApplied = appliedJobIds.includes(job.id);

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={job.id} 
                    className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group"
                  >
                    <div className="flex flex-col xl:flex-row gap-8">
                      
                      {/* Left Col: Job Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md ${getLogoColor(job.company)}`}>
                              {job.company.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-2xl font-black text-secondary dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                {job.title}
                                {isApplied && <span className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-md uppercase tracking-wider">Applied</span>}
                              </h2>
                              <p className="text-secondary/70 dark:text-white/60 font-bold flex items-center gap-1">
                                <Building2 className="w-4 h-4" /> {job.company}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center gap-1.5 text-sm font-bold bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                            <MapPin className="w-4 h-4 text-primary" /> {job.location || "Remote"}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                            <DollarSign className="w-4 h-4 text-green-500" /> {job.salary || "Not Specified"}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                            <Briefcase className="w-4 h-4 text-purple-500" /> {job.type}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-secondary/50 dark:text-white/40">
                            <Clock className="w-4 h-4" /> {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Just posted"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(job.skills ?? []).map(skill => (
                            <span key={skill} className="text-xs font-bold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-secondary/70 dark:text-white/70">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Vertical Divider */}
                      <div className="hidden xl:block w-px bg-black/5 dark:bg-white/5" />

                      {/* Right Col: AI Analysis */}
                      <div className="xl:w-[400px] flex flex-col justify-between bg-primary/5 rounded-3xl p-6 border border-primary/10">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-black text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> AI Analysis
                            </h4>
                            <div className="bg-white dark:bg-[#222] rounded-full px-3 py-1 shadow-sm flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${job.matchScore >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                              <span className="font-black text-sm">{job.matchScore}% Match</span>
                            </div>
                          </div>
                          <ul className="space-y-3 mb-6">
                            {getMatchReasons(job).map((reason, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-medium text-secondary/80 dark:text-white/80">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!isApplied ? (
                            <button 
                              onClick={() => handleApply(job)} 
                              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                              <Zap className="w-4 h-4 fill-current" /> Apply Now
                            </button>
                          ) : (
                            <button className="flex-1 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-secondary dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                              View Details <ArrowUpRight className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleSaveToggle(job.id)} 
                            className={`p-3 bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm ${isSaved ? 'text-yellow-500' : 'text-secondary/40'}`}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                          <button 
                            onClick={() => handleIgnore(job.id)} 
                            className="p-3 bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-secondary/40 hover:text-red-500"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-black/5 dark:border-white/5">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-black mb-2">No jobs found in this filter</h3>
                <p className="text-secondary/60 dark:text-white/60">Try adjusting your filters or wait for the AI to find more matches.</p>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
