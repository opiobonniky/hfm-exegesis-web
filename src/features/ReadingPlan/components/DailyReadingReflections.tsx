import { Lightbulb, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Reflection { id: number; question: string; reflectionText: string; }

interface Props {
  reflections: Reflection[];
  ponderedIds: Set<number>;
  onTogglePonder: (id: number) => void;
}

export default function DailyReadingReflections({ reflections, ponderedIds, onTogglePonder }: Props) {
  if (!reflections.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5" /> Reflections
      </h3>
      {reflections.map((r) => {
        const pondered = ponderedIds.has(r.id);
        return (
          <div key={r.id} className={`rounded-2xl border p-4 space-y-2 transition-all ${pondered ? "border-green-300 bg-green-500/5" : "border-border/50 bg-card"}`}>
            <p className="text-sm font-semibold leading-relaxed">{r.question}</p>
            {r.reflectionText && <p className="text-xs text-muted-foreground leading-relaxed">{r.reflectionText}</p>}
            <Button variant={pondered ? "default" : "outline"} size="sm" onClick={() => onTogglePonder(r.id)} className="gap-1.5 text-xs">
              <PenLine className="w-3 h-3" /> {pondered ? "Pondered" : "Ponder"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
