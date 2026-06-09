"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Search, 
  Clock, 
  Star,
  Trophy,
  Filter,
  MonitorPlay,
  TrendingUp,
  Award,
  Crosshair,
  Loader2,
  Plus,
  Compass,
  ArrowRight
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  modules: number;
  locked: boolean;
  skills: string[];
  color?: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  progress: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

export default function LearningHubPage() {
  // Course States
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({}); // mapped by courseId

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState("all");

  // UX Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollingId, setIsEnrollingId] = useState<string | null>(null);
  const [isUpdatingProgressId, setIsUpdatingProgressId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Harmonious modern HSL gradient palettes
  const colorGradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-fuchsia-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-rose-500 to-red-500",
    "from-violet-500 to-indigo-500"
  ];

  const getGradient = (index: number) => colorGradients[index % colorGradients.length];

  const fetchHubData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch user course enrollments
      const enrollRes = await fetch("/api/learning/enrollments");
      let activeEnrollments: Record<string, Enrollment> = {};
      if (enrollRes.ok) {
        const enrollData: Enrollment[] = await enrollRes.ok ? await enrollRes.json() : [];
        enrollData.forEach(e => {
          activeEnrollments[e.courseId] = e;
        });
        setEnrollments(activeEnrollments);
      }

      // 2. Fetch personalized gap recommendations
      const recsRes = await fetch("/api/learning/recommendations");
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData);
      }

      // 3. Fetch general course catalog
      let catalogUrl = `/api/learning/courses?limit=30`;
      if (searchQuery) catalogUrl += `&search=${encodeURIComponent(searchQuery)}`;
      if (categoryFilter !== "all") catalogUrl += `&category=${encodeURIComponent(categoryFilter)}`;

      const catalogRes = await fetch(catalogUrl);
      if (catalogRes.ok) {
        const catalogData = await catalogRes.json();
        setCourses(catalogData.courses);
        setTotalCourses(catalogData.total);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load course materials from Neon DB.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [searchQuery, categoryFilter]);

  // Trigger Live Course Enrollment
  const handleEnroll = async (courseId: string) => {
    setIsEnrollingId(courseId);
    setError(null);
    try {
      const res = await fetch("/api/learning/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });

      if (!res.ok) throw new Error("Enrollment failed");
      const enrollment: Enrollment = await res.json();
      
      // Update enrollments record
      setEnrollments(prev => ({
        ...prev,
        [courseId]: {
          ...enrollment,
          progress: 0
        }
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to register enrollment.");
    } finally {
      setIsEnrollingId(null);
    }
  };

  // Update Enrollment Progress dynamically (adds +25% or sets to 100%)
  const handleUpdateProgress = async (courseId: string, currentProgress: number, setCompleted = false) => {
    setIsUpdatingProgressId(courseId);
    setError(null);

    const nextProgress = setCompleted ? 100 : Math.min(currentProgress + 25, 100);

    try {
      const res = await fetch("/api/learning/enroll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, progress: nextProgress })
      });

      if (!res.ok) throw new Error("Failed to update progress");
      const updatedEnrollment: Enrollment = await res.json();

      setEnrollments(prev => ({
        ...prev,
        [courseId]: updatedEnrollment
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize learning progress.");
    } finally {
      setIsUpdatingProgressId(null);
    }
  };

  // Filter local courses representation
  const displayedCourses = courses.filter(course => {
    const enrollment = enrollments[course.id];
    const progress = enrollment ? enrollment.progress : 0;
    
    if (activeTab === "in-progress") return progress > 0 && progress < 100;
    if (activeTab === "completed") return progress === 100;
    return true; // "all"
  });

  // Pick top recommended course banner
  const featuredCourse = recommendations.length > 0 ? recommendations[0] : courses[0];
  const featuredEnrollment = featuredCourse ? enrollments[featuredCourse.id] : null;
  const featuredProgress = featuredEnrollment ? featuredEnrollment.progress : 0;

  // Compute live statistics based on real enrollment updates
  const totalCompleted = Object.values(enrollments).filter(e => e.progress === 100).length;
  const totalHrsWatched = Object.values(enrollments).reduce((sum, e) => {
    const rawHrs = parseFloat(e.course?.duration || "3.5");
    return sum + (rawHrs * (e.progress / 100));
  }, 0);

  const completedEnrollments = Object.values(enrollments).filter(e => e.progress === 100);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary animate-pulse">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-foreground tracking-tight">Skill Learner Hub</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg">Acquire dynamic credentials to eliminate matching gaps in your resume.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search databases..." 
              className="w-full bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Feed */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Featured / Resume Gap Course Banner */}
          {featuredCourse && (
            <div className="bg-gradient-to-r from-secondary dark:from-[#111111] to-[#222222] dark:to-black rounded-[2rem] p-8 md:p-12 text-white border border-border/50 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl group-hover:bg-primary/25 transition-colors pointer-events-none" />
              
              <div className="relative z-10 max-w-xl">
                <div className="bg-primary/25 border border-primary/30 text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-primary animate-ping" /> Matcher Recommendation for your Gaps
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{featuredCourse.title}</h2>
                <p className="text-white/70 font-semibold mb-8 text-sm md:text-md leading-relaxed">
                  Your Vex AI analyzer identified structural vacancies matching this catalog. Enroll to instantly close ATS parser constraints and hit Staff requirements.
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  {featuredEnrollment ? (
                    <>
                      <button 
                        onClick={() => handleUpdateProgress(featuredCourse.id, featuredProgress)}
                        disabled={isUpdatingProgressId === featuredCourse.id || featuredProgress === 100}
                        className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isUpdatingProgressId === featuredCourse.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                        {featuredProgress === 100 ? 'Completed' : 'Increment Progress (+25%)'}
                      </button>
                      
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 px-4 py-3.5 rounded-xl backdrop-blur-md">
                        <Clock className="w-4 h-4 text-white/70" /> Progress: {featuredProgress}%
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(featuredCourse.id)}
                      disabled={isEnrollingId === featuredCourse.id}
                      className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      {isEnrollingId === featuredCourse.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Enroll in Recommended
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filters & Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  { id: 'all', label: 'All Catalog' },
                  { id: 'in-progress', label: 'Enrolled' },
                  { id: 'completed', label: 'Credentials Earned' }
                ].map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setActiveTab(f.id as any)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === f.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'bg-white dark:bg-[#1A1A1A] border border-border/50 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white dark:bg-[#1A1A1A] border border-border/50 text-xs font-bold rounded-xl py-2 px-4 focus:outline-none"
              >
                <option value="all">All Topics</option>
                <option value="Engineering">Engineering</option>
                <option value="Interview Prep">Interview Prep</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Career Growth">Career Growth</option>
              </select>
            </div>

            {displayedCourses.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-border/50 shadow-sm p-16 text-center space-y-4">
                <Compass className="w-12 h-12 text-muted-foreground/35 mx-auto" />
                <h3 className="text-md font-black text-foreground">No matching courses discovered</h3>
                <p className="text-xs font-semibold text-muted-foreground max-w-[360px] mx-auto">
                  Try adjusting your search filters or browse other enrollment categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {displayedCourses.map((course, idx) => {
                    const enrollment = enrollments[course.id];
                    const progress = enrollment ? enrollment.progress : 0;
                    const isEnrolled = !!enrollment;

                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={course.id} 
                        className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group flex flex-col relative"
                      >
                        {/* Course Header Gradient */}
                        <div className={`h-28 bg-gradient-to-br ${getGradient(idx)} relative p-6 flex flex-col justify-between`}>
                          <div className="flex justify-between items-start">
                            <span className="bg-black/25 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                              {course.category}
                            </span>
                            {course.locked && (
                              <div className="bg-black/50 backdrop-blur-md text-white w-7 h-7 rounded-xl flex items-center justify-center">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Course Details */}
                        <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                          <div>
                            <h3 className="font-black text-lg text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              By {course.instructor} • {course.level}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-t border-border/30 pt-3">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                              <span className="flex items-center gap-1"><MonitorPlay className="w-3.5 h-3.5" /> {course.modules} modules</span>
                              <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3.5 h-3.5 fill-current" /> {course.rating}</span>
                            </div>

                            {/* Progress bar and controls */}
                            {isEnrolled ? (
                              <div className="bg-black/5 dark:bg-white/[0.02] p-4 rounded-2xl border border-border/30 space-y-3">
                                <div>
                                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                    <span>{progress === 100 ? 'Completed' : 'Current Progress'}</span>
                                    <span className={progress === 100 ? 'text-green-500' : 'text-primary'}>{progress}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                                
                                {progress < 100 && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <button 
                                      onClick={() => handleUpdateProgress(course.id, progress)}
                                      disabled={isUpdatingProgressId === course.id}
                                      className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                      +25% Progress
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateProgress(course.id, progress, true)}
                                      disabled={isUpdatingProgressId === course.id}
                                      className="bg-primary text-primary-foreground py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                                    >
                                      Complete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                disabled={isEnrollingId === course.id}
                                className="w-full bg-black/5 dark:bg-white/5 border border-border/50 text-foreground py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                              >
                                {isEnrollingId === course.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                                Enroll & Start Learning
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Stats & Certificates */}
        <div className="space-y-6">
          
          {/* Stats Widget */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Learning Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/[0.02] dark:bg-white/5 rounded-2xl p-4 text-center border border-border/30">
                <span className="block text-2xl font-black text-foreground">{totalHrsWatched.toFixed(1)}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Hrs Watched</span>
              </div>
              <div className="bg-black/[0.02] dark:bg-white/5 rounded-2xl p-4 text-center border border-border/30">
                <span className="block text-2xl font-black text-foreground">{totalCompleted}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Completed</span>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-green-700 dark:text-green-300">Continuous Mastery</h4>
                  <p className="text-[10px] font-semibold text-green-600/80 dark:text-green-400/80 mt-1 leading-relaxed">
                    Closing active resume gaps boosts application conversion scores up to 45% in current matches!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials / Certificates Widget */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Credentials Earned
            </h3>
            
            {completedEnrollments.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-border/50 rounded-2xl text-center bg-black/[0.01]">
                <p className="text-[10px] font-bold text-muted-foreground">No completed courses yet.</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">Increment progress to 100% to earn verified certificates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedEnrollments.map((e) => (
                  <div 
                    key={e.id}
                    className="flex gap-4 items-center p-3 bg-black/[0.01] border border-border/30 rounded-2xl"
                  >
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground truncate">{e.course?.title || "Mastered Course"}</h4>
                      <p className="text-[9px] text-muted-foreground/60 font-semibold mt-0.5">
                        Completed {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : new Date(e.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
