import { useLabDictionaryPage } from "../hooks";
import WordDetailSheet from "@/components/WordDetailSheet";
import WordStudyDialog from "@/components/WordStudyDialog";
import { 
  LabBrowsePanel, LabDictionaryHeader, LabDictionaryWorkspace, 
  LabModeTabs, LabSearchPanel, LabVersePanel, LabPageWrapper 
} from "../components";

export default function LabDictionary() {
  const p = useLabDictionaryPage();

  return (
    <LabPageWrapper>
      <LabDictionaryHeader onGoBack={p.goBack} />
      <LabDictionaryWorkspace>
        <LabModeTabs mode={p.mode} onModeChange={p.setMode} />
        {p.mode === "search" ? (
          <LabSearchPanel
            searchQuery={p.searchQuery}
            onSearchQueryChange={p.setSearchQuery}
            results={p.results}
            loading={p.loading}
            searched={p.searched}
            resultTotal={p.resultTotal}
            searchLangCounts={p.searchLangCounts}
            onWordClick={p.openWordDetailById}
          />
        ) : p.mode === "verse" ? (
          <LabVersePanel
            verseBook={p.verseBook}
            onVerseBookChange={p.setVerseBook}
            verseChapter={p.verseChapter}
            onVerseChapterChange={p.setVerseChapter}
            verseNum={p.verseNum}
            onVerseNumChange={p.setVerseNum}
            verseWordsLoading={p.verseWordsLoading}
            verseWordsLoaded={p.verseWordsLoaded}
            verseWords={p.verseWords}
            verseWordsTotal={p.verseWordsTotal}
            onLoadVerseWords={p.loadSelectedVerse}
            onWordClick={p.openWordDetailById}
          />
        ) : (
          <LabBrowsePanel
            selectedBook={p.selectedBook}
            onBookChange={p.handleBookChange}
            browseLoading={p.browseLoading}
            browseLoaded={p.browseLoaded}
            browseWords={p.browseWords}
            browseTotal={p.browseTotal}
            browsePage={p.browsePage}
            browseHasNext={p.browseHasNext}
            onLoadMore={p.loadMoreBookWords}
            chartData={p.chartData}
            chartMode={p.chartMode}
            onChartModeChange={p.setChartMode}
            langFilter={p.langFilter}
            onLangFilterChange={p.setLangFilter}
            langCounts={p.langCounts}
            onWordClick={p.openWordDetailById}
          />
        )}
      </LabDictionaryWorkspace>
      <WordDetailSheet
        open={p.detailOpen}
        onOpenChange={p.setDetailOpen}
        wordEntry={p.selectedWord}
        strongsId={p.selectedWord?.strongsId || null}
      />
      <WordStudyDialog
        open={p.dialogOpen}
        onOpenChange={p.setDialogOpen}
        strongsId={p.dialogStrongsId}
        surfaceText={p.dialogSurfaceText || undefined}
      />
    </LabPageWrapper>
  );
}
