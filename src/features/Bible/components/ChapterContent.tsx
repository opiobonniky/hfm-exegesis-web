"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { StickyNote } from "lucide-react";
import VerseToolbar from "./VerseToolbar";
import type { ChapterData, ReaderHighlight } from "../types";
import type { ChapterHeading } from "@/services/bibleApi";
import { getVerseHighlightStyle } from "../constants";

interface ChapterContentProps {
  chapters: ChapterData[];
  /** Section headings keyed by "Book-Chapter" (from useBibleReader). */
  headingsByChapter?: Record<string, ChapterHeading[]>;
  /** Verse currently being read aloud, or null when audio is off. */
  audioVerseKey?: string | null;
  selectedVerses: string[];
  highlights: Record<string, ReaderHighlight>;
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

export default function ChapterContent({
  chapters,
  headingsByChapter = {},
  audioVerseKey = null,
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

  /**
   * Verses between section headings stay inline (paragraph style), while a
   * heading breaks the flow onto its own centered line — mirroring how the
   * mobile app's VerseList renders them. The heading rides on the section it
   * introduces (including headings that land on verse 1).
   */
  const splitByHeadings = (
    verses: { verse: number; text: string }[],
    headings: ChapterHeading[],
  ): Array<{ heading?: string; verses: { verse: number; text: string }[] }> => {
    if (!headings.length) return [{ verses }];
    const headingByVerse = new Map(headings.map((h) => [h.verse, h.heading]));
    const sections: Array<{
      heading?: string;
      verses: { verse: number; text: string }[];
    }> = [{ verses: [] }];
    for (const verse of verses) {
      const heading = headingByVerse.get(verse.verse);
      const current = sections[sections.length - 1];
      if (heading && (current.verses.length > 0 || current.heading)) {
        sections.push({ heading, verses: [verse] });
      } else {
        if (heading) current.heading = heading;
        current.verses.push(verse);
      }
    }
    return sections;
  };

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
              {(() => {
                const headings = headingsByChapter[chapterKey] || [];
                const sections = splitByHeadings(ch.verses, headings);

                return sections.map((section, sectionIndex) => (
                  <Fragment key={`${chapterKey}-section-${sectionIndex}`}>
                    {section.heading && (
                      <h3 className="my-6 text-center font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground sm:my-8 sm:text-xl">
                        {section.heading}
                      </h3>
                    )}{" "}
                    <div className="!block">
                      {" "}
                      {section.verses.map((verse) => {
                        const key = `${chapterKey}-${verse.verse}`;
                        const isSelected = selectedVerseSet.has(key);
                        const highlight = highlights[key];
                        const isFavorited = favorites.has(key);
                        const note = verseNotes[key];
                        const hc = getVerseHighlightStyle(highlight?.colorId);
                        const isNowReading = audioVerseKey === key;
                        return (
                          <span
                            key={verse.verse}
                            className={cn(
                              "group relative !inline whitespace-normal",
                              isNowReading && "verse-reading",
                            )}
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
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  onToggleVerse(key);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-pressed={isSelected}
                              aria-label={`${ch.book} ${ch.chapter}:${verse.verse}. ${verse.text}`}
                              style={hc ?? undefined}
                              data-highlight={highlight ? "true" : undefined}
                              className={cn(
                                "-mx-0.5 inline cursor-pointer scroll-mt-20 whitespace-normal rounded-sm px-0.5 align-baseline transition-colors duration-200",
                                "hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                isSelected &&
                                  "bg-primary/10 ring-1 ring-primary/20",
                                hc && "verse-highlight-fade",
                              )}
                            >
                              <sup
                                className={cn(
                                  "select-none pe-0.5 font-sans text-[0.58em] font-bold leading-none text-primary/55 transition-colors hover:text-primary",
                                  isSelected && "text-primary",
                                  isNowReading && "text-primary",
                                )}
                              >
                                {verse.verse}
                                {isNowReading && (
                                  <span className="verse-eq" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                  </span>
                                )}
                              </sup>
                              {"\u00a0"}
                              {verse.text}
                            </span>
                            <span
                              className={cn(
                                "absolute -top-11 start-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 pointer-events-none translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
                                "z-[70]",
                                isSelected &&
                                  "max-sm:opacity-100 max-sm:translate-y-0",
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
                                    onExplainVerse(
                                      ch.book,
                                      ch.chapter,
                                      verse.verse,
                                    )
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
                              <span className="verse-note-in ms-6 mt-2 flex items-start gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 font-sans text-xs not-italic leading-relaxed text-muted-foreground">
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
                  </Fragment>
                ));
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
