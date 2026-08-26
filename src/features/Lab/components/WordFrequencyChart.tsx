import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartItem { word: string; count: number; language?: string; strongsId?: string; }
interface Props {
  data: ChartItem[];
  onWordClick: (id: string) => void;
  mode: string;
  onModeChange: (m: string) => void;
  langFilter: string;
  onLangFilterChange: (f: string) => void;
  langCounts: Record<string, number>;
}
export function WordFrequencyChart({ data, onWordClick, mode, onModeChange, langFilter, onLangFilterChange, langCounts }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Word Frequency</span>
        </div>
        <div className="flex items-center gap-1">
          {["frequency", "partOfSpeech"].map((m) => (
            <button key={m} onClick={() => onModeChange(m)}
              className={cn("px-2 py-0.5 rounded text-[10px] font-semibold transition-colors", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
              {m === "frequency" ? "Freq" : "POS"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {data.slice(0, 20).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => item.strongsId && onWordClick(item.strongsId)} className="text-xs font-medium text-foreground hover:text-primary truncate w-20 text-right">
              {item.word}
            </button>
            <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
              <div className="h-full bg-primary/60 rounded" style={{ width: `${(item.count / maxCount) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
