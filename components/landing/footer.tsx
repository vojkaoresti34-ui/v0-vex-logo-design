"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="py-24 bg-secondary text-white border-t border-white/5 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute bottom-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 sm:gap-16 mb-16 sm:mb-20">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black italic transform -rotate-6 group-hover:rotate-0 transition-transform text-secondary text-xl">V</div>
              <span className="text-3xl font-black tracking-tighter uppercase italic">Vex</span>
            </Link>
            <p className="text-white/70 mb-10 max-w-xs leading-relaxed font-medium">
              AI-powered career acceleration. Land your dream job faster with skill analysis, personalized learning, and automated applications.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 hover:text-secondary hover:bg-primary transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Product</h4>
            <ul className="space-y-4">
              {[{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Testimonials", href: "#testimonials" }].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white/20 text-center md:text-left">
            &copy; {new Date().getFullYear()} Vex. All rights reserved.
          </p>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white/20 italic text-center md:text-right">
            Built for the future.
          </p>
        </div>
      </div>
    </footer>
  );
}
