// NoteCard — renders a single note with verse ref, text, and actions
"use client";

import { FileText, BookOpen, Edit2, Trash2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText?: string;
  note: string;
  createdOn: string;
  updatedOn: string | null;
  deleting: boolean;
  onGoToReader: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
}

export function NoteCard({
  bookName,
  chapter,
  verseNumber,
  verseText,
  note,
  createdOn,
  updatedOn,
  deleting,
  onGoToReader,
  onEdit,
  onDelete,
  formatDate,
}: NoteCardProps) {
  const dateStr = formatDate(updatedOn || createdOn);

  return (
    <div className="group rounded-xl border border-border/40 bg-card p-4 hover:shadow-md transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {bookName} {chapter}:{verseNumber}
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
            title="Open in reader"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
            title="Edit note"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
            title="Delete note"
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
        <p className="mt-2.5 text-sm leading-relaxed text-foreground/60 italic rounded-lg bg-muted/30 px-3 py-2">
          &ldquo;{verseText}&rdquo;
        </p>
      )}

      {/* Note content */}
      <div className="mt-2.5 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {note}
        </p>
      </div>
    </div>
  );
}
