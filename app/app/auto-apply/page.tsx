"use client";

import { useState, useEffect } from "react";
import { 
  Settings2, 
  Play, 
  Pause, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  Bot,
  Loader2,
  X,
  Plus,
  HelpCircle,
  TrendingUp,
  Sliders,
  DollarSign,
  MapPin,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  appliedAt: string | null;
  status: string;
  isAutoApplied: boolean;
  salary?: number | null;
  job?: {
    id: string;
    title: string;
    company: string;
    logoUrl?: string | null;
  } | null;
}

interface AutoApplyConfig {
  id: string;
  isEnabled: boolean;
  maxApplications: number;
  jobTypes: string[] | string;
  locations: string[] | string;
  salaryMin: number;
  keywords: string[] | string;
  blacklistCompanies: string[] | string;
  dailyLimit: number;
  appliedCount: number;
}

export default function AutoApplyPage() {
  // Config & State
  const [config, setConfig] = useState<AutoApplyConfig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [runResult, setRunResult] = useState<{ applied: number; message?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states for settings modal
  const [formKeywords, setFormKeywords] = useState("");
  const [formLocations, setFormLocations] = useState("");
  const [formSalary, setFormSalary] = useState(0);
  const [formLimit, setFormLimit] = useState(0);
  const [formBlacklist, setFormBlacklist] = useState("");
  const [formJobTypes, setFormJobTypes] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchSettingsAndApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch settings
      const settingsRes = await fetch("/api/auto-apply/settings");
      if (!settingsRes.ok) throw new Error("Failed to load settings");
      const settingsData: AutoApplyConfig = await settingsRes.json();
      setConfig(settingsData);

      // Parse fields safely for form initialization
      const parseArray = (val: any): string => {
        if (!val) return "";
        if (Array.isArray(val)) return val.join(", ");
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
        } catch {
          return String(val);
        }
      };

      setFormKeywords(parseArray(settingsData.keywords));
      setFormLocations(parseArray(settingsData.locations));
      setFormBlacklist(parseArray(settingsData.blacklistCompanies));
      setFormJobTypes(parseArray(settingsData.jobTypes));
      setFormSalary(settingsData.salaryMin ?? 0);
      setFormLimit(settingsData.dailyLimit ?? 0);

      // 2. Fetch application logs
      const url = statusFilter !== "ALL" 
        ? `/api/applications?status=${statusFilter}&limit=10` 
        : "/api/applications?limit=20";
      const appsRes = await fetch(url);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications);
        setTotalApplications(appsData.total);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to synchronize agent state with Neon DB.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndApplications();
  }, [statusFilter]);

  // Toggle dynamic Enabled / Paused status
  const handleToggleAgent = async () => {
    if (!config) return;
    setError(null);
    const newEnabled = !config.isEnabled;
    try {
      const res = await fetch("/api/auto-apply/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: newEnabled })
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updatedConfig = await res.json();
      setConfig(updatedConfig);
      setSuccessMessage(`Agent status updated to: ${newEnabled ? 'ACTIVE' : 'PAUSED'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to toggle agent active status.");
    }
  };

  // Trigger search matching run synchronously
  const handleRunAgent = async () => {
    if (!config) return;
    setIsRunningAgent(true);
    setRunResult(null);
    setError(null);

    try {
      // 1. Force state to active first if paused
      if (!config.isEnabled) {
        const toggleRes = await fetch("/api/auto-apply/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isEnabled: true })
        });
        if (toggleRes.ok) {
          const updated = await toggleRes.json();
          setConfig(updated);
        }
      }

      // 2. Trigger synchronous run
      const res = await fetch("/api/auto-apply/run?background=false", {
        method: "POST"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Execution failed");
      }

      const result = await res.json();
      setRunResult({
        applied: result.applied ?? 0,
        message: result.message || `Successfully matched and applied to ${result.applied} vacancies!`
      });

      // Synchronize latest history
      fetchSettingsAndApplications();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to execute auto-apply matching process.");
    } finally {
      setIsRunningAgent(false);
    }
  };

  // Submit search configuration updates
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setError(null);

    const splitAndClean = (str: string): string[] => {
      return str.split(",").map(s => s.trim()).filter(Boolean);
    };

    try {
      const res = await fetch("/api/auto-apply/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: splitAndClean(formKeywords),
          locations: splitAndClean(formLocations),
          salaryMin: Number(formSalary),
          dailyLimit: Number(formLimit),
          blacklistCompanies: splitAndClean(formBlacklist),
          jobTypes: splitAndClean(formJobTypes)
        })
      });

      if (!res.ok) throw new Error("Failed to save settings");
      const updated = await res.json();
      setConfig(updated);
      setIsConfigOpen(false);
      setSuccessMessage("Application criteria successfully saved to Neon DB!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchSettingsAndApplications();
    } catch (err) {
      console.error(err);
      setError("Failed to update application preferences.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Search local applications query
  const filteredApps = applications.filter(app => {
    const compMatch = app.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return compMatch || roleMatch;
  });

  const getStatusBadgeStyles = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "APPLIED" || normalized === "SUBMITTED") {
      return { bg: "bg-blue-500/10 border border-blue-500/20", text: "text-blue-500", icon: CheckCircle2 };
    }
    if (normalized === "INTERVIEWING" || normalized === "SCHEDULED") {
      return { bg: "bg-purple-500/10 border border-purple-500/20", text: "text-purple-500", icon: Clock };
    }
    if (normalized === "REJECTED") {
      return { bg: "bg-red-500/10 border border-red-500/20", text: "text-red-500", icon: XCircle };
    }
    return { bg: "bg-amber-500/10 border border-amber-500/20", text: "text-amber-500", icon: Clock };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-2 flex items-center gap-3">
            <Bot className={`w-10 h-10 text-primary ${config?.isEnabled ? 'animate-bounce' : ''}`} /> Auto Apply Agent
          </h1>
          <p className="text-muted-foreground font-medium">Your fully autonomous AI recruiter agent matching and submitting vacancies live.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-border/50 text-foreground px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:border-primary/50 transition-colors"
          >
            <Settings2 className="w-4 h-4 text-muted-foreground" /> Configure Criteria
          </button>
          
          <button 
            onClick={handleToggleAgent}
            disabled={isLoading || !config}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 ${config?.isEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary text-primary-foreground hover:scale-105 shadow-primary/20'}`}
          >
            {config?.isEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {config?.isEnabled ? 'Pause Agent' : 'Activate Agent'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMessage}
        </div>
      )}

      {/* Synchronous Run Result Notification */}
      {runResult && (
        <div className={`p-6 border rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${runResult.applied > 0 ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${runResult.applied > 0 ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
              {runResult.applied}
            </div>
            <div>
              <h3 className="font-black text-foreground">Agent Matching Run Complete</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">{runResult.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setRunResult(null)}
            className="text-xs font-bold underline hover:opacity-85"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Agent Status Card */}
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02] flex flex-col lg:flex-row lg:items-center justify-between relative overflow-hidden group gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${config?.isEnabled ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
              <Bot className={`w-8 h-8 ${isRunningAgent ? 'animate-spin' : ''}`} />
            </div>
            {config?.isEnabled && !isRunningAgent && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {isRunningAgent ? 'Agent is Matching Jobs...' : config?.isEnabled ? 'Agent is Active' : 'Agent is Paused'}
            </h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Keywords: <strong className="text-foreground">{formKeywords || "Any"}</strong> • 
              Locations: <strong className="text-foreground">{formLocations || "Any"}</strong> • 
              Min Salary: <strong className="text-foreground">${formSalary.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Live Radar/Run Block */}
        <div className="flex flex-wrap items-center gap-6 relative z-10 lg:self-center">
          <div className="flex items-center gap-8 text-center bg-black/5 dark:bg-white/[0.02] py-4 px-6 rounded-2xl border border-border/30">
            <div>
              <div className="text-3xl font-black text-foreground">{totalApplications}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Applied</div>
            </div>
            <div className="w-px h-10 bg-border/50" />
            <div>
              <div className="text-3xl font-black text-primary">
                {applications.filter(a => a.status.toUpperCase() === "INTERVIEWING").length}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Interviews</div>
            </div>
            <div className="w-px h-10 bg-border/50" />
            <div>
              <div className="text-3xl font-black text-green-500">
                {config?.appliedCount || 0}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Today's Batch</div>
            </div>
          </div>

          <button
            onClick={handleRunAgent}
            disabled={isRunningAgent}
            className="bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isRunningAgent ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning vacancies...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" /> Run Agent Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Radar Animation during Synchronous Run */}
      {isRunningAgent && (
        <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-border/50 shadow-xl p-12 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="relative w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center animate-pulse">
            <div className="absolute inset-4 rounded-full border border-primary/40 flex items-center justify-center">
              <div className="absolute inset-8 rounded-full border border-primary/60 flex items-center justify-center">
                <Bot className="w-12 h-12 text-primary animate-bounce" />
              </div>
            </div>
            <div className="absolute top-0 bottom-0 left-0 right-0 rounded-full border-2 border-primary/10 animate-ping" />
          </div>
          <div className="text-center space-y-2 z-10 max-w-[450px]">
            <h3 className="text-lg font-black text-foreground">Engaging Auto Apply Vacancy Matcher</h3>
            <p className="text-sm font-medium text-muted-foreground">
              Vex AI is actively querying job databases, scanning semantic matches, evaluating skill requirements from your career profile, and drafting dynamic cover letters.
            </p>
            <div className="text-xs text-primary font-bold flex items-center justify-center gap-2 pt-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Writing transactional tables to Neon PostgreSQL...
            </div>
          </div>
        </div>
      )}

      {/* Tracking Table */}
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-border/50 shadow-xl shadow-black/[0.02] overflow-hidden">
        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/5 dark:bg-white/[0.02]">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-md font-black uppercase tracking-widest text-foreground">Application Logs</h3>
            <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-0.5 border border-border/30">
              {["ALL", "APPLIED", "INTERVIEWING", "REJECTED"].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${statusFilter === status ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by company..." 
              className="w-full bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="text-md font-black text-foreground">No applications logged</h3>
              <p className="text-sm font-semibold text-muted-foreground max-w-[400px] mx-auto">
                No active records matched your current filters. Toggle settings or run the matcher agent above.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-black/[0.02] dark:bg-white/[0.01]">
                  <th className="p-6 font-bold">Vacancy Details</th>
                  <th className="p-6 font-bold">Date Logged</th>
                  <th className="p-6 font-bold">Source</th>
                  <th className="p-6 font-bold">Status</th>
                  <th className="p-6 font-bold text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredApps.map((app) => {
                  const { bg, text, icon: StatusIcon } = getStatusBadgeStyles(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-foreground text-md">{app.company}</div>
                        <div className="text-xs font-medium text-muted-foreground mt-0.5">{app.jobTitle}</div>
                      </td>
                      <td className="p-6">
                        <div className="text-xs font-bold text-foreground">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Pending'}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${app.isAutoApplied ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {app.isAutoApplied ? 'Autonomous' : 'Manual'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {app.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <span className="text-xs font-bold text-muted-foreground/60 italic">
                          ID: {app.id.slice(0, 8)}...
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Configure Search Preferences Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-[#111111] rounded-[2rem] border border-border shadow-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-black text-foreground">Configure Agent Parameters</h2>
                </div>
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                      Target Role Keywords
                    </label>
                    <input 
                      type="text" 
                      value={formKeywords}
                      onChange={(e) => setFormKeywords(e.target.value)}
                      placeholder="e.g. Frontend, React, Fullstack" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">Comma separated list of keywords.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                      Locations / Remote
                    </label>
                    <input 
                      type="text" 
                      value={formLocations}
                      onChange={(e) => setFormLocations(e.target.value)}
                      placeholder="e.g. Remote, San Francisco" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">Locations to scan or filter by.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-primary" /> Minimum Annual Salary
                    </label>
                    <input 
                      type="number" 
                      value={formSalary}
                      onChange={(e) => setFormSalary(Number(e.target.value))}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                      Daily Applications Limit
                    </label>
                    <input 
                      type="number" 
                      value={formLimit}
                      onChange={(e) => setFormLimit(Number(e.target.value))}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                    Job Types
                  </label>
                  <input 
                    type="text" 
                    value={formJobTypes}
                    onChange={(e) => setFormJobTypes(e.target.value)}
                    placeholder="e.g. Full-time, Contract, Remote" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                    Blacklist Companies
                  </label>
                  <input 
                    type="text" 
                    value={formBlacklist}
                    onChange={(e) => setFormBlacklist(e.target.value)}
                    placeholder="e.g. Meta, Oracle, Twitter" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                  />
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">Autonomous matcher will skip applications to these specific companies.</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                  <button 
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-6 py-3 rounded-xl border border-border text-foreground text-xs font-bold uppercase hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/10 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Settings...
                      </>
                    ) : (
                      <>
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
