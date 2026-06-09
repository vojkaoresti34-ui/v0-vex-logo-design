"use client";

import { Globe2 } from "lucide-react";

export default function ResumeTranslatorPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Globe2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">Resume Translator</h1>
        <p className="text-muted-foreground font-medium max-w-md mx-auto">This workspace is currently under construction. Check back soon for 1-click multi-language translation.</p>
      </div>
    </div>
  );
}
