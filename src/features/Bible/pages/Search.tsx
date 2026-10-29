// Bible-only search, matching the mobile SearchScreen flow.
"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchPage } from "../hooks/useSearchPage";
import SearchSkeleton from "../components/SearchSkeleton";
import SearchInitialState from "../components/SearchInitialState";
import { tt } from "@/components/languages/hardcodedTranslate";
import {
  BiblePageLayout, SearchHeader, SearchResultsList, SearchNoQuery,
  SearchNoResults, SearchError, ScrollContainer,
} from "../components";

export default function SearchPage() {
  const { data, actions } = useSearchPage();
  const h = { ...data, ...actions };
  return (
    <BiblePageLayout isRtl={h.isRtl} className="flex flex-col">
      <SearchHeader isRtl={h.isRtl} inputRef={h.inputRef} query={h.query}
        onChange={h.handleInputChange} onSubmit={() => h.searchImmediate(h.query)} onClear={h.clearQuery} onBack={h.handleBack}
        translation={h.translation} translations={h.translations} versionLabel={h.versionLabel}
        onTranslationChange={h.setTranslation} versionLoading={h.versionLoading}
        bookName={h.bookName} books={h.books} onBookChange={h.setBookFilter}
        covenant={h.covenant} onCovenantChange={h.setCovenant} />
      <ScrollContainer bottomSpacer={48}>
        <ScrollArea className="h-full">
          {h.searchContext && <p className="px-4 py-2 text-sm text-muted-foreground">{h.searchContext}</p>}
          {h.canSearch && h.total > 0 && <p role="status" className="px-4 py-3 text-sm text-muted-foreground">{h.total} {tt("results")} · <span translate="no">{h.versionLabel}</span></p>}
          {h.versionLoading || h.showSkeleton ? <SearchSkeleton /> : h.hasQuery ? (
            <>
              {!h.canSearch ? <SearchNoQuery minChars /> : <SearchResultsList
                results={h.results} loading={h.loading} hasMore={h.hasMore} loadMore={h.loadMore}
                handleSelect={h.handleSelect} handleStudy={h.handleStudy} handleSave={h.handleSave} handleAddNote={h.handleAddNote}
                versionLabel={h.versionLabel} sectionHeadings={h.sectionHeadings} />}
              {h.canSearch && !h.loading && h.results.length === 0 && h.searchedOnce && !h.searchError && <SearchNoResults query={h.query} />}
            </>
          ) : <SearchInitialState searchHistory={h.searchHistory} popularSearches={h.popularSearches}
            versionName={h.versionName} showSuggestions={h.showSuggestions}
            onHistoryTap={h.handleHistoryTap} onRemoveHistory={h.removeHistoryItem} onClearHistory={h.clearHistory}
            onClearPopular={h.clearPopularSearches} onPopularTap={h.handlePopularTap} onSuggestion={h.handleSuggestion} />}
          {h.searchError && <><SearchError error={h.searchError} /><div className="pb-6 text-center">
            <button type="button" onClick={() => h.error ? h.retry() : h.searchImmediate(h.query)} className="rounded-lg border border-border px-4 py-2 text-sm">{tt("Try again")}</button>
          </div></>}
        </ScrollArea>
      </ScrollContainer>
    </BiblePageLayout>
  );
}
