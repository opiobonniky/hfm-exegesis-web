import { ChevronRight, Edit2, BookOpen, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StrongsWordEntry } from "@/data/staticData";
import {
  getLangColor,
  getLangLetter,
  getLangScript,
} from "@/data/staticData";

// ── Types ──

export interface WordCardProps {
  word: StrongsWordEntry;
  onClick: () => void;
  onEdit?: () => void;
  showChevron?: boolean;
  showEditButton?: boolean;
  showGrammarCase?: boolean;
  showFullDefinition?: boolean;
  showStrongsId?: boolean;
}

// ── Component ──

export default function WordCard({
  word,
  onClick,
  onEdit,
  showChevron = true,
  showEditButton = false,
  showGrammarCase = true,
  showFullDefinition = true,
  showStrongsId = true,
}: WordCardProps) {
  const langColor = getLangColor(word.language);

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative flex items-start gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:shadow-sm hover:border-primary/30 hover:bg-muted/10 transition-all active:scale-[0.99] overflow-hidden"
    >
      {/* Language accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: langColor }}
      />

      {/* Language avatar */}
      <div
        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: `${langColor}15`,
          color: langColor,
        }}
      >
        {getLangLetter(word.language)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Primary row: English word (the main explainable term) + metadata chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {word.shortDefinition}
          </span>
          <div className="flex items-center gap-1.5">
            {word.verseCount != null && word.verseCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[8px] font-bold px-1.5 py-0 gap-0.5 bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400"
              >
                <Bookmark className="w-2.5 h-2.5" />
                {word.verseCount} {word.verseCount === 1 ? "verse" : "verses"}
              </Badge>
            )}
            {word.usageCount != null && (
              <span className="text-[9px] text-muted-foreground tabular-nums bg-muted/40 px-1.5 py-0.5 rounded-sm">
                {word.usageCount}×
              </span>
            )}
            <Badge
              variant="outline"
              className="text-[9px] font-bold px-1.5 py-0"
              style={{
                backgroundColor: `${langColor}10`,
                borderColor: `${langColor}30`,
                color: langColor,
              }}
            >
              {word.language}
            </Badge>
            {word.hasVerseStudy && (
              <Badge variant="secondary" className="text-[8px] font-bold px-1.5 py-0 gap-0.5 bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400">
                <BookOpen className="w-2.5 h-2.5" />
                Study note
              </Badge>
            )}
            {showStrongsId && (
              <span className="text-[8px] font-mono text-muted-foreground/30">
                {word.strongsId}
              </span>
            )}
          </div>
        </div>

        {/* Secondary row: original word (Greek/Hebrew) + transliteration — shown below English */}
        {(word.originalWord || word.transliteration) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {word.originalWord && (
              <span
                className="text-xs font-medium text-foreground/80"
                style={{ fontFamily: getLangScript(word.language) }}
              >
                {word.originalWord}
              </span>
            )}
            {word.transliteration && (
              <span className="text-xs italic text-muted-foreground/60">
                {word.transliteration}
              </span>
            )}
            {showGrammarCase && word.grammaticalCase && (
              <span className="text-[9px] text-muted-foreground/40 hidden sm:inline">
                · {word.grammaticalCase}
              </span>
            )}
          </div>
        )}

        {/* Metadata row: part of speech + full definition preview */}
        <div className="flex items-center gap-2 mt-1">
          {word.partOfSpeech && (
            <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70 font-medium">
              {word.partOfSpeech}
            </span>
          )}
          {showFullDefinition && word.fullDefinition && (
            <span className="text-[10px] text-muted-foreground/50 truncate">
              {word.fullDefinition.slice(0, 80)}
              {word.fullDefinition.length > 80 ? "..." : ""}
            </span>
          )}
        </div>
      </div>

      {/* Right-side actions */}
      <div
        className={`flex items-center gap-0.5 shrink-0 mt-0.5 ${
          showEditButton || showChevron
            ? "opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0"
            : ""
        }`}
      >
        {showEditButton && onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
        {showChevron && (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
        )}
      </div>
    </button>
  );
}
