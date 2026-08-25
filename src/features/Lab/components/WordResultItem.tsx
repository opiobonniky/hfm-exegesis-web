import { BookOpen, Hash, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrongsWordEntry } from "@/data/staticData";
import { getLangColor, getLangLetter } from "@/data/staticData";

interface Props {
  word: StrongsWordEntry;
  onClick?: () => void;
}

export function WordResultItem({ word, onClick }: Props) {
  const lang = word.language?.toLowerCase() || "unknown";
  const langColor = getLangColor(lang);
  const langLetter = getLangLetter(lang);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0", langColor)}>
          {langLetter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">{word.strongsId}</span>
            {word.transliteration && <span className="text-xs text-muted-foreground">{word.transliteration}</span>}
          </div>
          <p className="text-sm font-medium text-foreground truncate mt-0.5">{word.surfaceForm || word.meaning}</p>
          {word.meaning && <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{word.meaning}</p>}
        </div>
        <Info className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 mt-1" />
      </div>
    </button>
  );
}
