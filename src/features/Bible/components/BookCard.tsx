// Book card — expandable book row with chapter grid
import { BookText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import BookOverviewTeaser from "./BookOverviewTeaser";

interface BookCardProps {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
  expanded: boolean;
  onToggle: () => void;
  onChapterClick: (chapter: number) => void;
  onBookOverview?: () => void;
  isRtl?: boolean;
}
export default function BookCard({ bookNumber, bookName, testament, chaptersCount, totalVerses, expanded, onToggle, onChapterClick, onBookOverview, isRtl }: BookCardProps) {
  const isOt = testament === "Old";
  const chapters = Array.from({ length: chaptersCount }, (_, i) => i + 1);
  return (
    <div className={cn("group rounded-xl border bg-card overflow-hidden transition-all duration-200",
      "hover:border-border/70 hover:shadow-sm",
      expanded ? "border-border/70 shadow-md ring-1 ring-border/30" : "border-border/40")}>
      {/* Book row */}
      <button onClick={onToggle}
        className={cn("w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left transition-all duration-150",
          "hover:bg-muted/20 active:scale-[0.995] border-l-[3px]",
          isOt ? "border-l-indigo-500/60 hover:border-l-indigo-500" : "border-l-amber-500/60 hover:border-l-amber-500")}>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
          "group-hover:scale-105",
          isOt ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
          <BookText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/40 font-mono font-medium tabular-nums shrink-0">{String(bookNumber).padStart(2, "0")}</span>
            <p className="text-sm font-bold text-foreground truncate">{bookName}</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5 ml-8">
            <span className="text-[10px] font-semibold text-muted-foreground/60">{chaptersCount} {chaptersCount === 1 ? "chapter" : "chapters"}</span>
            {totalVerses > 0 && <>
              <span className="text-[8px] text-muted-foreground/30">·</span>
              <span className="text-[10px] font-semibold text-muted-foreground/60">{totalVerses} verses</span>
            </>}
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all",
          expanded ? "bg-primary/10 text-primary" : "text-muted-foreground/40")}>
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
      </button>
      {/* Chapter grid */}
      <div className={cn("overflow-hidden transition-all duration-300", expanded ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="border-t border-border/20 bg-gradient-to-b from-muted/30 to-muted/10 px-4 sm:px-5 py-4 space-y-3">
          {/* Book Overview teaser */}
          {onBookOverview && (
            <BookOverviewTeaser bookName={bookName} isRtl={isRtl ?? false} onClick={onBookOverview} />
          )}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">{bookName} — Chapters</p>
            <span className="text-[9px] text-muted-foreground/40 font-medium">{chaptersCount} total</span>
          <div className={cn("grid gap-1.5",
            chaptersCount <= 10 ? "grid-cols-5 sm:grid-cols-10" : chaptersCount <= 22 ? "grid-cols-5 sm:grid-cols-11" : "grid-cols-6 sm:grid-cols-12")}>
            {chapters.map((ch) => (
              <button key={ch} onClick={() => onChapterClick(ch)}
                className="relative flex items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold border bg-card text-foreground/80 border-border/40 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-sm active:scale-95 transition-all">
                {ch}
              </button>
            ))}
      </div>
    </div>
  );
