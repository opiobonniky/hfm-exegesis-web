// JournalEntryCard — renders a single journal entry in the grid
"use client";

import { BookOpen, Clock, Star, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface JournalEntryData {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number | null;
  category?: string;
  mood?: string | null;
  isFavorite?: boolean;
  source?: string;
  tags?: string | null;
  createdOn?: string;
  updatedOn?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  reflection: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  prayer: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  gratitude: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
  study: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  notes: { bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface JournalEntryCardProps {
  entry: JournalEntryData;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onView: (id: number) => void;
  onDelete?: (entry: JournalEntryData) => void;
}

export function JournalEntryCard({
  entry,
  selectionMode = false,
  selected = false,
  onSelect,
  onView,
  onDelete,
}: JournalEntryCardProps) {
  const cat = CATEGORY_COLORS[entry.category || "notes"] || CATEGORY_COLORS.notes;
  const verseRef = entry.bookName
    ? `${entry.bookName}${entry.chapter ? ` ${entry.chapter}` : ""}${entry.verseNumber ? `:${entry.verseNumber}` : ""}`
    : null;

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md cursor-pointer",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border/40",
      )}
      onClick={() => (selectionMode && onSelect ? onSelect(entry.id) : onView(entry.id))}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-3 left-3">
          <div
            className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
              selected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background",
            )}
          >
            {selected && <span className="text-xs font-bold">✓</span>}
          </div>
        </div>
      )}

      {/* Category + favorite */}
      <div className={cn("flex items-center gap-2 mb-2", selectionMode && "ml-7")}>
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", cat.bg, cat.text)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cat.dot)} />
          {entry.category || "note"}
        </span>
        {entry.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
      </div>

      {/* Title */}
      <h3 className={cn("font-semibold text-sm text-foreground line-clamp-2 mb-1", selectionMode && "ml-7")}>
        {entry.title || "Untitled Entry"}
      </h3>

      {/* Verse reference */}
      {verseRef && (
        <p className="text-[11px] text-muted-foreground/60 font-mono mb-1.5">{verseRef}</p>
      )}

      {/* Content preview */}
      {entry.content && (
        <p className="text-xs text-muted-foreground/70 line-clamp-3 leading-relaxed">{entry.content}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {formatDate(entry.createdOn || entry.updatedOn)}
        </span>
        {!selectionMode && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(entry); }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
