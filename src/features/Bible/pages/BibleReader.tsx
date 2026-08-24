"use client";

import { useBibleReaderPage } from "../hooks/useBibleReaderPage";
import BibleReaderHeader from "../components/BibleReaderHeader";
import ChapterContent from "../components/ChapterContent";
import AudioControlBar from "../components/AudioControlBar";
import FontSizeControls from "../components/FontSizeControls";
import BibleSidebar from "../components/BibleSidebar";
import VerseExplanationDrawer from "../components/VerseExplanationDrawer";
import VerseMultiSelectBar from "../components/VerseMultiSelectBar";
import BottomActionBar from "../components/BottomActionBar";
import { LoadingSkeleton } from "@/components/verseResources";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
export default function BibleReader() {
  const h = useBibleReaderPage();
  return (
    /*
     * h-full fills the AppLayout content area.
     * overflow-hidden prevents the parent's overflow-auto from scrolling.
     * The AppLayout header (sticky, z-50) stays visible above.
     * Only <main> (overflow-y-auto) scrolls the verses.
     */
    <div
      dir={h.dir}
      className="h-full bg-background flex flex-col overflow-hidden"
    >
      {/* ── Header: always visible at top of content area ── */}
      <BibleReaderHeader
        bookName={h.reader.selectedBook} chapter={h.reader.selectedChapter}
        audioActive={h.audioActive} fontSize={h.fontSize} onFontSizeChange={h.updateFontSize}
        onBack={() => h.navigate(-1)} onToggleSidebar={() => h.setSidebarOpen(!h.sidebarOpen)} onBookOverview={h.handleBookOverview}
        onReadChapter={h.handleReadChapter} onToggleSearch={h.handleSearch}
        translations={h.reader.availableTranslations} selectedTranslation={h.reader.versionId}
        onSelectTranslation={h.reader.selectTranslation}
        translationOpen={h.translationOpen} onTranslationOpenChange={h.setTranslationOpen}
        translationSearch={h.translationSearch} onTranslationSearchChange={h.setTranslationSearch}
      />
      {/* ── Body: fills remaining height, no overflow ── */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Sidebar: absolute overlay */}
        <BibleSidebar
          open={h.sidebarOpen} onClose={() => h.setSidebarOpen(false)} isRtl={h.isRtl}
          books={h.reader.backendBooks} selectedBook={h.reader.selectedBook} selectedChapter={h.reader.selectedChapter}
          onSelect={(book, ch) => h.reader.navigateTo(book, ch)} onBookOverview={h.handleBookOverview} loading={h.reader.booksLoading}
        />
        {/* Content column: flex-col so main scrolls independently */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* ── ONLY this element scrolls — verses ── */}
          <main
            ref={h.scrollRef}
            aria-busy={h.reader.loading}
            className="flex-1 overflow-y-auto [overflow-anchor:none] min-h-0 overscroll-contain px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
          >
            <FontSizeControls fontSize={h.fontSize} onFontSizeChange={h.updateFontSize} className="sm:hidden mb-4" />
            {h.reader.loading && h.reader.chapters.length === 0 ? (
              <LoadingSkeleton />
            ) : h.reader.loadError && h.reader.chapters.length === 0 ? (
              <div role="alert" className="min-h-64 flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">{h.reader.loadError}</p>
                <Button variant="outline" size="sm" onClick={h.reader.retryLoad}>Try again</Button>
              </div>
            ) : (
              <div style={{ fontSize: `${h.fontSize}px` }}>
                <ChapterContent
                  chapters={h.reader.chapters}
                  selectedVerses={h.reader.selectedVerses}
                  highlights={h.reader.highlights}
                  favorites={h.reader.favorites}
                  verseNotes={h.reader.verseNotes}
                  onToggleVerse={h.reader.toggleVerse}
                  onToggleHighlight={h.handleToggleHighlight}
                  onToggleFavorite={h.handleToggleFavorite}
                  onExplainVerse={h.handleExplainVerse}
                  chapterRefs={h.reader.chapterRefs}
                  verseRefs={h.reader.verseRefs}
                />
            )}
            <div ref={h.reader.loadMoreRef} className="h-4" />
            {h.reader.loadingMore && (
              <div role="status" className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading more chapters
            {h.reader.loadError && h.reader.chapters.length > 0 && (
              <div role="alert" className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
                <span>{h.reader.loadError}</span>
                <Button variant="outline" size="sm" onClick={h.reader.loadMore}>Try again</Button>
          </main>
          {/* ── Bottom bar: fixed height, never scrolls ── */}
          <div className="shrink-0">
            {h.audioActive ? (
              <AudioControlBar audio={h.audio} bookName={h.reader.selectedBook} chapter={h.reader.selectedChapter} />
            ) : h.hasSelection ? (
              <VerseMultiSelectBar
                count={h.reader.selectedVerses.length}
                onHighlight={h.handleMultiHighlight}
                onNote={h.handleOpenNote}
                onFavorite={h.handleMultiFavorite}
                onCopy={h.handleCopySelected}
                onShare={h.handleShareSelected}
                onListen={h.handleListenSelected}
                onClear={h.handleMultiClear}
              />
              <BottomActionBar
                onPrev={h.handlePrevChapter} onNext={h.handleNextChapter}
                onScrollTop={h.scrollToTop} onScrollBottom={h.scrollToBottom}
                onBookmark={h.handleBookmark}
                onAudioToggle={h.handleReadChapter}
                isAudioPlaying={h.audioActive}
                canGoPrev={h.canGoPrev}
                canGoNext={h.canGoNext}
          </div>
        </div>
      </div>
      {/* ── Verse explanation drawer (overlay) ── */}
      <VerseExplanationDrawer
        open={h.drawerOpen} onClose={() => h.setDrawerOpen(false)}
        bookName={h.drawerVerse.book} chapter={h.drawerVerse.chapter} verse={h.drawerVerse.verse}
      <Dialog open={h.noteDialogOpen} onOpenChange={h.setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a verse note</DialogTitle>
            <DialogDescription>The note will be saved to every selected verse.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={h.noteText}
            onChange={(event) => h.setNoteText(event.target.value)}
            placeholder="Write your note..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={h.handleSaveNote} disabled={!h.noteText.trim()}>Save note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
