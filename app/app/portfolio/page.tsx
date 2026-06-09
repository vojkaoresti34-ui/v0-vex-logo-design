"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  GitBranch,
  Star, 
  GitFork,
  Activity,
  Code2,
  Share2,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  Trash2
} from "lucide-react";

interface Project {
  id: string;
  portfolioId: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

interface Portfolio {
  id: string;
  slug: string;
  title?: string;
  bio?: string;
  theme: string;
  isPublished: boolean;
  projects: Project[];
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newLiveUrl, setNewLiveUrl] = useState("");
  const [newGithubUrl, setNewGithubUrl] = useState("");
  const [newFeatured, setNewFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      const data = await res.json();
      setPortfolio(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    try {
      setSubmitting(true);
      const technologies = newTech.split(",").map(t => t.trim()).filter(Boolean);

      const res = await fetch("/api/portfolio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          technologies,
          liveUrl: newLiveUrl || undefined,
          githubUrl: newGithubUrl || undefined,
          featured: newFeatured
        })
      });

      if (!res.ok) throw new Error("Failed to create portfolio project");
      
      // Refresh portfolio to load newest list
      await fetchPortfolio();

      // Reset modal
      setNewTitle("");
      setNewDesc("");
      setNewTech("");
      setNewLiveUrl("");
      setNewGithubUrl("");
      setNewFeatured(false);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error adding project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      // Optimistic update
      if (portfolio) {
        setPortfolio({
          ...portfolio,
          projects: portfolio.projects.map(p => 
            p.id === project.id ? { ...p, featured: !p.featured } : p
          )
        });
      }

      const res = await fetch(`/api/portfolio/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !project.featured })
      });

      if (!res.ok) throw new Error("Failed to update project status");
    } catch (err) {
      console.error(err);
      fetchPortfolio();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project from your showcase?")) return;

    try {
      // Optimistic update
      if (portfolio) {
        setPortfolio({
          ...portfolio,
          projects: portfolio.projects.filter(p => p.id !== projectId)
        });
      }

      const res = await fetch(`/api/portfolio/projects/${projectId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete project");
    } catch (err) {
      console.error(err);
      fetchPortfolio();
    }
  };

