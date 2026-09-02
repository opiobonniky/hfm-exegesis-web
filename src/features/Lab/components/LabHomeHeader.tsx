import { BookOpen } from "lucide-react";
import TierBadge from "@/components/TierBadge";

export function LabHomeHeader() {
  return (
    <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none" style={{ fontFamily: "'Cinzel', serif" }}>Bible Study</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">Study the Word Deeply</p>
          </div>
        </div>
        <TierBadge />
      </div>
    </header>
  );
}
