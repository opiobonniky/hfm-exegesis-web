// Search — search across bible, journal, topics, and lemmas
"use client";
import { Search, X, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchPage } from "../hooks/useSearchPage";
import SearchResultCard from "../components/SearchResultCard";
import SearchFilters from "../components/SearchFilters";
import SearchSkeleton from "../components/SearchSkeleton";
import SearchInitialState from "../components/SearchInitialState";
import LockedFeatureBadge from "@/components/LockedFeatureBadge";
import type { SearchResult, JournalSearchResult, TopicResult, LemmaResult, CrossTranslationResult } from "@/services/searchApi";

type SearchResultItem = SearchResult | JournalSearchResult | TopicResult | LemmaResult | CrossTranslationResult;

export default function SearchPage() {
  const h = useSearchPage();

  const renderItem = (item: SearchResultItem, idx: number) => {
    if (h.scope === "journal") {
      const j = item as JournalSearchResult;
      return (
        <div key={`journal-${idx}`} className="rounded-xl border border-border/40 bg-card p-4 hover:border-emerald-200/50 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => h.handleSelect({ book_name: "", chapter: 0, verse: 0, verse_text: "" } as any)}>
          <p className="text-sm font-bold text-foreground">{j.title || "Untitled"}</p>
          <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{j.content}</p>
          {j.bookName && <p className="text-xs text-muted-foreground mt-1">{j.bookName} {j.chapter}:{j.verseNumber}</p>}
        </div>
      );
    }
    if (h.scope === "topics") {
      const tp = item as TopicResult;
      return (
        <div key={`topic-${idx}`} className="rounded-xl border border-border/40 bg-card p-4 hover:border-amber-200/50 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => h.handleHistoryTap(tp.topicName)}>
          <p className="text-sm font-bold text-primary capitalize">{tp.topicName}</p>
          {tp.description && <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{tp.description}</p>}
          <p className="text-xs text-muted-foreground mt-1">{tp.verseRefs?.split(",").length || 0} related verses</p>
        </div>
      );
    }
    if (h.scope === "lemma") {
      const lm = item as LemmaResult;
      return (
        <div key={`lemma-${idx}`} className="rounded-xl border border-border/40 bg-card p-4 hover:border-blue-200/50 hover:shadow-sm transition-all">
          <p className="text-sm font-bold text-foreground">{lm.originalWord || lm.strongsId}</p>
          <p className="text-xs font-semibold text-primary mt-0.5">{lm.strongsId} · {lm.transliteration}</p>
          <p className="text-sm text-foreground/70 mt-1">{lm.shortDefinition}</p>
        </div>
      );
    }
    const bi = item as SearchResult | CrossTranslationResult;
    return (
      <SearchResultCard key={`bible-${idx}`}
        ref_={`${bi.book_name} ${bi.chapter}:${(bi as SearchResult).verse ?? (bi as CrossTranslationResult).verse}`}
        headline={(bi as any).headline}
        verseText={bi.verse_text || (bi as CrossTranslationResult).verse_text}
        translationAbbr={(bi as CrossTranslationResult).translationAbbr}
        onOpen={() => h.handleSelect(bi as SearchResult)}
        onStudy={() => h.handleStudy(bi as SearchResult)}
        onSave={() => h.handleSave(bi as SearchResult)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={h.isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Search className="w-4 h-4 text-accent" /></div>
            <h1 className="text-base font-bold tracking-tight text-foreground">Search</h1>
          </div>
        </div>
        <div className="px-4 sm:px-6 pb-3 space-y-3">
          <SearchFilters scope={h.scope} onScopeChange={h.handleScopeChange}
            bookFilter={h.bookName || ""} onBookFilterChange={h.handleBookFilter} books={h.BOOK_NAMES}
            covenant={h.covenant} onCovenantChange={h.handleCovenantChange} locked={h.scopeLocked} />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
            <input ref={h.inputRef} value={h.query} onChange={(e) => h.setQuery(e.target.value, h.scope)}
              placeholder={h.scope === "bible" ? "Search verses, words, phrases..." : h.scope === "journal" ? "Search journal entries..." : h.scope === "topics" ? "Search topics..." : "Search by Greek/Hebrew word..."}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-border/60 bg-background/80 text-sm placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              autoCapitalize="none" autoCorrect="off" autoComplete="off" />
            {h.query.length > 0 && (
              <button onClick={h.clearQuery} className={cn("absolute top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50", h.isRtl ? "left-2.5" : "right-2.5")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {h.scope === "bible" && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
              <Select value={h.translation} onValueChange={h.setTranslation}>
                <SelectTrigger className="h-8 text-xs w-[160px] rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {h.CROSS_TRANSLATION_OPTIONS.map((tr) => (
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

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {h.scopeLocked && (
            <div className="px-4 sm:px-6 py-4"><LockedFeatureBadge featureName="Advanced Search" featureDescription="Upgrade to access advanced search tools." /></div>
          )}
          {!h.scopeLocked && (
            <>
              {h.hasQuery && h.total > 0 && (
                <div className="px-4 sm:px-6 py-2 mb-2"><p className="text-xs font-semibold text-muted-foreground">{h.total} result{h.total !== 1 ? "s" : ""}</p></div>
              )}

              {h.showSkeleton ? (
                <SearchSkeleton />
              ) : h.hasQuery ? (
                <div className="px-4 sm:px-6 pb-6 space-y-3">
                  {h.results.map((item, idx) => renderItem(item, idx))}
                  {h.results.length > 0 && h.total > h.results.length && (
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" size="sm" onClick={h.loadMore} disabled={h.loading} className="gap-2 rounded-xl">
                        {h.loading && <Loader2 className="w-3 h-3 animate-spin" />}{h.loading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                  {h.loading && h.results.length > 0 && (
                    <div className="flex items-center justify-center gap-2 py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-xs text-muted-foreground">Searching...</span></div>
                  )}
                </div>
              ) : (
                <SearchInitialState scope={h.scope} searchHistory={h.searchHistory} popularSearches={h.popularSearches}
                  onHistoryTap={h.handleHistoryTap} onRemoveHistory={h.removeHistoryItem} onClearHistory={h.clearHistory}
                  onPopularTap={h.handlePopularTap} onSuggestion={h.handleSuggestion} />
              )}

              {!h.hasQuery && h.query.trim().length > 0 && h.query.trim().length < 3 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Type at least 3 characters to search</p>
                </div>
              )}

              {h.hasQuery && !h.loading && h.results.length === 0 && h.searchedOnce && !h.searchError && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <p className="text-sm font-semibold text-foreground/70 mb-1">No results found</p>
                  <p className="text-xs text-muted-foreground/60 max-w-xs">No verses match "{h.query}". Try a different word.</p>
                </div>
              )}

              {h.searchError && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center"><p className="text-sm text-destructive">{h.searchError}</p></div>
              )}
            </>
          )}
          <div className="h-12" />
        </ScrollArea>
      </div>
    </div>
  );
}
