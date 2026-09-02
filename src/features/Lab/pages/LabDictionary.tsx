import { useLabDictionaryPage } from "../hooks";
import WordDetailSheet from "@/components/WordDetailSheet";
import WordStudyDialog from "@/components/WordStudyDialog";
import { 
  LabBrowsePanel, LabDictionaryHeader, LabDictionaryWorkspace, 
  LabModeTabs, LabSearchPanel, LabVersePanel, LabPageWrapper 
} from "../components";

export default function LabDictionary() {
  const {data, actions} = useLabDictionaryPage();

  return (
    <LabPageWrapper>
      <LabDictionaryHeader onGoBack={actions.goBack} />
      <LabDictionaryWorkspace>
        <LabModeTabs mode={data.mode} onModeChange={actions.setMode} />
        {data.mode === "search" ? (
          <LabSearchPanel
            searchQuery={data.searchQuery}
            onSearchQueryChange={actions.setSearchQuery}
            results={data.results}
            loading={data.loading}
            searched={data.searched}
            resultTotal={data.resultTotal}
            searchLangCounts={data.searchLangCounts}
            onWordClick={actions.openWordDetailById}
          />
        ) : data.mode === "verse" ? (
          <LabVersePanel
            verseBook={data.verseBook}
            onVerseBookChange={actions.setVerseBook}
            verseChapter={data.verseChapter}
            onVerseChapterChange={actions.setVerseChapter}
            verseNum={data.verseNum}
            onVerseNumChange={actions.setVerseNum}
            verseWordsLoading={data.verseWordsLoading}
            verseWordsLoaded={data.verseWordsLoaded}
            verseWords={data.verseWords}
            verseWordsTotal={data.verseWordsTotal}
            onLoadVerseWords={actions.loadSelectedVerse}
            onWordClick={actions.openWordDetailById}
          />
        ) : (
          <LabBrowsePanel
            selectedBook={data.selectedBook}
            onBookChange={actions.handleBookChange}
            browseLoading={data.browseLoading}
            browseLoaded={data.browseLoaded}
            browseWords={data.browseWords}
            browseTotal={data.browseTotal}
            browsePage={data.browsePage}
            browseHasNext={data.browseHasNext}
            onLoadMore={actions.loadMoreBookWords}
            chartData={data.chartData}
            chartMode={data.chartMode}
            onChartModeChange={actions.setChartMode}
            langFilter={data.langFilter}
            onLangFilterChange={actions.setLangFilter}
            langCounts={data.langCounts}
            onWordClick={actions.openWordDetailById}
          />
        )}
      </LabDictionaryWorkspace>
      <WordDetailSheet
        open={data.detailOpen}
        onOpenChange={actions.setDetailOpen}
        wordEntry={data.selectedWord}
        strongsId={data.selectedWord?.strongsId || null}
      />
      <WordStudyDialog
        open={data.dialogOpen}
        onOpenChange={actions.setDialogOpen}
        strongsId={data.dialogStrongsId}
        surfaceText={data.dialogSurfaceText || undefined}
      />
    </LabPageWrapper>
  );
}
