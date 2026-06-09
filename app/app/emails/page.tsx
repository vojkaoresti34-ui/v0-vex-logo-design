"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Copy, RefreshCw, FileSignature, Linkedin, Sparkles, Bot, Save, Trash2, History, Loader2, Check, ExternalLink } from "lucide-react";

type Tab = 'follow-up' | 'resignation' | 'linkedin';

interface Campaign {
  id: string;
  subject: string;
  body: string;
  recipient: string;
  company: string | null;
  status: 'draft' | 'sent';
  sentAt?: string | null;
  createdAt: string;
}

export default function EmailHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('follow-up');

  // Input states
  const [recipient, setRecipient] = useState("");
  const [company, setCompany] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [context, setContext] = useState("");

  // Editor states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<'draft' | 'sent' | null>(null);

  // Application states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const tabs = [
    { id: 'follow-up', label: 'Follow-Up', icon: Mail },
    { id: 'resignation', label: 'Resignation', icon: FileSignature },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  ];

  // Fetch campaigns on load
  const fetchCampaigns = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Set default context values based on tabs
  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setRecipient("");
    setCompany("");
    setRecipientName("");
    setContext("");
    setError(null);
  };

  // Generate dynamic cold outreach or thank you from AI
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);
    setSendSuccess(false);

    let type = "cold_outreach";
    if (activeTab === "follow-up") type = "thank_you";
    if (activeTab === "resignation") type = "resignation";
    if (activeTab === "linkedin") type = "linkedin";

    try {
      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          company,
          role: activeTab === "follow-up" ? "Senior Frontend Engineer" : activeTab === "resignation" ? "Software Engineer" : "Referral / Partnership",
          context,
          type
        })
      });

      if (!res.ok) throw new Error("Failed to generate template");
      const data = await res.json();
      
      setSubject(data.subject);
      setBody(data.body);
      setSelectedId(null);
      setStatus("draft");
    } catch (err: any) {
      console.error(err);
      setError("AI generation failed. Please check your credentials or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current subject/body as draft campaign
  const handleSaveDraft = async () => {
    if (!subject || !body) return;
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const targetRecipient = recipient || recipientName || "recruiter@company.com";
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          recipient: targetRecipient,
          company: company || "Vex AI Client"
        })
      });

      if (!res.ok) throw new Error("Failed to save draft");
      const data = await res.json();
      
      setSelectedId(data.id);
      setStatus(data.status);
      setSaveSuccess(true);
      fetchCampaigns();

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to save campaign draft.");
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatches email campaign live via Resend
  const handleSendEmail = async () => {
    setError(null);
    setSendSuccess(false);
    setIsSending(true);

    try {
      let campaignId = selectedId;

      // Save first if not already saved in DB
      if (!campaignId) {
        const targetRecipient = recipient || recipientName || "recruiter@company.com";
        const saveRes = await fetch("/api/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            body,
            recipient: targetRecipient,
            company: company || "Vex AI Client"
          })
        });

        if (!saveRes.ok) throw new Error("Failed to save prior to sending");
        const savedData = await saveRes.json();
        campaignId = savedData.id;
        setSelectedId(campaignId);
      }

      // Trigger Resend send
      const sendRes = await fetch(`/api/emails/${campaignId}/send`, {
        method: "POST"
      });

      if (!sendRes.ok) {
        const errData = await sendRes.json();
        throw new Error(errData.error || "Failed to dispatch email");
      }

      const updatedData = await sendRes.json();
      setStatus(updatedData.status);
      setSendSuccess(true);
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Resend client dispatch failed. Ensure RESEND_API_KEY is configured.");
    } finally {
      setIsSending(false);
    }
  };

  // Load selected historical campaign to editor
  const handleLoadCampaign = (camp: Campaign) => {
    setSelectedId(camp.id);
    setSubject(camp.subject);
    setBody(camp.body);
    setStatus(camp.status);
    setRecipient(camp.recipient);
    setCompany(camp.company || "");
    setRecipientName("");
    setContext("");
    setError(null);
    setSaveSuccess(false);
    setSendSuccess(false);
  };

  // Reset page to fresh layout
  const handleNewOutreach = () => {
    setSelectedId(null);
    setSubject("");
    setBody("");
    setStatus(null);
    setRecipient("");
    setCompany("");
    setRecipientName("");
    setContext("");
    setError(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary animate-pulse" /> Email Hub
          </h1>
          <p className="text-muted-foreground font-medium">Generate, save, and dispatch professional communication live.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl flex items-center gap-1 self-start">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as Tab)}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors z-10 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Panel: Inputs & History */}
        <div className="w-full lg:w-[45%] flex flex-col h-full bg-white dark:bg-[#111111] rounded-[2rem] border border-border/50 shadow-xl shadow-black/[0.02] overflow-y-auto custom-scrollbar p-8 relative gap-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground mb-1">
                {activeTab === 'follow-up' && "Post-Interview Follow Up"}
                {activeTab === 'resignation' && "Resignation Letter"}
                {activeTab === 'linkedin' && "LinkedIn Outreach"}
              </h3>
              {selectedId && (
                <button
                  onClick={handleNewOutreach}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> New Outreach
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Recipient Email</label>
                <input 
                  type="email" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="recruiter@company.com" 
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                />
              </div>

              {activeTab === 'follow-up' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Company Name</label>
                    <input 
                      type="text" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Stripe" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Interviewer Name(s)</label>
                    <input 
                      type="text" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Sarah and Mike" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Key topic discussed</label>
                    <textarea 
                      rows={3} 
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. The upcoming migration to Next.js and how my experience aligns..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" 
                    />
                  </div>
                </>
              )}

              {activeTab === 'resignation' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Company Name</label>
                    <input 
                      type="text" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Stripe" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Current Manager</label>
                    <input 
                      type="text" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. David Smith" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Last Day of Work & Reason</label>
                    <textarea 
                      rows={3} 
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. Friday, November 10th. Reason: pursuing standard career growth..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" 
                    />
                  </div>
                </>
              )}

              {activeTab === 'linkedin' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Target Person & Company</label>
                    <input 
                      type="text" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Jane Doe at Google" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block">Connection Goal</label>
                    <textarea 
                      rows={3} 
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. Ask for a referral or quick chat about their engineering culture..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl py-3 px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" 
                    />
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-bounce" /> Generate Draft
                </>
              )}
            </button>
          </div>

          <hr className="border-border/50 z-10" />

          {/* Campaign Outreach History */}
          <div className="relative z-10 flex-1 flex flex-col min-h-[220px]">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-primary" /> Outreach History
            </h3>
            
            {isLoadingHistory ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-2xl text-center bg-black/5 dark:bg-white/[0.02]">
                <p className="text-xs font-bold text-muted-foreground">No outreach campaigns created yet.</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Generated custom templates will display here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    onClick={() => handleLoadCampaign(camp)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between gap-3 ${selectedId === camp.id ? 'border-primary bg-primary/5' : 'border-border/50 bg-black/[0.02] dark:bg-white/[0.01]'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${camp.status === 'sent' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {camp.status}
                        </span>
                        {camp.company && (
                          <span className="text-xs font-black text-foreground truncate max-w-[120px]">
                            {camp.company}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-muted-foreground truncate">{camp.subject}</h4>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(camp.createdAt).toLocaleDateString()} • {camp.recipient}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Output Document & CRM Controls */}
        <div className="w-full lg:w-[55%] flex flex-col h-full bg-white dark:bg-[#111111] rounded-[2rem] border border-border/50 shadow-xl shadow-black/[0.02] overflow-hidden relative group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between bg-black/5 dark:bg-white/[0.02] relative z-10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-md font-black tracking-tight text-foreground flex items-center gap-2">
                  AI Draft Campaign 
                  {status && (
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${status === 'sent' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {status}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-muted-foreground font-semibold">Customize and trigger outreach</p>
              </div>
            </div>
            
            {subject && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-white dark:bg-white/10 border border-border/50 text-foreground px-3.5 py-2 rounded-full font-bold text-xs hover:border-primary/50 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
                <button 
                  onClick={handleSaveDraft}
                  disabled={isSaving || status === 'sent'}
                  className="flex items-center gap-1.5 bg-white dark:bg-white/10 border border-border/50 text-foreground px-3.5 py-2 rounded-full font-bold text-xs hover:border-primary/50 transition-colors shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Draft
                </button>
                <button 
                  onClick={handleSendEmail}
                  disabled={isSending || status === 'sent'}
                  className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-secondary/90 transition-colors shadow-md disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : sendSuccess ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {status === 'sent' ? 'Sent Outbound' : 'Send Outbound'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar flex flex-col">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold">
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Draft campaign saved successfully to Neon Database!
              </div>
            )}

            {sendSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Email dispatched successfully using Resend cloud client!
              </div>
            )}

            {subject ? (
              <div className="flex-1 flex flex-col gap-6">
                <div className="w-full">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent border-b border-border/50 focus:border-primary/50 text-md font-bold text-foreground focus:outline-none pb-2 transition-all"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full flex-1 bg-transparent border-0 text-sm font-medium text-foreground leading-relaxed focus:outline-none focus:ring-0 resize-none"
                    placeholder="Write or edit the body..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {isGenerating ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-sm font-bold text-muted-foreground">Engaging Vex Gemini AI Engine...</p>
                    <p className="text-xs text-muted-foreground/60">Compiling personalized career outreach details...</p>
                  </div>
                ) : (
                  <div className="max-w-[400px] space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-foreground">Write Custom Outreach Instantly</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Select an outreach type on the left, enter details, and hit <strong className="text-primary">Generate Draft</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground/60 bg-black/5 dark:bg-white/5 py-2 px-4 rounded-xl inline-block border border-border/30">
                      Integrates live with Neon Postgres & Resend
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
