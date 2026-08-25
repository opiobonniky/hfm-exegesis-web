// Reflection questions with ponder toggle
import { Lightbulb, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionSectionProps {
  questions: string[];
  pondered: Set<number>;
  onTogglePonder: (idx: number) => void;
}
export function ReflectionSection({ questions, pondered, onTogglePonder }: ReflectionSectionProps) {
  if (!questions.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-foreground">Reflection Questions</h3>
      </div>
      {questions.map((q, idx) => (
        <div
          key={idx}
          className={cn(
            "p-3 rounded-xl border transition-all",
            pondered.has(idx)
              ? "border-accent/30 bg-accent/5"
              : "border-border bg-card",
          )}
        >
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">{q}</p>
              <button
                onClick={() => onTogglePonder(idx)}
                className={cn(
                  "mt-2 flex items-center gap-1.5 text-[10px] font-semibold transition-all",
                  pondered.has(idx) ? "text-accent" : "text-muted-foreground hover:text-accent",
                )}
              >
                <Star className={cn("w-3 h-3", pondered.has(idx) && "fill-accent")} />
                {pondered.has(idx) ? "Pondered" : "Mark as pondered"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
