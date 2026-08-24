// Reflection panel — reading plan reflection questions shown at bottom of reader
import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronRight, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionPanelProps {
  planTitle: string;
  dayTitle: string;
  questions: string[];
  onJournalEntry?: (question: string) => void;
}
export default function ReflectionPanel({ planTitle, dayTitle, questions, onJournalEntry }: ReflectionPanelProps) {
  const [open, setOpen] = useState(false);
  if (!questions.length) return null;
  return (
    <div className="shrink-0 z-10 border-t border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-accent/5">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-all",
          open && "border-b border-amber-500/10",
        )}
      >
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{planTitle} — Reflections</p>
          <p className="text-[10px] text-muted-foreground">{dayTitle}</p>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {/* Expanded questions */}
      {open && (
        <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
          {questions.map((q, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-600 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="flex-1 text-xs text-foreground/80 leading-relaxed">{q}</p>
              {onJournalEntry && (
                <button
                  onClick={() => onJournalEntry(q)}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
                  title="Write in journal"
                >
                  <PenLine className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
      )}
    </div>
  );
