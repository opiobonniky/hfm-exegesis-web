/**
 * SearchHeader — sticky header for Search page with scope selector and input.
 */
import { Search as SearchIcon, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchFilters from "./SearchFilters";
import type { SearchScope } from "@/services/searchApi";

interface SearchHeaderProps {
  isRtl: boolean;
  scope: SearchScope;
  handleScopeChange: (s: SearchScope) => void;
  handleBookFilter: (b: string) => void;
  bookName: string;
  BOOK_NAMES: string[];
  covenant: "all" | "ot" | "nt";
  handleCovenantChange: (c: "all" | "ot" | "nt") => void;
  scopeLocked: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (q: string, scope?: SearchScope) => void;
  clearQuery: () => void;
  translation: string;
  setTranslation: (t: string) => void;
  CROSS_TRANSLATION_OPTIONS: Array<{ id: string; abbr: string; name: string }>;
}

export function SearchHeader({
  isRtl, scope, handleScopeChange, handleBookFilter, bookName, BOOK_NAMES,
  covenant, handleCovenantChange, scopeLocked, inputRef, query, setQuery, clearQuery,
  translation, setTranslation, CROSS_TRANSLATION_OPTIONS,
}: SearchHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><SearchIcon className="w-4 h-4 text-accent" /></div>
          <h1 className="text-base font-bold tracking-tight text-foreground">Search</h1>
        </div>
      </div>
      <div className="px-4 sm:px-6 pb-3 space-y-3">
        <SearchFilters scope={scope} onScopeChange={handleScopeChange}
          bookFilter={bookName || ""} onBookFilterChange={handleBookFilter} books={BOOK_NAMES}
          covenant={covenant} onCovenantChange={handleCovenantChange} locked={scopeLocked} />
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value, scope)}
            placeholder={scope === "bible" ? "Search verses, words, phrases..." : scope === "journal" ? "Search journal entries..." : scope === "topics" ? "Search topics..." : "Search by Greek/Hebrew word..."}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border/60 bg-background/80 text-sm placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            autoCapitalize="none" autoCorrect="off" autoComplete="off" />
          {query.length > 0 && (
            <button onClick={clearQuery} className={cn("absolute top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50", isRtl ? "left-2.5" : "right-2.5")}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {scope === "bible" && (
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
            <Select value={translation} onValueChange={setTranslation}>
              <SelectTrigger className="h-8 text-xs w-[160px] rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CROSS_TRANSLATION_OPTIONS.map((tr) => (
                  <SelectItem key={tr.id} value={tr.id} className="text-xs py-1.5">
                    <span className="font-semibold">{tr.abbr}</span> <span className="text-muted-foreground/60 text-[10px]">{tr.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </header>
  );
}
