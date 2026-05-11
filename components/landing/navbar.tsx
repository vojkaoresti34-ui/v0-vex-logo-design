"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles, Zap, MessageSquareHeart, HelpCircle, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/liquid-glass";

const navLinks = [
  { href: "#features", label: "Features", icon: Zap },
  { href: "#how-it-works", label: "How It Works", icon: Sparkles },
  { href: "#testimonials", label: "Testimonials", icon: MessageSquareHeart },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black italic transform -rotate-6 group-hover:rotate-0 transition-transform">V</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Vex</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                >
                  <Icon size={14} className="text-primary/50 group-hover:text-primary transition-colors" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <GlassButton href="#">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                <User size={14} className="text-muted-foreground group-hover:text-primary transition-colors" /> Log in
              </span>
            </GlassButton>
            <GlassButton href="#">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground p-2 hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-8 flex flex-col gap-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors text-xl font-black uppercase"
                    >
                      <span className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon size={20} />
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
                <div className="flex flex-col gap-4 pt-6 border-t border-border/50">
                  <GlassButton href="#" className="w-full flex justify-center group">
                    <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                      <User size={18} className="text-muted-foreground group-hover:text-primary transition-colors" /> Log in
                    </span>
                  </GlassButton>
                  <GlassButton href="#" className="w-full flex justify-center group">
                    <span className="flex items-center gap-2 font-black uppercase tracking-widest text-primary">
                      Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
