/**
 * SearchResultsCount — displays the number of search results.
 */
interface SearchResultsCountProps {
  total: number;
}

export function SearchResultsCount({ total }: SearchResultsCountProps) {
  return (
    <div className="px-4 sm:px-6 py-2 mb-2">
      <p className="text-xs font-semibold text-muted-foreground">{total} result{total !== 1 ? "s" : ""}</p>
    </div>
  );
}
