"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  KanbanSquare, 
  MoreHorizontal, 
  Building2, 
  Clock, 
  DollarSign, 
  MessageSquare,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  Loader2,
  X
} from "lucide-react";

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED";
  salary?: string;
  appliedAt?: string;
  isAutoApplied: boolean;
  notes?: string;
}

const COLUMNS = [
  { id: "SAVED", title: "Saved", bg: "bg-blue-500/10 text-blue-500" },
  { id: "APPLIED", title: "Applied", bg: "bg-indigo-500/10 text-indigo-500" },
  { id: "INTERVIEWING", title: "Interviewing", bg: "bg-amber-500/10 text-amber-500" },
  { id: "OFFERED", title: "Offered", bg: "bg-emerald-500/10 text-emerald-500" },
  { id: "REJECTED", title: "Rejected", bg: "bg-rose-500/10 text-rose-500" }
];

export default function JobTrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Application Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newStatus, setNewStatus] = useState<Application["status"]>("SAVED");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Card Active Status Transition Dropdown State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/applications?limit=100");
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, targetStatus: Application["status"]) => {
    setActiveMenuId(null);
    try {
      // Optimistic update
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: targetStatus } : app));

      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus })
      });

      if (!res.ok) throw new Error("Failed to update status on server");
    } catch (err) {
      console.error(err);
      // Revert on failure
      fetchApplications();
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newJobTitle) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: newCompany,
          jobTitle: newJobTitle,
          salary: newSalary || undefined,
          status: newStatus,
          notes: newNotes || undefined
        })
      });

      if (!res.ok) throw new Error("Failed to create application");

      const created = await res.json();
      setApplications(prev => [created, ...prev]);

      // Reset form & close modal
      setNewCompany("");
      setNewJobTitle("");
      setNewSalary("");
      setNewStatus("SAVED");
      setNewNotes("");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error creating manual application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getLogoColor = (companyName: string) => {
    const hash = companyName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-red-600 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-blue-600 text-white",
      "bg-pink-500 text-white",
      "bg-amber-500 text-white"
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col pb-8 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <KanbanSquare className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">Application Board</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">Track your AI auto-applications and interview pipeline in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Manual Job
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-secondary/40">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-bold">Synchronizing with Neon cloud database...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-rose-500 text-center p-8">
          <p className="font-bold text-lg mb-2">Error loading board state</p>
          <p className="text-sm opacity-80 max-w-md">{error}</p>
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-6 pb-4">
          {COLUMNS.map((column) => {
            const columnApps = applications.filter(app => app.status === column.id);

            return (
              <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col h-full">
                
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                  <h3 className="font-black text-xs uppercase tracking-widest text-secondary dark:text-white flex items-center gap-2">
                    {column.title}
                    <span className="bg-black/5 dark:bg-white/10 text-secondary/60 dark:text-white/60 px-2 py-0.5 rounded-full text-xs">
                      {columnApps.length}
                    </span>
                  </h3>
                </div>

                {/* Column Content */}
                <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[2rem] p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar min-h-[400px]">
                  
                  <AnimatePresence mode="popLayout">
                    {columnApps.map((app) => (
                      <motion.div 
                        layoutId={`app-card-${app.id}`}
                        key={app.id}
                        className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group/card"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm ${getLogoColor(app.company)}`}>
                              {app.company.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-secondary dark:text-white text-sm leading-tight truncate max-w-[160px]">{app.jobTitle}</h4>
                              <p className="text-xs font-bold text-secondary/50 dark:text-white/50 flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
                                <Building2 className="w-3 h-3 shrink-0" /> {app.company}
                              </p>
                            </div>
                          </div>

                          {/* Quick Change Status Dropdown */}
                          <div className="relative shrink-0">
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === app.id ? null : app.id)}
                              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
                            >
                              <ArrowRightLeft className="w-4 h-4 text-secondary/40 dark:text-white/40 group-hover/card:text-primary" />
                            </button>

                            {activeMenuId === app.id && (
                              <div className="absolute right-0 top-6 bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 shadow-2xl rounded-xl p-2 z-50 w-44">
                                <p className="text-[10px] font-black uppercase text-secondary/40 tracking-wider p-2">Move To</p>
                                {COLUMNS.filter(col => col.id !== app.status).map(col => (
                                  <button
                                    key={col.id}
                                    onClick={() => handleStatusChange(app.id, col.id as any)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-primary/5 hover:text-primary transition-colors text-secondary dark:text-white"
                                  >
                                    {col.title}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-secondary/70 dark:text-white/70">
                            <DollarSign className="w-3.5 h-3.5 text-green-500 shrink-0" /> {app.salary || "Not Specified"}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-secondary/50 dark:text-white/50">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> 
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Just Added"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                          <div className="flex -space-x-2">
                            {app.isAutoApplied ? (
                              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1A1A1A] bg-primary/20 flex items-center justify-center">
                                <span className="text-[9px] font-black text-primary">AI</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1A1A1A] bg-secondary/10 flex items-center justify-center">
                                <span className="text-[9px] font-black text-secondary dark:text-white">Me</span>
                              </div>
                            )}
                          </div>
                          {app.notes && (
                            <div className="text-xs font-bold text-secondary/40 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> Notes
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnApps.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2rem] text-center text-secondary/30">
                      <Clock className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-xs font-bold">No applications here.</p>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Application Modal */}
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
                <Plus className="w-6 h-6 text-primary" /> Add Manual Application
              </h2>

              <form onSubmit={handleCreateApplication} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Company Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Stripe, Vercel" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Job Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Salary / Compensation</label>
                    <input 
                      type="text" 
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      placeholder="e.g. $140k - $180k" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Column Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    >
                      {COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Application Notes</label>
                  <textarea 
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Describe interviews, timeline, requirements..." 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                  />
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
                      <Plus className="w-4 h-4" /> Save Application
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
