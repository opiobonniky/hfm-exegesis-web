import { BookOpen, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary">{word.strongsId}</span>
            {word.transliteration && <span className="text-xs text-muted-foreground">{word.transliteration}</span>}
            {word.hasVerseStudy && (
              <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[9px] text-amber-700 dark:text-amber-400">
                <Sparkles className="h-2.5 w-2.5" /> Study note
              </Badge>
            )}
          </div>
          <p className="mt-1 text-base font-semibold text-foreground truncate">{word.originalWord || word.transliteration || word.strongsId}</p>
          {word.surfaceText && <p className="mt-0.5 text-xs text-muted-foreground">Appears as “{word.surfaceText}”</p>}
          {word.shortDefinition && <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80 line-clamp-2">{word.shortDefinition}</p>}
        </div>
        <Info className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 mt-1" />
      </div>
    </button>
  );
}
