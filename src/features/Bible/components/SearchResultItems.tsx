/**
 * SearchResultItems — renders search results based on scope.
 */
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchResultCard from "./SearchResultCard";
import type { SearchResult, JournalSearchResult, TopicResult, LemmaResult, CrossTranslationResult } from "@/services/searchApi";

type SearchResultItem = SearchResult | JournalSearchResult | TopicResult | LemmaResult | CrossTranslationResult;

interface SearchResultsListProps {
  results: SearchResultItem[];
  scope: string;
  total: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  handleSelect: (r: SearchResult) => void;
  handleStudy: (r: SearchResult) => void;
  handleSave: (r: SearchResult) => void;
  handleHistoryTap: (term: string) => void;
}

function JournalItem({ item, idx, onSelect }: { item: JournalSearchResult; idx: number; onSelect: () => void }) {
  return (
    <div key={`journal-${idx}`} className="rounded-xl border border-border/40 bg-card p-4 hover:border-emerald-200/50 hover:shadow-sm transition-all cursor-pointer" onClick={onSelect}>
      <p className="text-sm font-bold text-foreground">{item.title || "Untitled"}</p>
      <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{item.content}</p>
      {item.bookName && <p className="text-xs text-muted-foreground mt-1">{item.bookName} {item.chapter}:{item.verseNumber}</p>}
    </div>
  );
}

function TopicItem({ item, idx, onTap }: { item: TopicResult; idx: number; onTap: () => void }) {
  return (
    <div key={`topic-${idx}`} className="rounded-xl border border-border/40 bg-card p-4 hover:border-amber-200/50 hover:shadow-sm transition-all cursor-pointer" onClick={onTap}>
      <p className="text-sm font-bold text-primary capitalize">{item.topicName}</p>
      {item.description && <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{item.description}</p>}
      <p className="text-xs text-muted-foreground mt-1">{item.verseRefs?.split(",").length || 0} related verses</p>
    </div>
  );
}

function LemmaItem({ item, idx }: { item: LemmaResult; idx: number }) {
  return (
    <div key={`lemma-${idx}`} className="rounded-xl border border-border/40 bg-card p-4 hover:border-blue-200/50 hover:shadow-sm transition-all">
      <p className="text-sm font-bold text-foreground">{item.originalWord || item.strongsId}</p>
      <p className="text-xs font-semibold text-primary mt-0.5">{item.strongsId} · {item.transliteration}</p>
      <p className="text-sm text-foreground/70 mt-1">{item.shortDefinition}</p>
    </div>
  );
}

export function SearchResultsList({ results, scope, total, loading, hasMore, loadMore, handleSelect, handleStudy, handleSave, handleHistoryTap }: SearchResultsListProps) {
  return (
    <div className="px-4 sm:px-6 pb-6 space-y-3">
      {results.map((item, idx) => {
        if (scope === "journal") return <JournalItem key={`journal-${idx}`} item={item as JournalSearchResult} idx={idx} onSelect={() => handleSelect({ book_name: "", chapter: 0, verse: 0, verse_text: "" } as any)} />;
        if (scope === "topics") return <TopicItem key={`topic-${idx}`} item={item as TopicResult} idx={idx} onTap={() => handleHistoryTap((item as TopicResult).topicName)} />;
        if (scope === "lemma") return <LemmaItem key={`lemma-${idx}`} item={item as LemmaResult} idx={idx} />;
        const bi = item as SearchResult | CrossTranslationResult;
        return (
          <SearchResultCard key={`bible-${idx}`}
            ref_={`${bi.book_name} ${bi.chapter}:${(bi as SearchResult).verse ?? (bi as CrossTranslationResult).verse}`}
            headline={(bi as any).headline}
            verseText={bi.verse_text || (bi as CrossTranslationResult).verse_text}
            translationAbbr={(bi as CrossTranslationResult).translationAbbr}
            onOpen={() => handleSelect(bi as SearchResult)}
            onStudy={() => handleStudy(bi as SearchResult)}
            onSave={() => handleSave(bi as SearchResult)}
          />
        );
      })}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loading} className="gap-2 rounded-xl">
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}{loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
      {loading && results.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-xs text-muted-foreground">Searching...</span></div>
      )}
    </div>
  );
}

export function SearchNoQuery({ minChars }: { minChars?: boolean }) {
  if (!minChars) return null;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <p className="text-sm text-muted-foreground">Type at least 3 characters to search</p>
    </div>
  );
}

export function SearchNoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <p className="text-sm font-semibold text-foreground/70 mb-1">No results found</p>
      <p className="text-xs text-muted-foreground/60 max-w-xs">No verses match "{query}". Try a different word.</p>
    </div>
  );
}

export function SearchError({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <p className="text-sm text-destructive">{error}</p>
    </div>
  );
}
