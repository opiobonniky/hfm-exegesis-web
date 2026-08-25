import { Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getVerseText } from "@/utilities/bibleUtils";
import { formatShortDate, isToday, isFuture } from "../constants";
import type { DailyVerseItem } from "../types";

interface Props {
  verses: DailyVerseItem[];
  selectedIndex: number;
  isAdmin: boolean;
  isFiltered: boolean;
  onSelect: (index: number) => void;
  onView: (verse: DailyVerseItem) => void;
  onEdit: (verse: DailyVerseItem) => void;
  onDelete: (verse: DailyVerseItem) => void;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}

export default function DailyVerseGrid({
  verses, selectedIndex, isAdmin, isFiltered, onSelect,
  onView, onEdit, onDelete, page, totalPages, hasNext, hasPrevious, onPageChange,
}: Props) {
  if (verses.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">
        {isFiltered ? "Filtered Verses" : "Verse Window"}
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {verses.map((verse, index) => {
          const prev = verses[index - 1];
          const insertDivider =
            !isFiltered && index > 0 && isFuture(prev?.displayDate) && !isFuture(verse.displayDate);
          return (
            <div key={verse.id} className="contents">
              {insertDivider && (
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 py-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Today & Past
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div
                className={cn(
                  "border border-border rounded-xl p-4 cursor-pointer transition-all",
                  selectedIndex === index
                    ? "ring-2 ring-primary bg-primary/[0.03]"
                    : "hover:bg-muted/50",
                  isFuture(verse.displayDate) && "border-primary/20 bg-primary/[0.02]",
                )}
                onClick={() => onSelect(index)}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={isToday(verse.displayDate) ? "default" : "secondary"}
                      className={cn(
                        "text-[10px]",
                        isFuture(verse.displayDate) && "border-primary/40 text-primary bg-primary/10",
                      )}
                    >
                      {formatShortDate(verse.displayDate)}
                    </Badge>
                    {isFuture(verse.displayDate) && (
                      <span className="text-[10px] font-semibold text-primary">Upcoming</span>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onView(verse); }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(verse); }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(verse); }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p
                  className="text-sm font-serif leading-relaxed line-clamp-2 mb-1.5 text-foreground/85"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  &ldquo;{verse.verseText || getVerseText(verse.bookName, verse.chapter, verse.verseNumber)}&rdquo;
                </p>
                <p className="text-xs font-medium text-primary">
                  {verse.bookName} {verse.chapter}:{verse.verseNumber}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
