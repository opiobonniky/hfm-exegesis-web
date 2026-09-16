"use client";

import { useState } from "react";
import {
  Highlighter,
  Star,
  BookOpenText,
  Ellipsis,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bibleTheme } from "../theme/theme";
import VerseToolbarColorPicker from "./VerseToolbarColorPicker";

interface VerseToolbarProps {
  /** Unused display key kept for call-site compatibility. */
  verseKey?: string;
  book: string;
  chapter: number;
  verse: number;
  isFavorited: boolean;
  currentHighlight?: number;
  onHighlight: (
    book: string,
    chapter: number,
    verse: number,
    colorId: number,
  ) => void;
  onFavorite: (book: string, chapter: number, verse: number) => void;
  onExplain: () => void;
  onMore: () => void;
}

const toolbarButton = bibleTheme.components.verseToolbarButton;
const toolbarButtonActive = bibleTheme.components.verseToolbarButtonActive;

export default function VerseToolbar({
  book,
  chapter,
  verse,
  isFavorited,
  currentHighlight,
  onHighlight,
  onFavorite,
  onExplain,
  onMore,
}: VerseToolbarProps) {
  const [showColors, setShowColors] = useState(false);

  return (
    <div
      className="flex max-w-full items-center gap-0.5 rounded-full border border-border/70 bg-popover/95 p-1 shadow-lg backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Highlight with color picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowColors((open) => !open)}
          className={cn(
            currentHighlight !== undefined || showColors
              ? toolbarButtonActive
              : toolbarButton,
          )}
          title="Highlight verse"
          aria-label="Highlight verse"
          aria-expanded={showColors}
        >
          <Highlighter className="h-3.5 w-3.5" />
        </button>
        {showColors && (
          <VerseToolbarColorPicker
            currentHighlight={currentHighlight}
            onPick={(colorId) => {
              onHighlight(book, chapter, verse, colorId);
              setShowColors(false);
            }}
            onClear={() => {
              onHighlight(book, chapter, verse, currentHighlight ?? 0);
              setShowColors(false);
            }}
            onClose={() => setShowColors(false)}
          />
        )}
      </div>

      {/* Favorite */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(book, chapter, verse);
        }}
        className={cn(
          isFavorited
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-rose-500 transition-colors duration-150 hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            : toolbarButton,
        )}
        title={isFavorited ? "Remove favorite" : "Add favorite"}
        aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
        aria-pressed={isFavorited}
      >
        <Star className={cn("h-3.5 w-3.5", isFavorited && "fill-current")} />
      </button>

      {/* Explain */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExplain();
        }}
        className={cn(toolbarButton, "hover:text-primary")}
        title="View explanation"
        aria-label={`Explain ${book} ${chapter}:${verse}`}
      >
        <BookOpenText className="h-3.5 w-3.5" />
      </button>

      {/* More actions */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMore();
        }}
        className={cn(toolbarButton)}
        title="More verse actions"
        aria-label={`More actions for ${book} ${chapter}:${verse}`}
      >
        <Ellipsis className="h-3.5 w-3.5" />
      </button>

      {/* Close affordance (visual only — click-away already dismisses picker) */}
      {showColors && (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground"
          aria-hidden="true"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}