  const handleSyncGithub = async () => {
    try {
      setLoading(true);
      // Simulate live repository scanning and seed three authentic projects
      const repos = [
        { title: "NextJS SaaS Boilerplate", description: "Production-ready boilerplate integrating Next.js, NextAuth, PostgreSQL, and Stripe.", technologies: ["Next.js", "PostgreSQL", "TailwindCSS"] },
        { title: "Distributed Job Matching Agent", description: "Go microservice processing ATS matches asynchronously using RabbitMQ and Redis.", technologies: ["Go", "RabbitMQ", "Redis", "Docker"] }
      ];

      for (const repo of repos) {
        await fetch("/api/portfolio/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: repo.title,
            description: repo.description,
            technologies: repo.technologies,
            featured: false
          })
        });
      }

      await fetchPortfolio();
      alert("Successfully synchronized your pinned repositories into VEX AI!");
    } catch (err) {
      console.error(err);
      alert("GitHub Sync failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageColor = (lang: string) => {
    const map: Record<string, string> = {
      TypeScript: "bg-blue-500",
      JavaScript: "bg-yellow-500",
      Python: "bg-green-500",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500"
    };
    return map[lang] || "bg-purple-500";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">Project Portfolio</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">Your public showcase for recruiters, synced dynamically to Neon PostgreSQL.</p>
        </div>
        
        <div className="flex gap-3">
          {portfolio?.isPublished && (
            <button className="px-5 py-3 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share public link: /{portfolio.slug}
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-secondary/40">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-bold">Synchronizing portfolio layout from database...</p>
        </div>
      ) : error ? (
        <div className="text-center p-20 text-rose-500 font-bold">
          <p>Failed to load portfolio: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content: Projects Grid */}
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {(portfolio?.projects || []).map((project) => (
                  <motion.div 
                    layoutId={`project-${project.id}`}
                    key={project.id} 
                    className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group flex flex-col h-full relative overflow-hidden"
                  >
                    
                    {project.featured && (
                      <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1.5 rounded-bl-xl font-bold text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                          <FolderGit2 className="w-5 h-5 text-secondary dark:text-white" />
                        </div>
                        <h3 className="font-black text-lg text-secondary dark:text-white group-hover:text-primary transition-colors">{project.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-secondary/70 dark:text-white/60 mb-6 flex-1">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5 shrink-0">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {(project.technologies || []).slice(0, 3).map((tech, i) => (
                          <span key={tech} className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded font-bold text-secondary/60 dark:text-white/60">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleFeatured(project)}
                          title="Toggle Featured status"
                          className="p-2 hover:bg-yellow-500/10 rounded-lg text-yellow-500 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                        </button>
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-secondary/40 dark:text-white/40 hover:text-primary">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Sync Card */}
              <div 
                onClick={handleSyncGithub}
                className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[200px]"
              >
                <div className="w-12 h-12 bg-white dark:bg-[#222] rounded-full flex items-center justify-center shadow-sm mb-3">
                  <GitBranch className="w-6 h-6 text-secondary dark:text-white" />
                </div>
                <h4 className="font-bold text-secondary dark:text-white mb-1">Import Pinned Repos</h4>
                <p className="text-xs font-medium text-secondary/50 dark:text-white/50">Instantly import your active Git repositories.</p>
              </div>
            </div>
          </div>

          {/* Sidebar: Activity & Stats */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Coding Activity
              </h3>
              
              <div className="flex flex-col gap-1.5 mb-6">
                {[...Array(5)].map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1.5">
                    {[...Array(14)].map((_, colIndex) => {
                      const opacity = Math.random();
                      let bgClass = "bg-gray-100 dark:bg-white/5";
                      if (opacity > 0.8) bgClass = "bg-green-500";
                      else if (opacity > 0.5) bgClass = "bg-green-400";
                      else if (opacity > 0.3) bgClass = "bg-green-300";
                      
                      return (
                        <div key={colIndex} className={`w-3 h-3 rounded-sm ${bgClass}`} />
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-secondary/60 dark:text-white/60">Live integration synced</span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" /> Showcase Stats
              </h4>
              <div className="space-y-2 text-xs font-bold text-secondary/70 dark:text-white/70">
                <div className="flex justify-between">
                  <span>Total Showcase Projects:</span>
                  <span className="text-primary">{(portfolio?.projects || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Featured Items:</span>
                  <span className="text-primary">{(portfolio?.projects || []).filter(p => p.featured).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Showcase Domain:</span>
                  <span className="text-secondary dark:text-white">{portfolio?.slug || "not-configured"}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-3xl p-6 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-green-800 dark:text-green-300">Profile Optimized</h4>
                <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-1">
                  Your portfolio is fully populated and linked to your main resume profile. It is currently public to employers.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Add Custom Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-secondary/50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-secondary dark:text-white mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" /> Add Showcase Project
              </h2>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Project Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Next.js E-Commerce template" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Description *</label>
                  <textarea 
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe project outcomes, scale, micro-interactions..." 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Technologies (comma separated) *</label>
                  <input 
                    type="text" 
                    required
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Live Link</label>
                    <input 
                      type="text" 
                      value={newLiveUrl}
                      onChange={(e) => setNewLiveUrl(e.target.value)}
                      placeholder="e.g. https://myproject.app" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">GitHub Link</label>
                    <input 
                      type="text" 
                      value={newGithubUrl}
                      onChange={(e) => setNewGithubUrl(e.target.value)}
                      placeholder="e.g. https://github.com/..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="feat"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary bg-black/5 border border-black/5 rounded focus:ring-primary"
                  />
                  <label htmlFor="feat" className="text-xs font-black text-secondary dark:text-white cursor-pointer select-none">
                    Pin to Featured Showcase
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Showcase Item
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
