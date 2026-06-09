"use client";

import { motion } from "framer-motion";
import { Camera, UploadCloud, Sparkles, Image as ImageIcon, Download, Settings2 } from "lucide-react";
import { useState } from "react";

const styles = [
  { id: "corporate", name: "Corporate", desc: "Studio lighting, suit, solid background", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  { id: "creative", name: "Creative", desc: "Warm lighting, smart casual, office background", color: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
  { id: "tech", name: "Tech Startup", desc: "Natural lighting, t-shirt/hoodie, modern office", color: "bg-green-500/10 text-green-500 border-green-500/30" },
];

export default function HeadshotsPage() {
  const [selectedStyle, setSelectedStyle] = useState("corporate");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-[900] text-foreground tracking-tight mb-2 flex items-center gap-3">
            <Camera className="w-8 h-8 text-primary" /> AI Headshots
          </h1>
          <p className="text-muted-foreground font-medium">Turn casual selfies into professional LinkedIn headshots instantly.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Upload & Settings */}
        <div className="space-y-6">
          
          {/* Upload Box */}
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white mb-6">1. Upload Photos</h3>
            
            <div className="border-2 border-dashed border-primary/30 rounded-3xl p-10 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-center group-hover:border-primary/50 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/5">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1">Drag & drop your selfies</h4>
              <p className="text-sm font-medium text-muted-foreground max-w-[250px]">Upload 3-5 clear selfies with good lighting for the best results.</p>
              
              <button className="mt-6 bg-secondary dark:bg-white/10 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-secondary/90 transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          {/* Style Selector */}
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white">2. Choose Style</h3>
              <Settings2 className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="grid gap-4">
              {styles.map((style) => (
                <div 
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-4 ${selectedStyle === style.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${style.color}`}>
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-foreground">{style.name}</h4>
                    <p className="text-xs font-medium text-muted-foreground mt-1">{style.desc}</p>
                  </div>
                  
                  {/* Radio button indicator */}
                  <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 self-center ${selectedStyle === style.id ? 'border-primary' : 'border-muted'}`}>
                    {selectedStyle === style.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 bg-primary text-primary-foreground py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Generate 4 Headshots
            </button>
          </div>
        </div>

        {/* Right Column: Gallery */}
        <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 border border-border/50 shadow-xl shadow-black/[0.02] lg:h-full flex flex-col">
          <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white mb-6">Generated Results</h3>
          
          {/* Placeholder for results */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-border/50 rounded-3xl bg-black/5 dark:bg-white/5">
             <div className="w-20 h-20 rounded-full bg-muted/50 dark:bg-white/10 flex items-center justify-center mb-6">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
             </div>
             <h4 className="text-xl font-black text-foreground mb-2">No headshots yet</h4>
             <p className="text-sm font-medium text-muted-foreground max-w-[250px]">Upload your photos and click generate to see your professional AI headshots appear here.</p>
          </div>
          
          {/* Example of what it would look like if generated */}
          {/* 
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-muted rounded-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-white text-secondary flex items-center justify-center hover:scale-110 transition-transform">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          */}

        </div>

      </div>
    </div>
  );
}
