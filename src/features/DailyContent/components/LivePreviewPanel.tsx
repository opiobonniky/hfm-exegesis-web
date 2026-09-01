/**
 * LivePreviewPanel — right column in AddExplanation with preview + validation.
 */
import { ReactNode } from "react";

interface LivePreviewPanelProps {
  label: string;
  children: ReactNode;
}

export function LivePreviewPanel({ label, children }: LivePreviewPanelProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      {children}
    </div>
  );
}
