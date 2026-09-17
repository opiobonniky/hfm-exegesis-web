// BibleReaderBody — sidebar + scrollable chapter content + bottom action bar
"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LoadingSkeleton } from "@/components/verseResources";
import type { BibleReaderBodyProps } from "../types";
import BibleSidebar from "./BibleSidebar";
import ChapterContent from "./ChapterContent";
import AudioControlBar from "./AudioControlBar";
import FontSizeControls from "./FontSizeControls";
import VerseMultiSelectBar from "./VerseMultiSelectBar";
import BottomActionBar from "./BottomActionBar";

export default function BibleReaderBody({
  scrollRef,
  fontSize,
  sidebarOpen,
  isRtl,
  books,
  selectedBook,
  selectedChapter,
  booksLoading,
  chapters,
  headingsByChapter,
  audioVerseKey,
  selectedVerses,
  highlights,
  favorites,
  verseNotes,
  verseToolbarHidden,
  chapterRefs,
  verseRefs,
  loading,
  loadError,
  loadingMore,
  hasMore,
  loadMoreRef,
  audioActive,
  audioState,
  audioActions,
  hasSelection,
  selectedVerseCount,
  canGoPrev,
  canGoNext,
  onFontSizeChange,
  onCloseSidebar,
  onSelectChapter,
  onBookOverview,
  onToggleVerse,
  onToggleHighlight,
  onToggleFavorite,
  onExplainVerse,
  onOpenVerseActions,
  onRetryLoad,
  onLoadMore,
  onMultiHighlight,
  onMultiNote,
  onMultiFavorite,
  onMultiCopy,
  onMultiShare,
  onMultiListen,
  onMultiClear,
  onPrev,
  onNext,
  onScrollTop,
  onScrollBottom,
  onBookmark,
  onAudioToggle,
  onMore,

}: BibleReaderBodyProps) {
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {/* Sidebar: absolute overlay */}
      <BibleSidebar
        open={sidebarOpen}
        onClose={onCloseSidebar}
        isRtl={isRtl}
        books={books}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        onSelect={onSelectChapter}
        onBookOverview={onBookOverview}
        loading={booksLoading}
      />

      {/* Content column: flex-col so main scrolls independently */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.035] via-transparent to-accent/[0.025]" />

        {/* ONLY this element scrolls — verses */}
        <main
          ref={scrollRef}
          aria-busy={loading}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-7 [overflow-anchor:none] sm:px-8 sm:py-10 lg:px-12"
        >
          <FontSizeControls
            fontSize={fontSize}
            onFontSizeChange={onFontSizeChange}
            className="sm:hidden mb-4"
          />

          {loading && chapters.length === 0 ? (
            <LoadingSkeleton />
          ) : loadError && chapters.length === 0 ? (
            <div
              role="alert"
              className="min-h-64 flex flex-col items-center justify-center gap-3 text-center"
            >
              <p className="text-sm text-muted-foreground">
                {loadError}
              </p>
              <Button variant="outline" size="sm" onClick={onRetryLoad}>
                Try again
              </Button>
            </div>
          ) : (
            <div style={{ fontSize: `${fontSize}px` }}>
              <ChapterContent
                chapters={chapters}
                headingsByChapter={headingsByChapter}
                audioVerseKey={audioVerseKey}
                selectedVerses={selectedVerses}
                highlights={highlights}
                favorites={favorites}
                verseNotes={verseNotes}
                toolbarHidden={verseToolbarHidden}
                onToggleVerse={onToggleVerse}
                onToggleHighlight={onToggleHighlight}
                onToggleFavorite={onToggleFavorite}
                onExplainVerse={onExplainVerse}
                onOpenVerseActions={onOpenVerseActions}
                chapterRefs={chapterRefs}
                verseRefs={verseRefs}
              />
            </div>
          )}

          <div ref={loadMoreRef} className="h-4" />

          {loadingMore && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more chapters
            </div>
          )}

          {loadError && chapters.length > 0 && (
            <div
              role="alert"
              className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground"
            >
              <span>{loadError}</span>
              <Button variant="outline" size="sm" onClick={onLoadMore}>
                Try again
              </Button>
            </div>
          )}
        </main>

        {/* Bottom bar: fixed height, never scrolls */}
        <div className="shrink-0 ">
          {audioActive ? (
            <AudioControlBar
              audioState={audioState}
              audioActions={audioActions}
              bookName={selectedBook}
              chapter={selectedChapter}
            />
          ) : hasSelection ? (
            <VerseMultiSelectBar
              count={selectedVerseCount}
              onHighlight={onMultiHighlight}
              onNote={onMultiNote}
              onFavorite={onMultiFavorite}
              onCopy={onMultiCopy}
              onShare={onMultiShare}
              onListen={onMultiListen}
              onClear={onMultiClear}
              onMore={onMore}
            />
          ) : (
            <BottomActionBar
              onPrev={onPrev}
              onNext={onNext}
              onScrollTop={onScrollTop}
              onScrollBottom={onScrollBottom}
              onBookmark={onBookmark}
              onAudioToggle={onAudioToggle}
              isAudioPlaying={audioActive}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}
