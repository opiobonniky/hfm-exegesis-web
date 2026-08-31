// HistoryCard — renders a single read history entry with book, chapter, and actions
"use client";

import { BookOpen, Trash2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryCardProps {
  bookName: string;
  chapter: number;
  lastVerse?: number;
  createdOn: string;
  lastRead?: string;
  deleting: boolean;
  onGoToReader: () => void;
  onDelete: () => void;
  formatTimeAgo: (d: string) => string;
}

export function HistoryCard({
  bookName,
  chapter,
  lastVerse,
  createdOn,
  lastRead,
  deleting,
  onGoToReader,
  onDelete,
  formatTimeAgo,
}: HistoryCardProps) {
  const dateStr = formatTimeAgo(createdOn || lastRead || "");

  return (
    <div className="group rounded-xl border border-border/40 bg-card p-4 hover:shadow-md transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={onGoToReader}>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {bookName} {chapter}
              {lastVerse && lastVerse > 1 ? `:${lastVerse}` : ""}
            </p>
            {dateStr && (
              <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {dateStr}
              </p>
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
            title="Continue reading"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
            title="Remove from history"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
