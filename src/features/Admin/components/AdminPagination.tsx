// AdminPagination — reusable pagination with previous/next and page info
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}
export function AdminPagination({ page, totalPages, total, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
      <p className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
        {total !== undefined && ` · ${total} total`}
      </p>
      <div className="flex gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
