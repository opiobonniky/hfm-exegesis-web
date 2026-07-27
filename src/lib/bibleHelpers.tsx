import React from "react";

/* ============================================================================
 * Types
 * ========================================================================== */

export interface Highlight {
  id?: number;
  verseKey: string;
  color: string;
  colorId: number;
  note?: string;
}


export interface ChapterData {
  book: string;
  chapter: number;
  verses: {
    key: string;
    text: string;
    num: number;
  }[];
}

export interface SpeechItem {
  verseKey: string;
  verseNum: number;
  text: string;
}

export interface TranslationOption {
  id: string;
  name: string;
  shortName: string;
  year?: string | null;
}

export interface StrongsWord {
  text: string;
  strongsId: string | null;
  hasData: boolean;
}

/* ============================================================================
 * Constants
 * ========================================================================== */

export const FREE_TRANSLATION_IDS = new Set([
  "Berean",
  "KJV",
  "NIV",
  "ESV",
  "GW",
  "ASV",
  "YLT",
]);

export const HIGHLIGHT_COLORS = [
  { id: 1, name: "Red", color: "#F87171" },
  { id: 3, name: "Yellow", color: "#FACC15" },
  { id: 4, name: "Orange", color: "#F97316" },
  { id: 13, name: "Pink", color: "#EC4899" },
  { id: 14, name: "Rose", color: "#FB7185" },
  { id: 15, name: "Amber", color: "#F59E0B" },
  { id: 2, name: "Blue", color: "#3B82F6" },
  { id: 7, name: "Cyan", color: "#06B6D4" },
  { id: 8, name: "Teal", color: "#0D9488" },
  { id: 9, name: "Sky", color: "#38BDF8" },
  { id: 10, name: "Indigo", color: "#6366F1" },
  { id: 5, name: "Green", color: "#22C55E" },
  { id: 6, name: "Purple", color: "#A855F7" },
  { id: 11, name: "Lime", color: "#84CC16" },
  { id: 12, name: "Mint", color: "#2DD4BF" },
];

/* ============================================================================
 * Helpers
 * ========================================================================== */

/**
 * Render verse text while making anything inside [] italic.
 */
export function renderVerseText(
  text: string,
): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  const regex = /\[([^\]]+)\]/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    result.push(
      <span
        key={`footnote-${match.index}`}
        className="italic text-muted-foreground"
      >
        {match[1]}
      </span>,
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/**
 * Render verse with Strong's words.
 */
export function renderVerseWithStrongs(
  text: string,
  verseKey: string,
  strongsWords: StrongsWord[],
  onWordTap: (strongsId: string, wordText: string) => void,
): React.ReactNode[] {
  const wordsWithStrongs = strongsWords.filter(
    (w) => w.strongsId && w.hasData,
  );

  if (!wordsWithStrongs.length) {
    return renderVerseText(text);
  }

  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    const cleanWord = part
      .replace(/[^a-zA-ZÀ-ÿ'-]+/g, "")
      .toLowerCase();

    const match = wordsWithStrongs.find(
      (w) => w.text.toLowerCase() === cleanWord,
    );

    if (!match?.strongsId) {
      return (
        <React.Fragment key={`${verseKey}-${index}`}>
          {part}
        </React.Fragment>
      );
    }

    return (
      <button
        key={`${verseKey}-${index}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onWordTap(match.strongsId, match.text);
        }}
        title="Study this word"
        className="inline border-b border-dotted border-primary/40 hover:border-primary hover:text-primary transition-colors cursor-help rounded-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
      >
        {part}
      </button>
    );
  });
}

/**
 * Truncate text.
 */
export function truncateText(
  text: string,
  maxLength: number,
): string {
  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength).trim()}…`;
}

/**
 * Parse "Genesis 1:3"
 */
export function parseVerseKey(key: string) {
  const match = key.match(/^(.+)\s+(\d+):(\d+)$/);

  if (!match) return null;

  return {
    book: match[1],
    chapter: Number(match[2]),
    verse: Number(match[3]),
  };
}

/**
 * Clean text for speech.
 */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[[^\]]*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============================================================================
 * Components
 * ========================================================================== */

export function TextContent({
  text,
}: {
  text?: string | null;
}) {
  if (!text) return null;

  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .filter(Boolean);

  return (
    <div className="text-sm sm:text-base leading-relaxed text-foreground/80">
      {paragraphs.map((para, pIndex) => {
        const lines = para
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const isBulletList = lines.some((line) =>
          /^(\-|\*|•|\d+\.)\s+/.test(line),
        );

        if (isBulletList) {
          return (
            <div
              key={pIndex}
              className="space-y-2 mb-4"
            >
              {lines.map((line, lineIndex) => {
                const isBullet = /^(\-|\*|•|\d+\.)\s+/.test(line);

                if (!isBullet) {
                  return (
                    <p
                      key={lineIndex}
                      className="leading-7 sm:leading-8"
                    >
                      {line}
                    </p>
                  );
                }

                return (
                  <div
                    key={lineIndex}
                    className="flex gap-3 items-start"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />

                    <span className="leading-7 sm:leading-8">
                      {line.replace(
                        /^(\-|\*|•|\d+\.)\s+/,
                        "",
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <p
            key={pIndex}
            className="leading-7 sm:leading-8 mb-4 last:mb-0"
          >
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}

export function ToolbarBtn({
  onClick,
  icon,
  label,
  compact = false,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1.5 min-h-[44px] rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted transition-colors whitespace-nowrap [touch-action:manipulation]"
    >
      {icon}

      {compact ? (
        <span>{label}</span>
      ) : (
        <span className="hidden sm:inline">{label}</span>
      )}
    </button>
  );
}