// Activity feed item — single card for highlights, notes, favorites, history
import { BookOpen, Trash2, Loader2, Clock, ChevronRight, Highlighter, FileText, Star, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HIGHLIGHT_COLORS } from "@/hooks/useBible";
import { getVerseText } from "@/utilities/bibleUtils";

const TYPE_META: Record<string, { icon: typeof BookOpen; color: string; bg: string; label: string }> = {
  highlights: { icon: Highlighter, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", label: "Highlight" },
  notes: { icon: FileText, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", label: "Note" },
  favorites: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", label: "Favorite" },
  history: { icon: History, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", label: "Read" },
};
interface ActivityFeedItemProps {
  type: "highlights" | "notes" | "favorites" | "history";
  data: any;
  formatTimeAgo: (date: string) => string;
  onNavigate: (book: string, chapter: number) => void;
  onDelete: () => void;
  deleting: boolean;
}
export default function ActivityFeedItem({ type, data, formatTimeAgo, onNavigate, onDelete, deleting }: ActivityFeedItemProps) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  const verseText = getVerseText(data.bookName, data.chapter, data.verseNumber);
  const colorHex = type === "highlights" ? HIGHLIGHT_COLORS.find((c) => c.id === data.colorId)?.color || "#F87171" : null;
  return (
    <div onClick={() => onNavigate(data.bookName, data.chapter)}
      className="group relative bg-card border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
      {/* Type badge + time */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold", meta.bg, meta.color)}>
          <Icon className="w-3 h-3" />{meta.label}
        </div>
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
          <Clock className="w-3 h-3" />{formatTimeAgo(data.createdOn)}
        </span>
      </div>
      {/* Reference */}
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground/70">{data.bookName} {data.chapter}:{data.verseNumber}</span>
      {/* Verse text */}
      {verseText && (
        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-2 mb-2 italic border-l-2 border-muted-foreground/20 pl-3">
          &ldquo;{verseText}&rdquo;
        </p>
      )}
      {/* Note content */}
      {type === "notes" && data.note && (
        <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 px-3.5 py-2.5">
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{data.note}</p>
      {/* Note on highlight */}
      {type === "highlights" && data.note && (
        <p className="mt-2 text-xs text-muted-foreground/60 line-clamp-1">{data.note}</p>
      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1 group-hover:text-primary/60 transition-colors">
          Open in reader<ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all max-sm:opacity-100"
          onClick={(e) => { e.stopPropagation(); onDelete(); }} disabled={deleting}>
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </Button>
      {/* Color accent bar for highlights */}
      {colorHex && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: colorHex }} />}
    </div>
  );
