"use client";

import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { VERSE_HIGHLIGHT_COLORS } from "../constants";

interface VerseToolbarColorPickerProps {
  /** Currently applied highlight color id, if any. */
  currentHighlight?: number;
  onPick: (colorId: number) => void;
  /** Remove the current highlight (only shown when one exists). */
  onClear: () => void;
  onClose: () => void;
}

export default function VerseToolbarColorPicker({
  currentHighlight,
  onPick,
  onClear,
  onClose,
}: VerseToolbarColorPickerProps) {
  return (
    <>
      {/* Click-away layer */}
      <span
        className="fixed inset-0 z-10 block cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />
      <span
        role="menu"
        aria-label="Choose highlight color"
        className="absolute top-full end-0 z-20 mt-2 flex items-center gap-1.5 rounded-full border border-border/80 bg-popover/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-1"
        onClick={(e) => e.stopPropagation()}
      >
        {VERSE_HIGHLIGHT_COLORS.map((c) => (
          <button
            type="button"
            role="menuitemradio"
            aria-checked={currentHighlight === c.id}
            key={c.id}
            onClick={(e) => {
              e.stopPropagation();
              onPick(c.id);
            }}
            className={cn(
              "h-5 w-5 rounded-full border transition-transform duration-150 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              c.color,
              currentHighlight === c.id
                ? cn("scale-110 ring-2", c.ring, "border-white")
                : "border-white/60",
            )}
            title={c.label}
            aria-label={`${c.label} highlight`}
          />
        ))}
        {currentHighlight !== undefined && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Remove highlight"
            aria-label="Remove highlight"
          >
            <Eraser className="h-3 w-3" />
          </button>
        )}
      </span>
    </>
  );
}
