/**
 * BibleLibraryEmpty — empty state when no books match search.
 */
import { ScrollText } from "lucide-react";

interface BibleLibraryEmptyProps {
  searchQuery: string;
  clearSearch: () => void;
}

export function BibleLibraryEmpty({ searchQuery, clearSearch }: BibleLibraryEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ScrollText className="w-10 h-10 text-muted-foreground/40 mb-4" />
      <h3 className="text-base font-bold text-foreground mb-2">{searchQuery ? `No books for "${searchQuery}"` : "No books available"}</h3>
      {searchQuery && <button onClick={clearSearch} className="mt-4 px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">Clear search</button>}
    </div>
  );
}
