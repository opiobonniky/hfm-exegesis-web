"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VERSE_HIGHLIGHT_COLORS,
  VERSE_HIGHLIGHT_COLOR_GROUPS,
} from "../constants";

interface VerseToolbarColorPickerProps {
  /** Currently applied highlight color id, if any (0 = none). */
  currentHighlight?: number;
  /** Screen-space anchor: the toolbar button's bounding rect. */
  anchorRect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
  onPick: (colorId: number) => void;
  /** Remove the current highlight (only shown when one exists). */
  onClear: () => void;
  onClose: () => void;
}

const PICKER_WIDTH = 224;

export default function VerseToolbarColorPicker({
  currentHighlight,
  anchorRect,
  onPick,
  onClear,
  onClose,
}: VerseToolbarColorPickerProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Position once, anchored below the toolbar button and clamped to the
  // viewport so it never hides under the sidebar or screen edge.
  useEffect(() => {
    if (!anchorRect) return;
    const vw = window.innerWidth;
    const left = Math.min(
      Math.max(anchorRect.right - PICKER_WIDTH, 8),
      vw - PICKER_WIDTH - 8,
    );
    setPos({ top: anchorRect.bottom + 8, left });
  }, [anchorRect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!pos || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Click-away layer */}
      <span
        className="fixed inset-0 z-[90] block cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />
      <span
        role="menu"
        aria-label="Choose highlight color"
        style={{ top: pos.top, left: pos.left, width: PICKER_WIDTH }}
        className="fixed z-[100] flex flex-col gap-2 rounded-2xl border border-border/80 bg-popover/95 p-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-1"
        onClick={(e) => e.stopPropagation()}
      >
        {VERSE_HIGHLIGHT_COLOR_GROUPS.map((group) => {
          const colors = group.ids
            .map((id) => VERSE_HIGHLIGHT_COLORS.find((c) => c.id === id))
            .filter(Boolean) as typeof VERSE_HIGHLIGHT_COLORS;
          return (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {colors.map((c) => (
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
                      "h-6 w-6 rounded-full border transition-transform duration-150 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      currentHighlight === c.id
                        ? "scale-110 border-foreground ring-2 ring-foreground/30"
                        : "border-black/10",
                    )}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                    aria-label={`${c.name} highlight`}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {currentHighlight != null && currentHighlight !== 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/40 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Remove highlight"
            aria-label="Remove highlight"
          >
            <Eraser className="h-3 w-3" />
            Remove highlight
          </button>
        )}
      </span>
    </>,
    document.body,
  );
}
