"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles, Zap, MessageSquareHeart, HelpCircle, User, ArrowRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/liquid-glass";
import { ThemeToggle } from "@/components/theme-toggle";
import Dock from "@/components/ui/dock";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features", icon: Zap },
  { href: "#how-it-works", label: "How It Works", icon: Sparkles },
  { href: "#testimonials", label: "Testimonials", icon: MessageSquareHeart },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-4 right-4 md:left-8 md:right-8 z-50 mx-auto max-w-[1200px] pointer-events-none flex items-center justify-between"
    >
      {/* Left: Logo Pill */}
      <motion.div 
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-auto bg-background/70 backdrop-blur-2xl border border-border/50 shadow-lg rounded-3xl px-4 py-3 flex items-center"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black italic transform -rotate-6 group-hover:rotate-0 transition-transform shadow-sm">V</div>
          <span className="text-2xl font-black tracking-tighter uppercase italic pr-2">Vex</span>
        </Link>
      </motion.div>

      {/* Center: Dock */}
      <div className="pointer-events-auto hidden md:flex absolute left-1/2 -translate-x-1/2">
        <Dock 
          items={navLinks.map(link => ({
            icon: link.icon,
            label: link.label,
            onClick: () => { window.location.href = link.href }
          }))}
        />
      </div>

      {/* Right: Actions Pill */}
      <motion.div 
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="pointer-events-auto bg-background/70 backdrop-blur-2xl border border-border/50 shadow-lg rounded-3xl px-4 py-3 hidden md:flex items-center gap-2"
      >
        <ThemeToggle />
        <Button variant="ghost" asChild className="rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all font-bold uppercase tracking-widest text-xs h-10">
          <Link href="/login">
            <User size={14} className="mr-2" /> Log in
          </Link>
        </Button>
        <Button asChild className="rounded-2xl shadow-lg shadow-primary/20 transition-all font-black uppercase tracking-widest text-xs h-10 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/onboarding">
            Get Started <ArrowRight size={14} className="ml-2" />
          </Link>
        </Button>
      </motion.div>

      {/* Mobile Actions Pill (Top Right) - Theme Toggle only */}
      <motion.div 
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="pointer-events-auto bg-background/70 backdrop-blur-2xl border border-border/50 shadow-lg rounded-3xl px-4 py-3 md:hidden flex items-center"
      >
        <ThemeToggle />
      </motion.div>

    </motion.nav>

    {/* Mobile Navigation Menu Dropdown (opens upwards from bottom) */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed bottom-24 left-4 right-4 z-40 bg-background/95 backdrop-blur-3xl border border-border/50 shadow-2xl rounded-[2rem] overflow-hidden origin-bottom"
        >
          <div className="p-6 flex flex-col gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors text-xl font-black uppercase"
                >
                  <span className="p-3 rounded-2xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon size={20} />
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Mobile Bottom Dock */}
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* 1. Home */}
        <Link href="/" onClick={() => setIsOpen(false)} className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-background border border-border/30 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform">
          <Home size={22} className="text-foreground" fill="currentColor" strokeWidth={1.5} />
        </Link>
        
        {/* 2. Features */}
        <Link href="#features" onClick={() => setIsOpen(false)} className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-background border border-border/30 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
          <Zap size={22} strokeWidth={1.5} />
        </Link>
        
        {/* 3. Get Started (Elongated) */}
        <Link href="/onboarding" onClick={() => setIsOpen(false)} className="flex-shrink-0 h-12 sm:h-14 px-6 sm:px-8 bg-background border border-border/30 rounded-full flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform">
          <Sparkles size={20} className="text-foreground" strokeWidth={1.5} />
          <span className="font-medium text-sm sm:text-base text-foreground tracking-wide">Get Started</span>
        </Link>
        
        {/* 4. Log in */}
        <Link href="/login" onClick={() => setIsOpen(false)} className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-background border border-border/30 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
          <User size={22} strokeWidth={1.5} />
        </Link>

        {/* 5. Menu */}
        <button onClick={() => setIsOpen(!isOpen)} className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-background border border-border/30 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
          {isOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
    </>
  );
}
