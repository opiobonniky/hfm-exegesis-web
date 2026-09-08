// StudyToolsHeader — header for the study tools admin page
"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudyToolsHeaderProps {
  onBack: () => void;
  onAddResource?: () => void;
}

export function StudyToolsHeader({ onBack, onAddResource }: StudyToolsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Study Tools Manager</h1>
          <p className="text-sm text-muted-foreground">
            Manage Strong&apos;s words, verse resources, studies, and prologues
          </p>
        </div>
      </div>
      {onAddResource && <Button size="sm" onClick={onAddResource} className="gap-1"><Plus className="h-4 w-4" />Add resource</Button>}
    </div>
  );
}
