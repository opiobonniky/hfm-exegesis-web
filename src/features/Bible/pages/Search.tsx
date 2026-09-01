// Search — search across bible, journal, topics, and lemmas
"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchPage } from "../hooks/useSearchPage";
import SearchSkeleton from "../components/SearchSkeleton";
import SearchInitialState from "../components/SearchInitialState";
import {
  BiblePageLayout, SearchHeader, SearchResultsList, SearchNoQuery, SearchNoResults, SearchError,
  SearchLockedBadge, SearchResultsCount, ScrollContainer,
} from "../components";

export default function SearchPage() {
  const h = useSearchPage();

  return (
    <BiblePageLayout isRtl={h.isRtl} className="flex flex-col">
      <SearchHeader
        isRtl={h.isRtl} scope={h.scope} handleScopeChange={h.handleScopeChange}
        handleBookFilter={h.handleBookFilter} bookName={h.bookName || ""} BOOK_NAMES={h.BOOK_NAMES}
        covenant={h.covenant} handleCovenantChange={h.handleCovenantChange} scopeLocked={h.scopeLocked}
        inputRef={h.inputRef} query={h.query} setQuery={h.setQuery} clearQuery={h.clearQuery}
        translation={h.translation} setTranslation={h.setTranslation} CROSS_TRANSLATION_OPTIONS={h.CROSS_TRANSLATION_OPTIONS}
      />

      <ScrollContainer bottomSpacer={48}>
        <ScrollArea className="h-full">
          {h.scopeLocked && (
            <SearchLockedBadge featureName="Advanced Search" featureDescription="Upgrade to access advanced search tools." />
          )}
          {!h.scopeLocked && (
            <>
              {h.hasQuery && h.total > 0 && <SearchResultsCount total={h.total} />}

              {h.showSkeleton ? (
                <SearchSkeleton />
              ) : h.hasQuery ? (
                <SearchResultsList
                  results={h.results} scope={h.scope} total={h.total} loading={h.loading}
                  hasMore={h.results.length > 0 && h.total > h.results.length} loadMore={h.loadMore}
                  handleSelect={h.handleSelect} handleStudy={h.handleStudy} handleSave={h.handleSave}
                  handleHistoryTap={h.handleHistoryTap}
                />
              ) : (
                <SearchInitialState scope={h.scope} searchHistory={h.searchHistory} popularSearches={h.popularSearches}
                  onHistoryTap={h.handleHistoryTap} onRemoveHistory={h.removeHistoryItem} onClearHistory={h.clearHistory}
                  onPopularTap={h.handlePopularTap} onSuggestion={h.handleSuggestion} />
              )}

              {!h.hasQuery && h.query.trim().length > 0 && h.query.trim().length < 3 && <SearchNoQuery minChars />}
              {h.hasQuery && !h.loading && h.results.length === 0 && h.searchedOnce && !h.searchError && <SearchNoResults query={h.query} />}
              {h.searchError && <SearchError error={h.searchError} />}
            </>
          )}
        </ScrollArea>
      </ScrollContainer>
    </BiblePageLayout>
  );
}
