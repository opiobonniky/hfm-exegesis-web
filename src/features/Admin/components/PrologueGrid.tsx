// PrologueGrid — responsive grid of prologue cards with infinite scroll
import { RefObject } from "react";
import { Loader2 } from "lucide-react";
import { PrologueCard } from "./PrologueCard";

interface PrologueItem {
  id: number;
  bookName: string;
  title?: string;
  content?: string;
  isPublished?: boolean;
  createdOn?: string;
}

interface PrologueGridProps {
  items: PrologueItem[];
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onEdit: (item: PrologueItem) => void;
  onDelete: (item: PrologueItem) => void;
  onView: (item: PrologueItem) => void;
}

export function PrologueGrid({
  items,
  loadingMore,
  hasMore,
  sentinelRef,
  onEdit,
  onDelete,
  onView,
}: PrologueGridProps) {
  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <PrologueCard
            key={item.id}
            item={item}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            onView={() => onView(item)}
          />
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
          All items loaded
        </p>
      )}
    </>
  );
}
