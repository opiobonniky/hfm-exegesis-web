"use client";

import { useBibleReaderPage } from "../hooks/useBibleReaderPage";
import BibleReaderHeader from "../components/BibleReaderHeader";
import BibleReaderBody from "../components/BibleReaderBody";
import VerseExplanationDrawer from "../components/VerseExplanationDrawer";
import VerseActionSheet from "../components/VerseActionSheet";
import { EditNoteDialog } from "../components/EditNoteDialog";
import { MultiSelectHighlightDialog } from "../components";
import ApiBaseUrlIndicator from "../components/ApiBaseUrlIndicator";

export default function BibleReader() {
  const { data, actions } = useBibleReaderPage();

  // The toolbar is positioned at z-[70], above every overlay, so it would float
  // in front of any panel that covers the verse it belongs to. Hide it whenever
  // a panel is open — the verse menus, and the sidebar overlay.
  const verseToolbarHidden =
    data.verseActionsOpen ||
    data.drawerOpen ||
    data.noteDialogOpen ||
    data.multiHighlightDialogOpen ||
    data.sidebarOpen;

  return (
    <div
      dir={data.dir}
      className="relative flex h-full flex-col overflow-hidden bg-background"
    >
      <BibleReaderHeader
        bookName={data.selectedBook}
        chapter={data.selectedChapter}
        backLabel={data.backLabel}
        selectBookChapterLabel={data.selectBookChapterLabel}
        searchLabel={data.searchLabel}
        listenLabel={data.listenLabel}
        stopLabel={data.stopLabel}
        isRtl={data.isRtl}
        audioActive={data.audioActive}
        translations={data.availableTranslations}
        selectedTranslationId={data.versionId}
        translationOpen={data.translationOpen}
        translationSearch={data.translationSearch}
        fontSize={data.fontSize}
        onBack={actions.goBack}
        onToggleSidebar={actions.toggleSidebar}
        onBookOverview={actions.openBookOverview}
        onAudioToggle={actions.handleReadChapter}
        onTranslationSelect={actions.selectTranslation}
        onTranslationOpenChange={actions.setTranslationOpen}
        onTranslationSearchChange={actions.setTranslationSearch}
        onFontSizeChange={actions.updateFontSize}
        onSearch={actions.openSearch}
      />
      <BibleReaderBody
        scrollRef={data.scrollRef}
        fontSize={data.fontSize}
        sidebarOpen={data.sidebarOpen}
        isRtl={data.isRtl}
        books={data.backendBooks}
        selectedBook={data.selectedBook}
        selectedChapter={data.selectedChapter}
        booksLoading={data.booksLoading}
        chapters={data.chapters}
        headingsByChapter={data.headingsByChapter}
        audioVerseKey={data.audioVerseKey}
        selectedVerses={data.selectedVerses}
        highlights={data.highlights}
        favorites={data.favorites}
        verseNotes={data.verseNotes}
        verseToolbarHidden={verseToolbarHidden}
        chapterRefs={data.chapterRefs}
        verseRefs={data.verseRefs}
        loading={data.loading}
        loadError={data.loadError}
        loadingMore={data.loadingMore}
        hasMore={data.hasMore}
        loadMoreRef={data.loadMoreRef}
        audioActive={data.audioActive}
        audioState={data.audioState}
        audioActions={actions.audioActions}
        hasSelection={data.hasSelection}
        selectedVerseCount={data.selectedVerseCount}
        canGoPrev={data.canGoPrev}
        canGoNext={data.canGoNext}
        onFontSizeChange={actions.updateFontSize}
        onCloseSidebar={actions.closeSidebar}
        onSelectChapter={actions.navigateToChapter}
        onBookOverview={actions.openBookOverview}
        onToggleVerse={actions.toggleVerse}
        onToggleHighlight={actions.handleToggleHighlight}
        onToggleFavorite={actions.handleToggleFavorite}
        onExplainVerse={actions.handleExplainVerse}
        onOpenVerseActions={actions.handleOpenVerseActions}
        onRetryLoad={actions.retryLoad}
        onLoadMore={actions.loadMore}
        onMultiHighlight={actions.openMultiHighlightDialog}
        onMultiNote={actions.handleOpenNote}
        onMultiFavorite={actions.handleMultiFavorite}
        onMultiCopy={actions.handleCopySelected}
        onMultiShare={actions.handleShareSelected}
        onMultiListen={actions.handleListenSelectedAudio}
        onMultiClear={actions.clearSelection}
        onPrev={actions.handlePrevChapter}
        onNext={actions.handleNextChapter}
        onScrollTop={actions.scrollToTop}
        onScrollBottom={actions.scrollToBottom}
        onBookmark={actions.handleBookmark}
        onAudioToggle={actions.handleReadChapter}
        onMore={()=>actions.setVerseActionsOpen(p=>!p)}
      />
      <VerseExplanationDrawer
        open={data.drawerOpen}
        onClose={actions.closeDrawer}
        bookName={data.drawerBookName}
        chapter={data.drawerChapter}
        verse={data.drawerVerse}
        isRtl={data.isRtl}
        title={data.explanationTitle}
        loadingLabel={data.explanationLoadingLabel}
        closeLabel={data.explanationCloseLabel}
        loading={data.explanationLoading}
        explanation={data.explanation}
      />
      <VerseActionSheet
        open={data.verseActionsOpen}
        onOpenChange={actions.setVerseActionsOpen}
        target={data.verseActionTarget}
        isRtl={data.isRtl}
        labels={data.verseActionLabels}
        onExplain={actions.handleActionExplain}
        onStartLab={actions.handleActionLab}
        onOpenResources={actions.handleActionResources}
        onDevotional={actions.openDevotional}
        onStudyTools={actions.openStudyTools}
        onStrongs={actions.openStrongs}
        onTrivia={actions.openTrivia}
        onListen={actions.handleActionListen}
        onHighlight={actions.handleActionHighlight}
        onNote={actions.handleActionNote}
        onJournal={actions.openJournal}
        onFavorite={actions.handleActionFavorite}
        onSearch={actions.searchVerse}
        onShare={actions.handleActionShare}
        onCopy={actions.handleActionCopy}
      />
      <EditNoteDialog
        open={data.noteDialogOpen}
        mode={data.noteDialogMode}
        verseRef={data.noteDialogVerseRef}
        text={data.noteText}
        saving={data.noteSaving}
        deleting={data.noteDeleting}
        onTextChange={actions.setNoteText}
        onSave={actions.handleSaveNote}
        onClose={actions.closeNoteDialog}
        onDelete={actions.handleDeleteNote}
      />
      <MultiSelectHighlightDialog
        open={data.multiHighlightDialogOpen}
        onOpenChange={(open) =>
          open ? actions.openMultiHighlightDialog() : actions.closeMultiHighlightDialog()
        }
        count={data.selectedVerseCount}
        saving={data.multiHighlightSaving}
        onPick={actions.confirmMultiHighlight}
        onClear={actions.clearMultiHighlights}
      />
      <ApiBaseUrlIndicator
        apiBaseUrl={data.apiBaseUrl}
        visible={import.meta.env.DEV}
      />
    </div>
  );
}
