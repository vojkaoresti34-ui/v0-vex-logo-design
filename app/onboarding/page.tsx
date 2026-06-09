"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FileText,
  Compass,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Target,
  Link as LinkIcon,
  User,
  TrendingUp,
  Zap,
  Coffee,
  X,
  Plus,
  ShieldBan
} from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  
  // States
  const [goal, setGoal] = useState<string | null>(null);
  const [achievement, setAchievement] = useState("");
  const [tone, setTone] = useState<string | null>(null);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [exclusionInput, setExclusionInput] = useState("");

  // Additional background and target fields
  const [currentRole, setCurrentRole] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [startDate, setStartDate] = useState("");
  const [country, setCountry] = useState("");
  const [workAuth, setWorkAuth] = useState("");

  const [targetRole, setTargetRole] = useState("");
  const [environment, setEnvironment] = useState("remote");
  const [jobType, setJobType] = useState("fulltime");
  const [targetSalary, setTargetSalary] = useState("");
  const [industries, setIndustries] = useState("");

  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const saveAndGoToSignup = async () => {
    const data = {
      goal, currentRole, employmentStatus, yearsExperience, startDate,
      country, workAuth, targetRole, environment, jobType, targetSalary,
      industries, biggestWin: achievement, tone, blacklistCompanies: exclusions,
      skills, languages, linkedinUrl, githubUrl
    };

    if (window.location.search.includes("from_auth=true")) {
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Failed to save onboarding data", err);
          alert("We couldn't save your onboarding. Please make sure you picked a goal and try again.");
          return;
        }
        // Force a hard refresh so the session reloads with onboardingDone: true
        window.location.href = "/app";
      } catch (err) {
        console.error("Failed to save onboarding data", err);
        alert("Network error saving onboarding. Please try again.");
      }
    } else {
      localStorage.setItem("vex_onboarding", JSON.stringify(data));
      router.push("/signup?plan=ready");
    }
  };

  const addExclusion = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (exclusionInput.trim() && !exclusions.includes(exclusionInput.trim())) {
        setExclusions([...exclusions, exclusionInput.trim()]);
        setExclusionInput("");
      }
    }
  };

  const removeExclusion = (term: string) => {
    setExclusions(exclusions.filter(e => e !== term));
  };

  // Animation variants
  const slideVariants = {
    enter: { opacity: 0, y: 30, scale: 0.98 },
    center: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.98 }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[#E8E0D5] dark:bg-[#121212] p-4 selection:bg-primary/30">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-white/40 dark:bg-white/5 blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px]" 
        />
      </div>

      <Link href="/" className="absolute top-8 left-8 font-black text-2xl text-secondary dark:text-white uppercase tracking-tighter italic z-50">
        Vex
      </Link>

      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Progress Indicator */}
        {step <= totalSteps && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-secondary/50 dark:text-white/50 mb-3 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center text-secondary dark:text-white">
                  {step}
                </span>
                of {totalSteps}
              </span>
              <button 
                onClick={() => setStep(Math.max(1, step - 1))}
                className={`flex items-center gap-1 hover:text-secondary dark:hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </div>
            <div className="w-full h-1.5 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden flex">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-primary/80"
                initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Form Container */}
        <div className="bg-white/60 dark:bg-[#1A1A1A]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-2xl p-8 md:p-12 min-h-[500px] flex flex-col relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: The Goal */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit mb-6">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Objective</span>
                </div>
                <h1 className="text-4xl font-[900] text-secondary dark:text-white mb-3 tracking-tight">What's your primary goal?</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-8 text-lg">This completely changes how our AI writes your application narrative.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {[
                    { id: 'pivot', icon: Compass, title: 'Career Pivot', desc: 'Transitioning to a new industry or role.' },
                    { id: 'raise', icon: TrendingUp, title: 'Level Up / Raise', desc: 'Seeking a senior title and higher compensation.' },
                    { id: 'balance', icon: Coffee, title: 'Better Balance', desc: 'Looking for remote work or better culture.' },
                    { id: 'active', icon: Zap, title: 'Active Hunting', desc: 'Need a job ASAP. Volume applying.' },
                    { id: 'student', icon: GraduationCap, title: 'Student / New Grad', desc: 'Looking for internships or first role.' },
                    { id: 'unemployed', icon: User, title: 'Currently Unemployed', desc: 'Getting back into the workforce.' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => { setGoal(option.id); setTimeout(() => setStep(2), 400); }}
                      className={`text-left p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 group relative overflow-hidden ${goal === option.id ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/40 dark:border-white/10 hover:border-primary/40 hover:bg-white/40 dark:hover:bg-white/5 hover:-translate-y-1'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${goal === option.id ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-white/10 text-secondary dark:text-white group-hover:text-primary shadow-sm'}`}>
                        <option.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-secondary dark:text-white text-xl leading-tight mb-1">{option.title}</h3>
                        <p className="text-sm font-medium text-secondary/60 dark:text-white/50">{option.desc}</p>
                      </div>
                      {goal === option.id && (
                        <motion.div layoutId="glow" className="absolute inset-0 rounded-3xl ring-4 ring-primary/20 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: The Background */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full">
                <h1 className="text-3xl font-[900] text-secondary dark:text-white mb-2 tracking-tight">Your Background</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-6">Let's establish your professional baseline.</p>
                
                <div className="space-y-5 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Current Role / Title</label>
                      <input 
                        type="text" 
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="e.g. Software Engineer" 
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white placeholder:text-secondary/30 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-white/10 transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Employment Status</label>
                      <select 
                        value={employmentStatus}
                        onChange={(e) => setEmploymentStatus(e.target.value)}
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white focus:outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-black/50 dark:text-white/50">Select Status</option>
                        <option value="employed" className="text-black">Employed</option>
                        <option value="unemployed" className="text-black">Unemployed</option>
                        <option value="student" className="text-black">Student</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Experience</label>
                      <select 
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white focus:outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-black/50">Select</option>
                        <option value="1" className="text-black">0-2 years</option>
                        <option value="4" className="text-black">3-5 years</option>
                        <option value="7" className="text-black">6-9 years</option>
                        <option value="12" className="text-black">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Start Date</label>
                      <select 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white focus:outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-black/50">Select</option>
                        <option value="immediate" className="text-black">Immediately</option>
                        <option value="2weeks" className="text-black">2 Weeks Notice</option>
                        <option value="1month" className="text-black">1 Month+</option>
                        <option value="passive" className="text-black">Passive Browsing</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Country</label>
                      <input 
                        type="text" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. United States" 
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white placeholder:text-secondary/30 focus:outline-none focus:border-primary transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Work Auth</label>
                      <select 
                        value={workAuth}
                        onChange={(e) => setWorkAuth(e.target.value)}
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white focus:outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-black/50">Select</option>
                        <option value="citizen" className="text-black">Citizen / Resident</option>
                        <option value="visa" className="text-black">Need Sponsorship</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(3)} className="bg-secondary dark:bg-white text-white dark:text-secondary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: The Target */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full">
                <h1 className="text-3xl font-[900] text-secondary dark:text-white mb-2 tracking-tight">Your Next Move</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-6">What does the ideal opportunity look like?</p>
                
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Target Role</label>
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Developer" 
                      className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white placeholder:text-secondary/30 focus:outline-none focus:border-primary transition-all shadow-sm" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Environment</label>
                      <select 
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white focus:outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="remote" className="text-black">Remote</option>
                        <option value="hybrid" className="text-black">Hybrid</option>
                        <option value="onsite" className="text-black">On-site</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Job Type</label>
                      <select 
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white focus:outline-none focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="fulltime" className="text-black">Full-time</option>
                        <option value="contract" className="text-black">Contract</option>
                        <option value="internship" className="text-black">Internship</option>
                        <option value="parttime" className="text-black">Part-time</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 flex items-center gap-1">Target Salary</label>
                      <input 
                        type="text" 
                        value={targetSalary}
                        onChange={(e) => setTargetSalary(e.target.value)}
                        placeholder="$120k - $150k" 
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white placeholder:text-secondary/30 focus:outline-none focus:border-primary transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Target Industries</label>
                      <input 
                        type="text" 
                        value={industries}
                        onChange={(e) => setIndustries(e.target.value)}
                        placeholder="e.g. Fintech, AI, SaaS" 
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-secondary dark:text-white placeholder:text-secondary/30 focus:outline-none focus:border-primary transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(4)} className="bg-secondary dark:bg-white text-white dark:text-secondary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: The Big Win */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full text-center items-center justify-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-[900] text-secondary dark:text-white mb-3 tracking-tight">What is your biggest win?</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-8 text-lg max-w-md">This single field has the highest ROI. Real numbers get remembered. Let our AI highlight it.</p>
                
                <div className="w-full relative group">
                  <textarea 
                    value={achievement}
                    onChange={(e) => setAchievement(e.target.value)}
                    placeholder="e.g. 'Grew revenue by 40% in Q3' or 'Reduced server costs by $50k'" 
                    className="w-full bg-white dark:bg-white/5 border-2 border-white/60 dark:border-white/10 rounded-3xl py-6 px-8 text-xl font-bold text-secondary dark:text-white placeholder:text-secondary/30 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-lg min-h-[140px] resize-none text-center"
                  />
                  
                  {/* Dynamic suggestions */}
                  <AnimatePresence>
                    {achievement.length === 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-8 left-0 w-full flex justify-center gap-4">
                        <span className="text-xs font-bold text-secondary/40 dark:text-white/40 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Include percentages</span>
                        <span className="text-xs font-bold text-secondary/40 dark:text-white/40 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Mention dollar amounts</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-12 w-full">
                  <button 
                    onClick={() => setStep(5)} 
                    disabled={achievement.length < 10}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
                  >
                    Lock it in
                  </button>
                  <button onClick={() => setStep(5)} className="mt-4 text-sm font-bold text-secondary/50 dark:text-white/50 hover:text-secondary dark:hover:text-white transition-colors">
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Tone & Exclusions */}
            {step === 5 && (
              <motion.div key="step5" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full">
                <h1 className="text-3xl font-[900] text-secondary dark:text-white mb-2 tracking-tight">AI Tuning</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-6">How should we apply for you, and who should we avoid?</p>
                
                <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  
                  {/* Tone Selection */}
                  <div>
                    <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-3 block">Tone Preference</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'startup', title: 'Startup Hustle', desc: 'Bold, direct, passionate' },
                        { id: 'enterprise', title: 'Enterprise', desc: 'Formal, structured, metric-driven' },
                        { id: 'creative', title: 'Creative', desc: 'Story-driven, unique, engaging' }
                      ].map(t => (
                        <button 
                          key={t.id}
                          onClick={() => setTone(t.id)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${tone === t.id ? 'border-primary bg-primary/10' : 'border-white/40 dark:border-white/10 hover:border-primary/40'}`}
                        >
                          <h4 className="font-bold text-sm mb-1">{t.title}</h4>
                          <p className="text-[10px] leading-tight text-secondary/60 dark:text-white/50">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-3 flex items-center gap-2">
                      <ShieldBan className="w-4 h-4 text-red-500" /> Auto-Apply Exclusions
                    </label>
                    <p className="text-xs text-secondary/50 dark:text-white/50 ml-4 mb-3">Add current employers or competitors we should NEVER apply to.</p>
                    
                    <div className="bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl p-2 focus-within:border-primary transition-all shadow-sm">
                      <div className="flex flex-wrap gap-2 mb-2 p-2">
                        {exclusions.map(ex => (
                          <span key={ex} className="px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold flex items-center gap-2">
                            {ex}
                            <button onClick={() => removeExclusion(ex)} className="hover:text-red-800 dark:hover:text-red-200"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex px-2 pb-2">
                        <input 
                          type="text" 
                          value={exclusionInput}
                          onChange={e => setExclusionInput(e.target.value)}
                          onKeyDown={addExclusion}
                          placeholder="Type company and press Enter..." 
                          className="w-full bg-transparent text-sm font-bold placeholder:text-secondary/30 focus:outline-none"
                        />
                        <button onClick={addExclusion} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(6)} className="bg-secondary dark:bg-white text-white dark:text-secondary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Details */}
            {step === 6 && (
              <motion.div key="step6" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full">
                <h1 className="text-3xl font-[900] text-secondary dark:text-white mb-2 tracking-tight">The Details</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-6">Just a few more specifics to complete the profile.</p>
                
                <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Top 3-5 Skills</label>
                      <input 
                        type="text" 
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="React, Node, Sales..." 
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 block">Languages</label>
                      <input 
                        type="text" 
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        placeholder="English, Spanish..." 
                        className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold focus:outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> LinkedIn Profile</label>
                    <input 
                      type="url" 
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..." 
                      className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-secondary/60 dark:text-white/60 uppercase tracking-widest ml-4 mb-2 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> GitHub / Portfolio</label>
                    <input 
                      type="url" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..." 
                      className="w-full bg-white/80 dark:bg-white/5 border-2 border-white/40 dark:border-white/10 rounded-2xl py-4 px-5 text-base font-bold focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(7)} className="bg-secondary dark:bg-white text-white dark:text-secondary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    Almost Done <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Upload */}
            {step === 7 && (
              <motion.div key="step7" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col h-full items-center text-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-[900] text-secondary dark:text-white mb-2 tracking-tight">Final Step: Your CV</h1>
                <p className="text-secondary/70 dark:text-white/60 font-medium mb-8">Upload your current resume. We'll parse it and combine it with everything you just told us.</p>
                
                <div className="w-full flex-1 border-2 border-dashed border-primary/30 bg-primary/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors group p-8">
                  <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Drag & Drop Resume</h4>
                  <p className="text-sm text-secondary/50 dark:text-white/50">PDF or DOCX up to 10MB</p>
                </div>

                <div className="mt-8 w-full">
                  <button onClick={saveAndGoToSignup} className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                    {typeof window !== 'undefined' && window.location.search.includes("from_auth=true") ? "Complete Profile" : "Create Your Account"} <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
