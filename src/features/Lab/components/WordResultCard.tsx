// Word result card for LabDictionary search results
import type { StrongsWordData } from "@/services/strongsApi";
import { cn } from "@/lib/utils";

interface WordResultCardProps {
  word: StrongsWordData;
  onSelect: (strongsId: string) => void;
}

export function WordResultCard({ word, onSelect }: WordResultCardProps) {
  const isHebrew = word.strongsId?.startsWith("H");

  return (
    <button
      onClick={() => onSelect(word.strongsId)}
      className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/30 bg-card transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">{word.transliteration || word.strongsId}</span>
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              isHebrew ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent",
            )}>
              {isHebrew ? "Hebrew" : "Greek"}
            </span>
          </div>
          {word.definition && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{word.definition}</p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">{word.strongsId}</p>
        </div>
      </div>
    </button>
  );
}
