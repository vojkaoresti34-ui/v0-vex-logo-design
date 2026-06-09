"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
} from "lucide-react";

interface Experience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

interface ParsedContent {
  headline?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  biggestWin?: string;
  experience?: Experience[];
}

interface Resume {
  id: string;
  title: string;
  fileUrl?: string;
  fileKey?: string;
  parsedContent?: ParsedContent;
  rawText?: string;
  template: string;
  isDefault: boolean;
  atsScore?: number;
}

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [saving, setSaving] = useState(false);

  // Rewrite Highlight Selection state
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<{ expIdx: number; bulletIdx: number } | null>(null);
  const [rewriting, setRewriting] = useState(false);

  // New Resume Creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState("modern");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = (await res.json()) || [];
      setResumes(data);

      const def = data.find((r: any) => r.isDefault);
      if (def) {
        selectResume(def);
      } else if (data.length > 0) {
        selectResume(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectResume = (resume: Resume) => {
    setActiveResume(resume);
    setTitle(resume.title);
    
    // Parse JSON details
    const content = resume.parsedContent || {};
    setSummary(content.summary || "Add a professional summary...");
    setSkillsText((content.skills || []).join(", "));
    setExperiences(content.experience || []);
    setSelectedBulletIndex(null);
  };

  const handleSaveChanges = async () => {
    if (!activeResume) return;

    try {
      setSaving(true);
      
      const parsedSkills = skillsText.split(",").map(s => s.trim()).filter(Boolean);
      const updatedContent: ParsedContent = {
        summary,
        skills: parsedSkills,
        experience: experiences
      };

      const res = await fetch(`/api/resumes/${activeResume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          parsedContent: updatedContent
        })
      });

      if (!res.ok) throw new Error("Failed to save changes");
      
      const updated = await res.json();
      
      // Update list
      setResumes(prev => prev.map(r => r.id === updated.id ? updated : r));
      setActiveResume(updated);
      
      alert("Resume successfully saved in Neon PostgreSQL!");
    } catch (err) {
      console.error(err);
      alert("Error saving resume changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleRewriteHighlight = async () => {
    if (!activeResume || !selectedBulletIndex) return;

    const { expIdx, bulletIdx } = selectedBulletIndex;
    const bulletToRewrite = experiences[expIdx]?.bullets[bulletIdx];
    if (!bulletToRewrite) return;

    try {
      setRewriting(true);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Rewrite this resume bullet point to make it highly professional, metric-driven, and optimized for ATS systems: "${bulletToRewrite}". Keep it as a single bullet point sentence, and do not output any markdown formatting or introductory text. Output only the rewritten bullet point.`
        })
      });

      if (!res.ok) throw new Error("AI rewrite query failed");
      const data = await res.json();
      
      const rewrittenText = data.response ?? "";

      // Update experiences state
      const updatedExp = [...experiences];
      updatedExp[expIdx].bullets[bulletIdx] = rewrittenText.trim();
      setExperiences(updatedExp);
      setSelectedBulletIndex(null);
    } catch (err) {
      console.error(err);
      alert("AI rewrite failed. Please try again.");
    } finally {
      setRewriting(false);
    }
  };

  const handleCreateResume = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      setCreating(true);

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          template: newTemplate,
          parsedContent: {
            summary: "",
            skills: [],
            experience: []
          }
        })
      });

      if (!res.ok) throw new Error("Failed to create resume");
      
      await fetchResumes();
      setNewTitle("");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create resume.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this resume?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete resume");
      await fetchResumes();
    } catch (err) {
      console.error(err);
      alert("Error deleting resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">AI Resume Builder</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">Hyper-optimized for ATS systems and human readability.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Resume
          </button>
          {activeResume && (
            <button 
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-5 py-2.5 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Changes
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-secondary/40">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-bold">Synchronizing resume records from Neon cloud...</p>
        </div>
      ) : error ? (
        <div className="text-center p-20 text-rose-500 font-bold">
          <p>Failed to load resumes: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Editor Workspace */}
          <div className="xl:col-span-3 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[800px]">
            
            {/* Workspace Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0">
              <div className="flex gap-2">
                <select
                  value={activeResume?.id || ""}
                  onChange={(e) => {
                    const r = resumes.find(res => res.id === e.target.value);
                    if (r) selectResume(r);
                  }}
                  className="bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title} {r.isDefault ? "(Default)" : ""}</option>
                  ))}
                </select>
                {activeResume && (
                  <button 
                    onClick={() => handleDeleteResume(activeResume.id)}
                    className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider"
                  >
                    Delete Resume
                  </button>
                )}
              </div>
            </div>

            {/* Document Content */}
            {activeResume ? (
              <div className="flex-1 overflow-y-auto p-8 bg-[#F3F4F6] dark:bg-[#0A0A0A] custom-scrollbar flex justify-center">
                
                {/* The Resume Paper */}
                <div className="bg-white dark:bg-[#111111] w-full max-w-[800px] min-h-[800px] shadow-2xl p-12 ring-1 ring-black/5 dark:ring-white/10 text-black dark:text-white relative group">
                  
                  {/* Title Header Edit */}
                  <div className="border-b-2 border-black dark:border-white pb-6 mb-6">
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-3xl font-black uppercase tracking-tight mb-2 bg-transparent w-full border-b border-transparent focus:border-primary outline-none"
                      placeholder="Resume Title"
                    />
                    <h2 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">My Live Sandbox</h2>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="text-base font-black uppercase tracking-widest mb-3 text-primary">Professional Summary</h3>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-transparent border border-dashed border-transparent hover:border-black/10 focus:border-primary rounded p-2 text-sm font-medium leading-relaxed resize-none outline-none h-24"
                    />
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="text-base font-black uppercase tracking-widest mb-3 text-primary">Core Competencies</h3>
                    <input 
                      type="text"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      className="w-full bg-transparent border border-dashed border-transparent hover:border-black/10 focus:border-primary rounded p-2 text-sm font-medium outline-none"
                      placeholder="e.g. React, TypeScript, Go"
                    />
                  </div>

                  {/* Experience List */}
                  <div className="mb-6">
                    <h3 className="text-base font-black uppercase tracking-widest mb-4 text-primary">Work Experience</h3>
                    
                    {experiences.map((exp, expIdx) => (
                      <div key={expIdx} className="mb-6">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="font-bold text-sm">{exp.role} <span className="font-normal text-gray-500">at {exp.company}</span></h4>
                          <span className="text-xs font-bold text-gray-500">{exp.duration}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-xs text-gray-800 dark:text-gray-300">
                          {exp.bullets.map((bullet, bulletIdx) => {
                            const isSelected = selectedBulletIndex?.expIdx === expIdx && selectedBulletIndex?.bulletIdx === bulletIdx;

                            return (
                              <li 
                                key={bulletIdx} 
                                onClick={() => setSelectedBulletIndex({ expIdx, bulletIdx })}
                                className={`cursor-pointer hover:bg-primary/5 rounded p-1 transition-colors ${isSelected ? 'bg-yellow-100 dark:bg-yellow-900/30 font-bold border-l-2 border-yellow-500' : ''}`}
                              >
                                {bullet}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-secondary/40">
                <FileText className="w-16 h-16 opacity-30 mb-4" />
                <h3 className="text-xl font-black mb-2">No Resume Profile</h3>
                <p className="text-sm font-medium">Create a new sandbox resume to write dynamic bullet points!</p>
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          <div className="space-y-6 shrink-0">
            {activeResume && (
              <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">AI Optimization <Sparkles className="w-4 h-4 text-primary" /></h3>
                  <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center font-black text-green-500">
                    {activeResume.atsScore || 90}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl mb-6">
                  <div className="flex gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                    <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-300">ATS Refinement</h4>
                  </div>
                  <p className="text-xs text-yellow-700/80 dark:text-yellow-400/80">
                    {selectedBulletIndex ? (
                      "You have selected a bullet point! Click 'Auto-Rewrite Highlighted' below to let Gemini Pro optimize it live with business metrics."
                    ) : (
                      "Click on any bullet point in your resume experience above to highlight it for instant AI metric optimizations."
                    )}
                  </p>
                </div>

                {selectedBulletIndex && (
                  <button 
                    onClick={handleRewriteHighlight}
                    disabled={rewriting}
                    className="w-full py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {rewriting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Auto-Rewrite Highlighted
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* New Resume Modal */}
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
                <Plus className="w-6 h-6 text-primary" /> Create New Resume
              </h2>

              <form onSubmit={handleCreateResume} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Resume Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Dev (Stripe)" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Template Theme</label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="modern">Modern Professional</option>
                    <option value="minimal">Minimal Pro</option>
                    <option value="creative">Creative Designer</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={creating}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Initialize Sandbox
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
