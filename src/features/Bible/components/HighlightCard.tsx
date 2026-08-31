// HighlightCard — renders a single highlight with color badge, verse ref, text, and actions
"use client";

import { Highlighter, BookOpen, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HighlightCardProps {
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText?: string;
  color: { color: string; label: string };
  note?: string;
  createdOn: string;
  deleting: boolean;
  onGoToReader: () => void;
  onDelete: () => void;
}

export function HighlightCard({
  bookName,
  chapter,
  verseNumber,
  verseText,
  color,
  note,
  createdOn,
  deleting,
  onGoToReader,
  onDelete,
}: HighlightCardProps) {
  const date = new Date(createdOn);
  const dateStr = isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      className="group rounded-xl border border-border/40 bg-card p-4 hover:shadow-md transition-all"
      style={{ borderLeftColor: color.color, borderLeftWidth: 4 }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Color swatch */}
          <div
            className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white dark:ring-card shadow-sm"
            style={{ backgroundColor: color.color }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {bookName} {chapter}:{verseNumber}
            </p>
            {dateStr && (
              <p className="text-[11px] text-muted-foreground/50">{dateStr}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onGoToReader}
            title="Open in reader"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
            title="Delete highlight"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Verse text */}
      {verseText && (
        <p
          className="mt-2.5 text-sm leading-relaxed rounded-lg px-3 py-2"
          style={{ backgroundColor: `${color.color}30` }}
        >
          {verseText}
        </p>
      )}

      {/* Note */}
      {note && (
        <div className="mt-2.5 flex items-start gap-1.5">
          <Highlighter className="w-3 h-3 text-muted-foreground/40 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground/70 italic">{note}</p>
        </div>
      )}
    </div>
  );
}
