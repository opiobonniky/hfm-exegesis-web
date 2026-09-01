/**
 * DailyDevotionsPagination — page navigation for devotions list.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DevotionPaginationProps, DevotionPaginationLabels } from "../types";

export function DailyDevotionsPagination({
  page,
  totalPages,
  total,
  hasNext,
  hasPrevious,
  onPageChange,
  labels,
}: DevotionPaginationProps & { labels: DevotionPaginationLabels }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        {labels.page} {page + 1} {labels.of} {totalPages} ({total} {labels.results})
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
