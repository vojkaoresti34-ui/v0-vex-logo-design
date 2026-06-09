"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#E8E0D5] dark:bg-[#121212] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-[900] text-secondary dark:text-white mb-3">Something went wrong</h1>
        <p className="text-secondary/60 dark:text-white/60 font-medium mb-8">
          An unexpected error occurred. Try refreshing the page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-secondary dark:bg-white text-white dark:text-secondary px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    </div>
  );
}
