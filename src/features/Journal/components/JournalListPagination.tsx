import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JournalListPaginationProps {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  isRtl: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function JournalListPagination({ page, totalPages, hasPrevious, hasNext, isRtl, onPrevious, onNext }: JournalListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border dark:border-stone-800">
      <Button variant="outline" disabled={!hasPrevious} onClick={onPrevious} className="rounded-xl border-border dark:border-stone-800">
        <ChevronLeft className={cn("w-4 h-4", isRtl ? "ml-2 order-1" : "mr-2")} />Previous
      </Button>
      <div className="text-sm text-muted-foreground dark:text-muted-foreground/70">Page {page} of {totalPages}</div>
      <Button variant="outline" disabled={!hasNext} onClick={onNext} className="rounded-xl border-border dark:border-stone-800">
        Next<ChevronRight className={cn("w-4 h-4", isRtl ? "mr-2" : "ml-2")} />
      </Button>
    </div>
  );
}
