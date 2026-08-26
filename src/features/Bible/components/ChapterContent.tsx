"use client";

import { cn } from "@/lib/utils";
import VerseToolbar from "./VerseToolbar";
import type { ChapterData, Highlight } from "../hooks/useBibleReader";

interface ChapterContentProps {
  chapters: ChapterData[];
  selectedVerses: string[];
  highlights: Record<string, Highlight>;
  favorites: Set<string>;
  verseNotes: Record<string, string>;
  onToggleVerse: (key: string) => void;
  onToggleHighlight: (book: string, chapter: number, verse: number, colorId: number) => void;
  onToggleFavorite: (book: string, chapter: number, verse: number) => void;
  onExplainVerse: (book: string, chapter: number, verse: number) => void;
  chapterRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
  verseRefs: React.MutableRefObject<Record<string, HTMLSpanElement | null>>;
}

const HC: Record<number, { light: string; dark: string }> = {
  0: { light: "bg-yellow-100", dark: "dark:bg-yellow-950/30" },
  1: { light: "bg-green-100", dark: "dark:bg-green-950/30" },
  2: { light: "bg-blue-100", dark: "dark:bg-blue-950/30" },
  3: { light: "bg-pink-100", dark: "dark:bg-pink-950/30" },
  4: { light: "bg-orange-100", dark: "dark:bg-orange-950/30" },
};

export default function ChapterContent({
  chapters, selectedVerses, highlights, favorites, verseNotes,
  onToggleVerse, onToggleHighlight, onToggleFavorite, onExplainVerse,
  chapterRefs, verseRefs,
}: ChapterContentProps) {
  const selectedVerseSet = new Set(selectedVerses);

  return (
    <div className="space-y-10">
      {chapters.map((ch) => {
        const chapterKey = `${ch.book}-${ch.chapter}`;
        return (
          <div key={chapterKey} ref={(el) => { if (el) chapterRefs.current[chapterKey] = el; }}>
            <div className="flex items-center gap-3 mb-5 top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{ch.chapter}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {ch.book} {ch.chapter}
              </h2>
            </div>
            <div className="leading-[1.9] text-foreground/85 tracking-wide font-serif">
              {ch.verses.map((verse) => {
                const key = `${chapterKey}-${verse.verse}`;
                const isSelected = selectedVerseSet.has(key);
                const highlight = highlights[key];
                const isFavorited = favorites.has(key);
                const note = verseNotes[key];
                const hc = highlight ? HC[highlight.colorId] : null;
                return (
                  <span key={verse.verse} className="group relative !inline whitespace-normal" style={{ whiteSpace: "normal" }}>
                    <span
                      ref={(el) => { verseRefs.current[key] = el; }}
                      onClick={() => onToggleVerse(key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onToggleVerse(key);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`${ch.book} ${ch.chapter}:${verse.verse}. ${verse.text}`}
                      className={cn(
                        "inline scroll-mt-16 whitespace-normal cursor-pointer transition-all duration-200 rounded-sm -mx-0.5 px-0.5 align-baseline",
                        "hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20",
                        hc && cn(hc.light, hc.dark),
                      )}
                    >
                      <sup className={cn(
                        "text-[0.65em] font-bold leading-none select-none transition-colors",
                        "text-primary/50 hover:text-primary",
                        isSelected && "text-primary",
                      )}>
                        {verse.verse}
                      </sup>
                      {" "}
                      {verse.text}
                    </span>
                    <span className={cn(
                      "absolute -top-11 start-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 z-20 pointer-events-none translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
                      isSelected && "max-sm:opacity-100 max-sm:translate-y-0",
                    )}>
                      <span className="pointer-events-auto block">
                        <VerseToolbar
                          verseKey={key}
                          book={ch.book}
                          chapter={ch.chapter}
                          verse={verse.verse}
                          isFavorited={isFavorited}
                          currentHighlight={highlight?.colorId}
                          onHighlight={onToggleHighlight}
                          onFavorite={onToggleFavorite}
                          onExplain={() => onExplainVerse(ch.book, ch.chapter, verse.verse)}
                        />
                      </span>
                    </span>
                    {note && (
                      <span className="block text-xs text-muted-foreground mt-1 italic bg-muted/50 rounded px-2 py-1 ms-6">
                        📝 {note}
                      </span>
                    )}
                    {" "}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
