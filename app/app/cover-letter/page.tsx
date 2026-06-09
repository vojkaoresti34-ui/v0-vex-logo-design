"use client";

import { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import {
  Mail,
  Sparkles,
  Copy,
  Wand2,
  RefreshCcw,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface Resume {
  id: string;
  title: string;
  isDefault: boolean;
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/cover-letters/generate",
  });
  
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = await res.json();
      setResumes(data || []);
      
      const def = data?.find((r: any) => r.isDefault);
      if (def) {
        setSelectedResumeId(def.id);
      } else if (data?.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleGenerate = async (e?: { preventDefault(): void }) => {
    if (e) e.preventDefault();
    if (!jobTitle || !company) return;

    try {
      await complete(customPrompt || "Generate cover letter", {
        body: {
          jobTitle,
          company,
          jobDescription: jobDescription || undefined,
          tone,
          resumeId: selectedResumeId || undefined,
          customPrompt: customPrompt || undefined
        }
      });
    } catch (err) {
      console.error(err);
      alert("Error generating cover letter. Please verify your Gemini API key.");
    }
  };

  const handleCopy = () => {
    if (!completion) return;
    navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Mail className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">Cover Letter Generator</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">Hyper-personalized letters based on your resume and the job description.</p>
        </div>
        <div className="flex gap-3">
          {completion && (
            <button 
              onClick={handleCopy}
              className="px-5 py-2.5 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Text"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Editor Workspace */}
        <div className="xl:col-span-3 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[800px]">
          
          {/* Target Job Info Bar */}
          <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center font-black text-primary shadow-sm">
                CL
              </div>
              <div>
                <h4 className="font-bold text-sm text-secondary dark:text-white leading-tight">{jobTitle || "Job Title"}</h4>
                <p className="text-xs font-bold text-secondary/60 dark:text-white/60 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {company || "Company Name"}
                </p>
              </div>
            </div>
            {completion && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />} Regenerate
                </button>
              </div>
            )}
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#F9F9F9] dark:bg-[#111] flex justify-center items-start">
            {isLoading && !completion ? (
              <div className="flex flex-col items-center justify-center h-full my-auto text-secondary/40">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                <p className="text-sm font-bold">Resilient AI engine generating cover letter context...</p>
              </div>
            ) : completion ? (
              /* The Letter Paper */
              <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-[700px] shadow-xl p-12 ring-1 ring-black/5 dark:ring-white/10 text-black dark:text-white font-serif leading-relaxed relative min-h-[500px]">
                <div className="whitespace-pre-wrap text-sm font-serif leading-relaxed text-secondary dark:text-white/90">
                  {completion}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 my-auto text-secondary/40">
                <Mail className="w-16 h-16 opacity-35 mx-auto mb-4" />
                <h3 className="text-xl font-black mb-2">No Letter Generated Yet</h3>
                <p className="text-sm font-medium max-w-sm mx-auto">Fill in the targets in the sidebar and choose a default resume to trigger cover letter creation.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Sidebar Controls */}
        <div className="space-y-6 shrink-0">
          <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">Letter Controls <Sparkles className="w-4 h-4 text-primary" /></h3>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Select Resume context */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Source Resume Context</label>
                {loadingResumes ? (
                  <div className="text-xs text-secondary/40 flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Loading resumes...</div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                  >
                    <option value="">None (Profile context only)</option>
                    {resumes.map(res => (
                      <option key={res.id} value={res.id}>{res.title} {res.isDefault ? "(Default)" : ""}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Target Job Title *</label>
                <input 
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Dev"
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Target Company *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for a more tailored letter..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-3 block">Tone & Style</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'professional', title: 'Professional formal', desc: 'Formal, metric-driven language.' },
                    { id: 'startup', title: 'Startup Hustle', desc: 'Bold, direct, passionate, and scaling.' },
                    { id: 'creative', title: 'Creative Story', desc: 'Story-driven and unique.' }
                  ].map(t => (
                    <button 
                      type="button"
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${tone === t.id ? 'border-primary bg-primary/5' : 'border-black/5 dark:border-white/5 hover:border-primary/40'}`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-secondary dark:text-white">{t.title}</h4>
                        <p className="text-[10px] text-secondary/50 dark:text-white/50">{t.desc}</p>
                      </div>
                      {tone === t.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Custom Prompt Instructions</label>
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-none"
                  placeholder="e.g. Highlight React expertise, strip generic text..."
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !jobTitle || !company}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-4 h-4" />} Generate Letter
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
