// PaginationControls — simple page navigation controls
interface Props {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, total, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
      <p className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="h-7 w-7 rounded-md border border-input bg-background text-xs disabled:opacity-50"
        >
          ←
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={(page + 1) * pageSize >= total}
          className="h-7 w-7 rounded-md border border-input bg-background text-xs disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
}
