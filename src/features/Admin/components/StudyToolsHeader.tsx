// StudyToolsHeader — header for the study tools admin page
"use client";

import { ArrowLeft } from "lucide-react";
import { tt } from '@/components/languages/hardcodedTranslate';

interface StudyToolsHeaderProps {
  onBack: () => void;
}

export function StudyToolsHeader({ onBack }: StudyToolsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label={tt('Back')}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{tt("Strong’s Word Studies")}</h1>
          <p className="text-sm text-muted-foreground">{tt("Add a word, explain its meaning, and link it to a Bible verse.")}</p>
        </div>
      </div>
    </div>
  );
}
