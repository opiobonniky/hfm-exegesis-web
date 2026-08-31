// BibleReaderBody — sidebar + scrollable chapter content + bottom action bar
"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LoadingSkeleton } from "@/components/verseResources";
import BibleSidebar from "./BibleSidebar";
import ChapterContent from "./ChapterContent";
import AudioControlBar from "./AudioControlBar";
import FontSizeControls from "./FontSizeControls";
import VerseMultiSelectBar from "./VerseMultiSelectBar";
import BottomActionBar from "./BottomActionBar";

/* ─── Sidebar Props ──────────────────────────────────────────────────────── */
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isRtl: boolean;
  books: any[];
  selectedBook: string;
  selectedChapter: number;
  onSelect: (book: string, chapter: number) => void;
  onBookOverview: () => void;
  loading: boolean;
}

/* ─── Chapter Props ──────────────────────────────────────────────────────── */
interface ChapterProps {
  chapters: any[];
  selectedVerses: string[];
  highlights: Record<string, any>;
  favorites: Set<string>;
  verseNotes: Record<string, string>;
  onToggleVerse: (key: string) => void;
  onToggleHighlight: (book: string, chapter: number, verse: number, colorId: number) => void;
  onToggleFavorite: (book: string, chapter: number, verse: number) => void;
  onExplainVerse: (book: string, chapter: number, verse: number) => void;
  onOpenVerseActions: (book: string, chapter: number, verse: number) => void;
  chapterRefs: RefObject<Record<string, HTMLElement>>;
  verseRefs: RefObject<Record<string, HTMLElement>>;
}

/* ─── Loading/Error Props ────────────────────────────────────────────────── */
interface LoadingProps {
  loading: boolean;
  loadError: string | null;
  loadingMore: boolean;
  hasMore: boolean;
  onRetryLoad: () => void;
  onLoadMore: () => void;
  loadMoreRef: RefObject<HTMLDivElement>;
}

/* ─── Bottom Bar Props ───────────────────────────────────────────────────── */
interface BottomBarProps {
  audioActive: boolean;
  audio: any;
  selectedBook: string;
  selectedChapter: number;
  hasSelection: boolean;
  selectedVerseCount: number;
  onMultiHighlight: () => void;
  onMultiNote: () => void;
  onMultiFavorite: () => void;
  onMultiCopy: () => void;
  onMultiShare: () => void;
  onMultiListen: () => void;
  onMultiClear: () => void;
  onPrev: () => void;
  onNext: () => void;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  onBookmark: () => void;
  onAudioToggle: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/* ─── Main Props ─────────────────────────────────────────────────────────── */
interface BibleReaderBodyProps {
  sidebar: SidebarProps;
  chapter: ChapterProps;
  loading: LoadingProps;
  bottomBar: BottomBarProps;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  scrollRef: RefObject<HTMLDivElement>;
}

export default function BibleReaderBody({
  sidebar,
  chapter,
  loading,
  bottomBar,
  fontSize,
  onFontSizeChange,
  scrollRef,
}: BibleReaderBodyProps) {
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {/* Sidebar: absolute overlay */}
      <BibleSidebar {...sidebar} onSelect={(book, ch) => sidebar.onSelect(book, ch)} />

      {/* Content column: flex-col so main scrolls independently */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.035] via-transparent to-accent/[0.025]" />

        {/* ONLY this element scrolls — verses */}
        <main
          ref={scrollRef}
          aria-busy={loading.loading}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-7 [overflow-anchor:none] sm:px-8 sm:py-10 lg:px-12"
        >
          <FontSizeControls
            fontSize={fontSize}
            onFontSizeChange={onFontSizeChange}
            className="sm:hidden mb-4"
          />

          {loading.loading && chapter.chapters.length === 0 ? (
            <LoadingSkeleton />
          ) : loading.loadError && chapter.chapters.length === 0 ? (
            <div
              role="alert"
              className="min-h-64 flex flex-col items-center justify-center gap-3 text-center"
            >
              <p className="text-sm text-muted-foreground">{loading.loadError}</p>
              <Button variant="outline" size="sm" onClick={loading.onRetryLoad}>
                Try again
              </Button>
            </div>
          ) : (
            <div style={{ fontSize: `${fontSize}px` }}>
              <ChapterContent
                chapters={chapter.chapters}
                selectedVerses={chapter.selectedVerses}
                highlights={chapter.highlights}
                favorites={chapter.favorites}
                verseNotes={chapter.verseNotes}
                onToggleVerse={chapter.onToggleVerse}
                onToggleHighlight={chapter.onToggleHighlight}
                onToggleFavorite={chapter.onToggleFavorite}
                onExplainVerse={chapter.onExplainVerse}
                onOpenVerseActions={chapter.onOpenVerseActions}
                chapterRefs={chapter.chapterRefs}
                verseRefs={chapter.verseRefs}
              />
            </div>
          )}

          <div ref={loading.loadMoreRef} className="h-4" />

          {loading.loadingMore && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more chapters
            </div>
          )}

          {loading.loadError && chapter.chapters.length > 0 && (
            <div
              role="alert"
              className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground"
            >
              <span>{loading.loadError}</span>
              <Button variant="outline" size="sm" onClick={loading.onLoadMore}>
                Try again
              </Button>
            </div>
          )}
        </main>

        {/* Bottom bar: fixed height, never scrolls */}
        <div className="shrink-0">
          {bottomBar.audioActive ? (
            <AudioControlBar
              audio={bottomBar.audio}
              bookName={bottomBar.selectedBook}
              chapter={bottomBar.selectedChapter}
            />
          ) : bottomBar.hasSelection ? (
            <VerseMultiSelectBar
              count={bottomBar.selectedVerseCount}
              onHighlight={bottomBar.onMultiHighlight}
              onNote={bottomBar.onMultiNote}
              onFavorite={bottomBar.onMultiFavorite}
              onCopy={bottomBar.onMultiCopy}
              onShare={bottomBar.onMultiShare}
              onListen={bottomBar.onMultiListen}
              onClear={bottomBar.onMultiClear}
            />
          ) : (
            <BottomActionBar
              onPrev={bottomBar.onPrev}
              onNext={bottomBar.onNext}
              onScrollTop={bottomBar.onScrollTop}
              onScrollBottom={bottomBar.onScrollBottom}
              onBookmark={bottomBar.onBookmark}
              onAudioToggle={bottomBar.onAudioToggle}
              isAudioPlaying={bottomBar.audioActive}
              canGoPrev={bottomBar.canGoPrev}
              canGoNext={bottomBar.canGoNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}
