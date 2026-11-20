import { tt } from '@/components/languages/hardcodedTranslate';
// PaginationControls — simple page navigation controls
interface Props {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function PaginationControls({ page, total, pageSize, onPageChange, disabled }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={tt("Pagination")} className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
      <p className="text-xs text-muted-foreground" aria-live="polite">{tt("Page")} {page + 1} {tt("of")} {totalPages}
      </p>
      <div className="flex gap-1">
        <button
          type="button" aria-label={tt("Previous page")}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 0}
          className="h-7 w-7 rounded-md border border-input bg-background text-xs disabled:opacity-50"
        >
          ←
        </button>
        <button
          type="button" aria-label={tt("Next page")}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || (page + 1) * pageSize >= total}
          className="h-7 w-7 rounded-md border border-input bg-background text-xs disabled:opacity-50"
        >
          →
        </button>
      </div>
    </nav>
  );
}
