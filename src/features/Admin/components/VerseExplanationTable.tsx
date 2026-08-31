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
      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Reference</th>
              <th className="text-left p-3 text-sm font-medium">Explanation</th>
              <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">
                Learn More
              </th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="p-3">
                  <div className="font-medium">
                    {item.bookName} {item.chapter}:{item.verseNumber}
                  </div>
                </td>
                <td className="p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.explanation}
                  </p>
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.learnMore || "—"}
                  </p>
                </td>
                <td className="p-3">
                  <Badge variant={item.isPublished ? "default" : "secondary"}>
                    {item.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(item)} title="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
