// FavoriteCard — renders a single favorite with star, verse ref, text, and actions
"use client";

import { Star, BookOpen, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteCardProps {
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText?: string;
  createdOn: string;
  deleting: boolean;
  onGoToReader: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
}

export function FavoriteCard({
  bookName,
  chapter,
  verseNumber,
  verseText,
  createdOn,
  deleting,
  onGoToReader,
  onDelete,
  formatDate,
}: FavoriteCardProps) {
  const dateStr = formatDate(createdOn);

  return (
    <div className="group rounded-xl border border-border/40 bg-card p-4 hover:shadow-md transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
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
            title="Remove favorite"
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
        <p className="mt-2.5 text-sm leading-relaxed text-foreground/70 italic rounded-lg bg-yellow-500/5 px-3 py-2">
          &ldquo;{verseText}&rdquo;
        </p>
      )}
    </div>
  );
}
