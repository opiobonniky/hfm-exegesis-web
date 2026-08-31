// ExegesisGrid — renders exegesis cards in a responsive grid with infinite scroll
import { RefObject } from "react";
import { Loader2 } from "lucide-react";
import { ExegesisCard } from "./ExegesisCard";
import type { DailyExegesis } from "../types";

interface ExegesisGridProps {
  items: DailyExegesis[];
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onEdit: (item: DailyExegesis) => void;
  onDelete: (item: DailyExegesis) => void;
}

export function ExegesisGrid({
  items,
  loadingMore,
  hasMore,
  sentinelRef,
  onEdit,
  onDelete,
}: ExegesisGridProps) {
  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ExegesisCard
            key={item.id}
            id={item.id}
            title={item.title}
            passageReference={item.passageReference}
            displayDate={item.displayDate}
            teachingBody={item.teachingBody}
            isPublished={item.isPublished}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
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
          All exegeses loaded
        </p>
      )}
    </>
  );
}
