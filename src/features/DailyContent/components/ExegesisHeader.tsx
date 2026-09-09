import { ArrowLeft } from "lucide-react";
import type { ExegesisHeaderProps } from "../types";

export function ExegesisHeader({ onBack, title, subtitle }: ExegesisHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="text-center">
          <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
            {title}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className="w-8" />
      </div>
    </header>
  );
}
