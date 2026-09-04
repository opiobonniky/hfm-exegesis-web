"use client";

// BibleLibrary — book browser with search and chapter navigation
import { useBibleLibrary } from "../hooks/useBibleLibrary";
import {
  BiblePageLayout, BibleLibraryHeader, BibleLibraryEmpty, BibleLibraryLoading, BibleLibraryFooter, BibleBookList,
} from "../components";

const IS_DEV = import.meta.env.DEV;

export default function BibleLibrary() {
  const h = useBibleLibrary();

  if (h.loading) return <BibleLibraryLoading />;

  return (
    <BiblePageLayout isRtl={h.isRtl} className="bg-gradient-to-b from-background via-background to-muted/20">
      <BibleLibraryHeader
        stats={h.stats}
        searchRef={h.searchRef}
        searchQuery={h.searchQuery}
        setSearchQuery={h.setSearchQuery}
        clearSearch={h.clearSearch}
        tabs={h.tabs}
        covenant={h.covenant}
        selectCovenant={h.selectCovenant}
      />

      {/* Graceful fallback + dev-only backend indicator */}
      {h.loadError ? (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-3">
          <div
            role="alert"
            className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            {h.loadError} Showing the standard list until the server is reachable.
          </div>
        </div>
      ) : IS_DEV ? (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-3">
          <p className="text-[11px] text-muted-foreground">
            Backend: <code className="rounded bg-muted px-1 py-0.5">{h.apiBaseUrl}</code>
          </p>
        </div>
      ) : null}

      <div className="px-4 sm:px-6 py-4 pb-24 max-w-4xl mx-auto">
        {h.filteredBooks.length === 0 ? (
          <BibleLibraryEmpty searchQuery={h.searchQuery} clearSearch={h.clearSearch} />
        ) : (
          <BibleBookList
            books={h.filteredBooks}
            expandedBook={h.expandedBook}
            isRtl={h.isRtl}
            onToggle={h.toggleExpand}
            onChapterClick={h.goToChapter}
            onBookOverview={h.goToBookOverview}
          />
        )}

        {h.filteredBooks.length > 0 && (
          <BibleLibraryFooter filteredCount={h.filteredBooks.length} totalCount={h.books.length} />
        )}
      </div>
    </BiblePageLayout>
  );
}
