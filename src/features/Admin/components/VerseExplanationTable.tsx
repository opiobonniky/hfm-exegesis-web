// VerseExplanationTable — responsive table (desktop) / card list (mobile) with infinite scroll
import { RefObject } from "react";
import { Trash2, Edit2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VerseExplanationItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore?: string;
  isPublished: boolean;
  bibleVersion?: string;
  createdOn?: string | null;
}

interface VerseExplanationTableProps {
  items: VerseExplanationItem[];
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onView: (item: VerseExplanationItem) => void;
  onEdit: (item: VerseExplanationItem) => void;
  onDelete: (item: VerseExplanationItem) => void;
}

export function VerseExplanationTable({
  items,
  loadingMore,
  hasMore,
  sentinelRef,
  onView,
  onEdit,
  onDelete,
}: VerseExplanationTableProps) {
  return (
    <>
      {/* Desktop card grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-xl p-4 bg-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{item.bookName} {item.chapter}:{item.verseNumber}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.bibleVersion || 'BSB'}</div>
                </div>
                <Badge variant={item.isPublished ? 'default' : 'secondary'} className="text-[10px]">{item.isPublished ? 'Published' : 'Draft'}</Badge>
              </div>

              <div className="mt-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{item.explanation || 'No explanation provided.'}</p>
              </div>

              <div className="mt-3">
                <h4 className="text-xs uppercase text-muted-foreground font-medium">Learn More</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.learnMore || '—'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => onView(item)} title="View">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(item)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border rounded-xl p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">
                  {item.bookName} {item.chapter}:{item.verseNumber}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {item.explanation}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{item.bibleVersion || "BSB"} • {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : ""}</p>
              </div>
              <Badge
                variant={item.isPublished ? "default" : "secondary"}
                className="text-[10px] shrink-0"
              >
                {item.isPublished ? "Pub" : "Draft"}
              </Badge>
            </div>
            <div
              className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onView(item)}
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(item)}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          All explanations loaded
        </p>
      )}
    </>
  );
}
