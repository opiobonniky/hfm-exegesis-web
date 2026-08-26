"use client";

import { useState } from "react";
import { Star, Highlighter, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
const HIGHLIGHT_COLORS = [
  { id: 0, color: "bg-yellow-300", ring: "ring-yellow-300", label: "Yellow" },
  { id: 1, color: "bg-green-300", ring: "ring-green-300", label: "Green" },
  { id: 2, color: "bg-blue-300", ring: "ring-blue-300", label: "Blue" },
  { id: 3, color: "bg-pink-300", ring: "ring-pink-300", label: "Pink" },
  { id: 4, color: "bg-orange-300", ring: "ring-orange-300", label: "Orange" },
];
interface VerseToolbarProps {
  verseKey: string;
  book: string;
  chapter: number;
  verse: number;
  isFavorited: boolean;
  currentHighlight?: number;
  onHighlight: (book: string, chapter: number, verse: number, colorId: number) => void;
  onFavorite: (book: string, chapter: number, verse: number) => void;
  onExplain: () => void;
}
export default function VerseToolbar({
  verseKey, book, chapter, verse, isFavorited, currentHighlight,
  onHighlight, onFavorite, onExplain,
}: VerseToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  return (
    <div
      className="flex items-center gap-1 bg-card/95 backdrop-blur-md border border-border/60 rounded-xl px-1.5 py-1 shadow-lg shadow-black/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Highlight */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowColors(!showColors)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            currentHighlight !== undefined
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          title="Highlight"
          aria-label="Highlight verse"
          aria-expanded={showColors}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>
        {/* Color picker dropdown */}
        {showColors && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowColors(false)} />
            <div className="absolute top-full end-0 mt-1.5 flex gap-1.5 p-2 rounded-xl bg-card border border-border shadow-xl z-20">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHighlight(book, chapter, verse, c.id);
                    setShowColors(false);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                    c.color,
                    currentHighlight === c.id ? "border-foreground ring-2 ring-foreground/20 scale-110" : "border-white/50",
                  )}
                  title={c.label}
                  aria-label={`${c.label} highlight`}
                />
              ))}
              {/* Remove highlight */}
              {currentHighlight !== undefined && (
                <button
                  type="button"
                  onClick={() => onHighlight(book, chapter, verse, -1)}
                  className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted transition-all"
                  title="Remove"
                  aria-label="Remove highlight"
                >
                  ×
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {/* Divider */}
      <div className="w-px h-4 bg-border/50" />
      {/* Favorite */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onFavorite(book, chapter, verse); }}
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
          isFavorited
            ? "bg-rose-500/10 text-rose-500"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        title={isFavorited ? "Remove favorite" : "Add favorite"}
        aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
        aria-pressed={isFavorited}
      >
        <Star className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
      </button>
      {/* Explain */}
      <button
        onClick={(e) => { e.stopPropagation(); onExplain(); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
        title="View explanation"
        aria-label={`Explain ${book} ${chapter}:${verse}`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
