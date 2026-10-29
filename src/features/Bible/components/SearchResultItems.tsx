import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchResultCard from "./SearchResultCard";
import type { SearchResult } from "@/services/searchApi";
import { tt } from "@/components/languages/hardcodedTranslate";

interface SearchResultsListProps {
  results: SearchResult[];
  sectionHeadings?: Record<string, string>;
  versionLabel: string;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  handleSelect: (result: SearchResult) => void;
  handleStudy: (result: SearchResult) => void;
  handleSave: (result: SearchResult) => void;
  handleAddNote: (result: SearchResult) => void;
}

export function SearchResultsList({ results, loading, hasMore, loadMore, handleSelect, handleStudy, handleSave, handleAddNote, versionLabel, sectionHeadings = {} }: SearchResultsListProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const lastAutoOffset = useRef(-1);
  useEffect(() => {
    if (!hasMore || loading || !sentinel.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && lastAutoOffset.current !== results.length) {
        lastAutoOffset.current = results.length;
        loadMore();
      }
    }, { rootMargin: "150px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, results.length]);
  return (
    <div className="space-y-3 px-4 pb-6 sm:px-6" aria-busy={loading}>
      {results.map(item => <SearchResultCard key={`${item.book_name}-${item.chapter}-${item.verse}`}
        ref_={`${tt(item.book_name)} ${item.chapter}:${item.verse}`} headline={item.headline} verseText={item.verse_text}
        translationAbbr={versionLabel} sectionHeading={sectionHeadings[`${item.book_name}|${item.chapter}|${item.verse}`]}
        onOpen={() => handleSelect(item)} onStudy={() => handleStudy(item)} onSave={() => handleSave(item)} onAddNote={() => handleAddNote(item)} />)}
      {hasMore && <div ref={sentinel} className="flex justify-center pt-2">
        <Button variant="outline" size="sm" onClick={loadMore} disabled={loading} className="gap-2 rounded-xl">
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}{loading ? tt("Loading...") : tt("Load More")}
        </Button>
      </div>}
    </div>
  );
}

export function SearchNoQuery({ minChars }: { minChars?: boolean }) {
  return minChars ? <div className="px-6 py-16 text-center"><p className="text-sm text-muted-foreground">{tt("Type at least 3 characters to search")}</p></div> : null;
}
export function SearchNoResults({ query }: { query: string }) {
  return <div className="px-6 py-16 text-center">
    <p className="mb-1 text-sm font-semibold">{tt("No verses found")}</p>
    <p className="text-xs text-muted-foreground">{query.trim()} — {tt("try a different word or remove the book filter")}</p>
  </div>;
}
export function SearchError({ error }: { error: string }) {
  return <div role="alert" className="px-6 py-8 text-center"><p className="text-sm text-destructive">{error}</p></div>;
}
