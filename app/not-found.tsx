"use client";

import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E8E0D5] dark:bg-[#121212] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-[900] text-secondary dark:text-white leading-none tracking-tighter mb-4">404</div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Map className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black text-secondary dark:text-white">Page not found</h2>
        </div>
        <p className="text-secondary/60 dark:text-white/60 font-medium mb-8">
          This page doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-secondary dark:bg-white text-white dark:text-secondary px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Go home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
