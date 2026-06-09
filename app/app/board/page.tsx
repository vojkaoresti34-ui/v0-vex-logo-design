"use client";

import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Calendar, Briefcase, DollarSign } from "lucide-react";
import { useState } from "react";

const initialColumns = [
  {
    id: "to-apply",
    title: "To Apply",
    color: "bg-blue-500",
    cards: [
      { id: 1, company: "Google", role: "Senior Frontend Engineer", salary: "$160k - $200k", date: "Added Today" },
      { id: 2, company: "Netflix", role: "UI Architect", salary: "$180k - $220k", date: "Added Yesterday" },
    ]
  },
  {
    id: "applied",
    title: "Applied",
    color: "bg-purple-500",
    cards: [
      { id: 3, company: "Stripe", role: "Frontend Developer", salary: "$140k - $170k", date: "Applied 2 days ago" },
      { id: 4, company: "Vercel", role: "Software Engineer", salary: "$130k - $160k", date: "Applied 3 days ago" },
      { id: 5, company: "Spotify", role: "Web Developer", salary: "$120k - $150k", date: "Applied 1 week ago" },
    ]
  },
  {
    id: "interviewing",
    title: "Interviewing",
    color: "bg-yellow-500",
    cards: [
      { id: 6, company: "Meta", role: "React Developer", salary: "$150k - $190k", date: "Interview on Thursday" },
    ]
  },
  {
    id: "offer",
    title: "Offer",
    color: "bg-green-500",
    cards: [
      { id: 7, company: "StartupInc", role: "Lead Frontend", salary: "$170k + Equity", date: "Received Yesterday" },
    ]
  },
  {
    id: "rejected",
    title: "Rejected",
    color: "bg-red-500",
    cards: [
      { id: 8, company: "Amazon", role: "SDE II", salary: "$140k", date: "Rejected 2 weeks ago" },
    ]
  }
];

export default function ApplicationBoardPage() {
  const [columns] = useState(initialColumns);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-2">Application Board</h1>
          <p className="text-muted-foreground font-medium">Track your job hunting progress visually.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Opportunity
        </button>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <div className="flex h-full gap-6 px-1 min-w-max">
          {columns.map((col, idx) => (
            <motion.div 
              key={col.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="w-[320px] flex flex-col h-full bg-white/50 dark:bg-[#111111]/50 backdrop-blur-xl border border-border/50 rounded-[2rem] overflow-hidden shadow-xl shadow-black/[0.02]"
            >
              {/* Column Header */}
              <div className="p-5 border-b border-border/50 bg-white/80 dark:bg-black/20 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{col.title}</h3>
                  <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">{col.cards.length}</span>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {col.cards.map((card) => (
                  <div 
                    key={card.id}
                    className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center font-black text-secondary dark:text-white group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {card.company.charAt(0)}
                      </div>
                      <button className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h4 className="text-base font-black text-foreground leading-tight mb-1">{card.role}</h4>
                    <p className="text-sm font-bold text-muted-foreground mb-4">{card.company}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" /> {card.salary}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> {card.date}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State Drop Zone Indicator */}
                {col.cards.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center text-sm font-bold text-muted-foreground">
                    Drop here
                  </div>
                )}
              </div>
              
              {/* Add Button Footer */}
              <div className="p-4 bg-white/80 dark:bg-black/20 border-t border-border/50 mt-auto">
                <button className="w-full py-2.5 rounded-xl border border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Card
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
