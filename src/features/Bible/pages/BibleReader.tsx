"use client";

import { useBibleReaderPage } from "../hooks/useBibleReaderPage";
import BibleReaderHeader from "../components/BibleReaderHeader";
import ChapterContent from "../components/ChapterContent";
import AudioControlBar from "../components/AudioControlBar";
import FontSizeControls from "../components/FontSizeControls";
import BibleSidebar from "../components/BibleSidebar";
import VerseExplanationDrawer from "../components/VerseExplanationDrawer";
import VerseMultiSelectBar from "../components/VerseMultiSelectBar";
import VerseActionSheet from "../components/VerseActionSheet";
import BottomActionBar from "../components/BottomActionBar";
import { LoadingSkeleton } from "@/components/verseResources";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function BibleReader() {
  const h = useBibleReaderPage();

  return (
    <div
      dir={h.dir}
      className="relative flex h-full flex-col overflow-hidden bg-background"
    >
      {/* ── Header: always visible at top of content area ── */}
      <BibleReaderHeader
        bookName={h.reader.selectedBook}
        chapter={h.reader.selectedChapter}
        audioActive={h.audioActive}
        fontSize={h.fontSize}
        onFontSizeChange={h.updateFontSize}
        onBack={() => h.navigate(-1)}
        onToggleSidebar={() => h.setSidebarOpen(!h.sidebarOpen)}
        onBookOverview={h.handleBookOverview}
        onReadChapter={h.handleReadChapter}
        onToggleSearch={h.handleSearch}
        translations={h.reader.availableTranslations}
        selectedTranslation={h.reader.versionId}
        onSelectTranslation={h.reader.selectTranslation}
        translationOpen={h.translationOpen}
        onTranslationOpenChange={h.setTranslationOpen}
        translationSearch={h.translationSearch}
        onTranslationSearchChange={h.setTranslationSearch}
      />

      {/* ── Body: fills remaining height, no overflow ── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar: absolute overlay */}
        <BibleSidebar
          open={h.sidebarOpen}
          onClose={() => h.setSidebarOpen(false)}
          isRtl={h.isRtl}
          books={h.reader.backendBooks}
          selectedBook={h.reader.selectedBook}
          selectedChapter={h.reader.selectedChapter}
          onSelect={(book, ch) => h.reader.navigateTo(book, ch)}
          onBookOverview={h.handleBookOverview}
          loading={h.reader.booksLoading}
        />

        {/* Content column: flex-col so main scrolls independently */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.035] via-transparent to-accent/[0.025]" />
          {/* ── ONLY this element scrolls — verses ── */}
          <main
            ref={h.scrollRef}
            aria-busy={h.reader.loading}
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-7 [overflow-anchor:none] sm:px-8 sm:py-10 lg:px-12"
          >
            <FontSizeControls
              fontSize={h.fontSize}
              onFontSizeChange={h.updateFontSize}
              className="sm:hidden mb-4"
            />

            {h.reader.loading && h.reader.chapters.length === 0 ? (
              <LoadingSkeleton />
            ) : h.reader.loadError && h.reader.chapters.length === 0 ? (
              <div
                role="alert"
                className="min-h-64 flex flex-col items-center justify-center gap-3 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  {h.reader.loadError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={h.reader.retryLoad}
                >
                  Try again
                </Button>
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
                  onOpenVerseActions={h.handleOpenVerseActions}
                  chapterRefs={h.reader.chapterRefs}
                  verseRefs={h.reader.verseRefs}
                />
              </div>
            )}

            <div ref={h.reader.loadMoreRef} className="h-4" />

            {h.reader.loadingMore && (
              <div
                role="status"
                className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" /> Loading more
                chapters
              </div>
            )}

            {h.reader.loadError && h.reader.chapters.length > 0 && (
              <div
                role="alert"
                className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground"
              >
                <span>{h.reader.loadError}</span>
                <Button variant="outline" size="sm" onClick={h.reader.loadMore}>
                  Try again
                </Button>
              </div>
            )}
          </main>

          {/* ── Bottom bar: fixed height, never scrolls ── */}
          <div className="shrink-0">
            {h.audioActive ? (
              <AudioControlBar
                audio={h.audio}
                bookName={h.reader.selectedBook}
                chapter={h.reader.selectedChapter}
              />
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
            ) : (
              <BottomActionBar
                onPrev={h.handlePrevChapter}
                onNext={h.handleNextChapter}
                onScrollTop={h.scrollToTop}
                onScrollBottom={h.scrollToBottom}
                onBookmark={h.handleBookmark}
                onAudioToggle={h.handleReadChapter}
                isAudioPlaying={h.audioActive}
                canGoPrev={h.canGoPrev}
                canGoNext={h.canGoNext}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Verse explanation drawer (overlay) ── */}
      <VerseExplanationDrawer
        open={h.drawerOpen}
        onClose={() => h.setDrawerOpen(false)}
        bookName={h.drawerVerse.book}
        chapter={h.drawerVerse.chapter}
        verse={h.drawerVerse.verse}
      />

      <VerseActionSheet
        open={h.verseActionsOpen}
        onOpenChange={h.setVerseActionsOpen}
        target={h.verseActionTarget}
        isRtl={h.isRtl}
        onExplain={h.handleActionExplain}
        onStartLab={h.handleActionLab}
        onOpenResources={h.handleActionResources}
        onDevotional={h.handleActionDevotional}
        onStudyTools={h.handleActionStudyTools}
        onStrongs={h.handleActionStrongs}
        onTrivia={h.handleActionTrivia}
        onListen={h.handleActionListen}
        onHighlight={h.handleActionHighlight}
        onNote={h.handleActionNote}
        onJournal={h.handleActionJournal}
        onFavorite={h.handleActionFavorite}
        onSearch={h.handleActionSearch}
        onShare={h.handleActionShare}
        onCopy={h.handleActionCopy}
      />

      {/* ── Note dialog ── */}
      <Dialog open={h.noteDialogOpen} onOpenChange={h.setNoteDialogOpen}>
        <DialogContent className="overflow-hidden border-border/70 p-0 sm:max-w-lg">
          <div className="border-b border-border/60 bg-primary/[0.04] px-6 py-5">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)] text-xl">
                Add a verse note
              </DialogTitle>
              <DialogDescription>
                The note will be saved to every selected verse.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 px-6 py-5">
            <Textarea
              value={h.noteText}
              onChange={(event) => h.setNoteText(event.target.value)}
              placeholder="Write your note..."
              rows={7}
              className="resize-none border-border/70 bg-background text-base leading-relaxed"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => h.setNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={h.handleSaveNote} disabled={!h.noteText.trim()}>
                Save note
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
