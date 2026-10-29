import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { Covenant } from "@/hooks/useSearch";

interface SearchFiltersProps {
  bookFilter: string;
  onBookFilterChange: (book: string) => void;
  books: string[];
  covenant: Covenant;
  onCovenantChange: (covenant: Covenant) => void;
}
export default function SearchFilters({ bookFilter, onBookFilterChange, books, covenant, onCovenantChange }: SearchFiltersProps) {
  return (
    <>
      <div className="flex gap-1 rounded-lg bg-muted p-0.5" role="group" aria-label={tt("Testament")}>
        {([['all', 'All'], ['ot', 'Old Testament'], ['nt', 'New Testament']] as const).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={covenant === value} onClick={() => onCovenantChange(value)}
            className={cn("rounded-md px-2.5 py-1.5 text-xs font-semibold", covenant === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            {tt(label)}
          </button>
        ))}
      </div>
      <select aria-label={tt("Filter books")} value={bookFilter} onChange={event => onBookFilterChange(event.target.value)}
        className="h-9 min-w-32 flex-1 rounded-lg border border-border bg-background px-2 text-xs text-foreground">
        <option value="">{tt("All Books")}</option>
        {books.map(book => <option key={book} value={book}>{tt(book)}</option>)}
      </select>
    </>
  );
}
