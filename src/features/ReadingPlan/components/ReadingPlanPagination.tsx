import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  setPage: (v: number) => void;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  t: any;
}

export function ReadingPlanPagination({ page, setPage, totalPages, hasNext, hasPrevious, t }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevious}
        onClick={() => setPage(page - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted-foreground font-medium">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => setPage(page + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
