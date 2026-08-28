"use client";

import { cn } from "@/lib/utils";
import { StickyNote } from "lucide-react";
import VerseToolbar from "./VerseToolbar";
import type { ChapterData, Highlight } from "../hooks/useBibleReader";

interface ChapterContentProps {
  chapters: ChapterData[];
  selectedVerses: string[];
  highlights: Record<string, Highlight>;
  favorites: Set<string>;
  verseNotes: Record<string, string>;
  onToggleVerse: (key: string) => void;
  onToggleHighlight: (
    book: string,
    chapter: number,
    verse: number,
    colorId: number,
  ) => void;
  onToggleFavorite: (book: string, chapter: number, verse: number) => void;
  onExplainVerse: (book: string, chapter: number, verse: number) => void;
  onOpenVerseActions?: (book: string, chapter: number, verse: number) => void;
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
  chapters,
  selectedVerses,
  highlights,
  favorites,
  verseNotes,
  onToggleVerse,
  onToggleHighlight,
  onToggleFavorite,
  onExplainVerse,
  onOpenVerseActions,
  chapterRefs,
  verseRefs,
}: ChapterContentProps) {
  const selectedVerseSet = new Set(selectedVerses);

  return (
    <div className="mx-auto w-full  space-y-16 pb-10 sm:space-y-20 sm:pb-16">
      {chapters.map((ch) => {
        const chapterKey = `${ch.book}-${ch.chapter}`;
        return (
          <div
            key={chapterKey}
            ref={(el) => {
              if (el) chapterRefs.current[chapterKey] = el;
            }}
            role="region"
            aria-labelledby={`${chapterKey}-title`}
          >
            <header className="mb-8 border-b border-border/60 pb-6 text-center sm:mb-10 sm:pb-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/70">
                Chapter
              </p>
              <h2
                id={`${chapterKey}-title`}
                className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                <span>{ch.book}</span>
                <span
                  className="mx-2 text-muted-foreground/50"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="tabular-nums text-primary">{ch.chapter}</span>
              </h2>
            </header>
            <div className="font-serif leading-[2.05] tracking-[0.012em] text-foreground/90 sm:leading-[2.15]">
              {ch.verses.map((verse) => {
                const key = `${chapterKey}-${verse.verse}`;
                const isSelected = selectedVerseSet.has(key);
                const highlight = highlights[key];
                const isFavorited = favorites.has(key);
                const note = verseNotes[key];
                const hc = highlight ? HC[highlight.colorId] : null;
                return (
                  <span
                    key={verse.verse}
                    className="group relative !inline whitespace-normal"
                  >
                    <span
                      ref={(el) => {
                        verseRefs.current[key] = el;
                      }}
                      onClick={() => onToggleVerse(key)}
                      onDoubleClick={() =>
                        (onOpenVerseActions ?? onExplainVerse)(
                          ch.book,
                          ch.chapter,
                          verse.verse,
                        )
                      }
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
                        "-mx-0.5 inline cursor-pointer scroll-mt-20 whitespace-normal rounded-sm px-0.5 align-baseline transition-colors duration-200",
                        "hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20",
                        hc && cn(hc.light, hc.dark),
                      )}
                    >
                      <sup
                        className={cn(
                          "select-none pe-0.5 font-sans text-[0.58em] font-bold leading-none text-primary/55 transition-colors hover:text-primary",
                          isSelected && "text-primary",
                        )}
                      >
                        {verse.verse}
                      </sup>
                      {"\u00a0"}
                      {verse.text}
                    </span>
                    <span
                      className={cn(
                        "absolute -top-11 start-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 z-20 pointer-events-none translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
                        isSelected && "max-sm:opacity-100 max-sm:translate-y-0",
                      )}
                    >
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
                          onExplain={() =>
                            onExplainVerse(ch.book, ch.chapter, verse.verse)
                          }
                          onMore={() =>
                            (onOpenVerseActions ?? onExplainVerse)(
                              ch.book,
                              ch.chapter,
                              verse.verse,
                            )
                          }
                        />
                      </span>
                    </span>
                    {note && (
                      <span className="ms-6 mt-2 flex items-start gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 font-sans text-xs not-italic leading-relaxed text-muted-foreground">
                        <StickyNote
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70"
                          aria-hidden="true"
                        />
                        <span>{note}</span>
                      </span>
                    )}{" "}
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
