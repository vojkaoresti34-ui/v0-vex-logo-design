const fs = require('fs');
const path = require('path');

const baseDir = path.join('c:', 'Users', 'user', 'Desktop', 'v0-vex-logo-design', 'app', 'app');
const adminBaseDir = path.join('c:', 'Users', 'user', 'Desktop', 'v0-vex-logo-design', 'app', 'admin');

const pages = [
  {
    path: path.join(baseDir, 'resume-builder'),
    title: 'AI Resume Builder',
    description: 'Build ATS-optimized resumes instantly with AI.',
    icon: 'FileText'
  },
  {
    path: path.join(baseDir, 'ats-analyzer'),
    title: 'ATS Score Analyzer',
    description: 'Scan your resume against job descriptions to find skill gaps.',
    icon: 'Crosshair'
  },
  {
    path: path.join(baseDir, 'cover-letter'),
    title: 'Cover Letter Generator',
    description: 'Generate hyper-personalized cover letters in seconds.',
    icon: 'Mail'
  },
  {
    path: path.join(baseDir, 'jobs', 'matches'),
    title: 'Job Match Dashboard',
    description: 'AI-curated job opportunities matching your exact profile.',
    icon: 'Briefcase'
  },
  {
    path: path.join(baseDir, 'jobs', 'tracker'),
    title: 'Job Tracker',
    description: 'Manage your applications, interviews, and offers in one place.',
    icon: 'KanbanSquare'
  },
  {
    path: path.join(baseDir, 'career-roadmap'),
    title: 'Career Roadmap & Coach',
    description: 'Plan your long-term career trajectory with AI guidance.',
    icon: 'Map'
  },
  {
    path: path.join(baseDir, 'portfolio'),
    title: 'Portfolio Builder',
    description: 'Showcase your projects and automatically sync with GitHub.',
    icon: 'Globe'
  },
  {
    path: path.join(baseDir, 'messages'),
    title: 'Recruiter Messages',
    description: 'Directly communicate with hiring managers and platform recruiters.',
    icon: 'MessageSquare'
  },
  {
    path: path.join(baseDir, 'notifications'),
    title: 'Notification Center',
    description: 'Alerts for ATS scans, interview reminders, and job matches.',
    icon: 'Bell'
  },
  {
    path: path.join(baseDir, 'settings', 'billing'),
    title: 'Billing & Subscription',
    description: 'Manage your AI credits, plan upgrades, and invoices.',
    icon: 'CreditCard'
  },
  {
    path: path.join(baseDir, 'settings', 'integrations'),
    title: 'Integrations',
    description: 'Connect LinkedIn, GitHub, and ATS platforms.',
    icon: 'Link'
  },
  {
    path: path.join(adminBaseDir, 'analytics'),
    title: 'Platform Analytics',
    description: 'Global metrics on MRR, churn, and feature usage.',
    icon: 'BarChart'
  },
  {
    path: path.join(adminBaseDir, 'ai-ops'),
    title: 'AI Automation Center',
    description: 'Monitor LLM costs, prompt performance, and fallback logic.',
    icon: 'Cpu'
  }
];

const template = (title, description, icon) => `"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ${icon}, AlertCircle, CheckCircle2, Lock, Loader2, Sparkles } from "lucide-react";

export default function Page() {
  const [state, setState] = useState("empty"); // empty, loading, success, premium

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <${icon} className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-[900] text-secondary dark:text-white tracking-tight">${title}</h1>
          </div>
          <p className="text-secondary/60 dark:text-white/60 font-medium">${description}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setState("loading")} className="px-4 py-2 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            Test Loading
          </button>
          <button onClick={() => setState("premium")} className="px-4 py-2 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl text-sm font-bold shadow-sm hover:bg-secondary/90 transition-colors flex items-center gap-2">
            <Lock className="w-4 h-4" /> Test Premium
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workspace / Editor / Primary View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-sm min-h-[500px] relative overflow-hidden flex flex-col">
            
            {/* Header controls inside workspace */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Workspace <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              <div className="flex gap-2">
                <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3" />
                </div>
              </div>
            </div>

            {/* State Management Views */}
            {state === "empty" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 border border-dashed border-gray-300 dark:border-white/20">
                  <${icon} className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">No content yet</h4>
                <p className="text-sm text-secondary/60 dark:text-white/60 max-w-sm mx-auto mb-6">Upload a document or hit generate to let our AI do the heavy lifting.</p>
                <button onClick={() => setState("loading")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity">
                  Start Generating
                </button>
              </div>
            )}

            {state === "loading" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h4 className="text-xl font-bold mb-2">AI is working...</h4>
                <p className="text-sm text-secondary/60 dark:text-white/60">Analyzing parameters and generating highly optimized content.</p>
              </div>
            )}

            {state === "premium" && (
              <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/50 dark:bg-black/50 flex flex-col items-center justify-center text-center p-6">
                <div className="bg-white dark:bg-[#222] p-8 rounded-3xl shadow-2xl max-w-md border border-black/10 dark:border-white/10">
                  <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Premium Feature</h3>
                  <p className="text-sm text-secondary/70 dark:text-white/60 mb-6">Upgrade to Vex Pro to unlock advanced AI orchestration, custom templates, and automated workflows.</p>
                  <button className="w-full bg-secondary dark:bg-white text-white dark:text-secondary py-3 rounded-xl font-bold">
                    View Upgrade Plans
                  </button>
                </div>
              </div>
            )}

            {state === "success" && (
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-green-800 dark:text-green-300">Successfully Generated</h5>
                    <p className="text-sm text-green-700/80 dark:text-green-400/80">Your content has been fully optimized and is ready for review.</p>
                  </div>
                </div>
                {/* Mock Content Blocks */}
                <div className="h-8 bg-gray-100 dark:bg-white/5 rounded-lg w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-lg w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-lg w-4/6 animate-pulse" />
              </div>
            )}
            
          </div>
        </div>

        {/* Sidebar / Settings / AI Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">AI Settings <Sparkles className="w-4 h-4 text-primary" /></h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Generation Tone</label>
                <select className="w-full bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none">
                  <option>Professional</option>
                  <option>Enthusiastic</option>
                  <option>Direct & Concise</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/50 dark:text-white/50 mb-2 block">Custom Prompt</label>
                <textarea 
                  className="w-full bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
                  placeholder="Tell the AI what specifically to focus on..."
                />
              </div>

              <button 
                onClick={() => setState("success")}
                className="w-full py-3 bg-secondary dark:bg-white text-white dark:text-secondary rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Generate Content
              </button>
            </div>
          </div>

          {/* Usage Stats Widget */}
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm">AI Credits</h4>
              <span className="text-xs font-bold px-2 py-1 bg-primary/20 text-primary rounded-full">Pro</span>
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-black">84</span>
              <span className="text-sm font-medium text-secondary/60 dark:text-white/60 mb-1">/ 100</span>
            </div>
            <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[84%]" />
            </div>
            <p className="text-xs text-secondary/60 dark:text-white/60 mt-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Resets in 12 days
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
`;

pages.forEach(page => {
  if (!fs.existsSync(page.path)) {
    fs.mkdirSync(page.path, { recursive: true });
  }
  
  const filePath = path.join(page.path, 'page.tsx');
  fs.writeFileSync(filePath, template(page.title, page.description, page.icon));
  console.log('Generated ' + filePath);
});

console.log("All routes scaffolded successfully.");
