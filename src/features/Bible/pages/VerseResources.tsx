"use client";

// VerseResources — verse study resources page
import { useVerseResources } from "../hooks/useVerseResources";
import { RESOURCE_TABS, ResourceTabBar, ResourceStatsRow, CommentariesView, CrossReferencesView, WordStudiesView, DictionaryView, TranslationComparisonView, InterlinearView, TopicsView, StudyToolsSection, BookPrologueSection, LoadingSkeleton } from "@/components/verseResources";
import { BiblePageLayout, VerseResourcesErrorState, VerseResourcesHero, VerseResourcesContent } from "../components";

export default function VerseResources() {
  const h = useVerseResources();

  if (h.loading) return <LoadingSkeleton />;

  if (h.error || (!h.data && !h.loading)) {
    return (
      <VerseResourcesErrorState
        error={h.error}
        verseRef={h.verseRef}
        goToReader={h.bookName && h.chapter ? h.goToReader : undefined}
      />
    );
  }

  return (
    <BiblePageLayout className="flex flex-col">
      <VerseResourcesHero
        verseRef={h.verseRef}
        goToReader={h.goToReader}
        statsRow={h.data ? <ResourceStatsRow data={h.data} /> : undefined}
        tabBar={h.visibleTabs.length > 0 ? (
          <ResourceTabBar tabs={RESOURCE_TABS} activeTab={h.activeTab} onTabChange={h.handleTabChange} visibleTabs={h.visibleTabs} />
        ) : undefined}
      />

      <VerseResourcesContent
        bookName={h.bookName}
        prologueLoading={h.prologueLoading}
        prologue={h.prologue && h.bookName ? <BookPrologueSection prologue={h.prologue} bookName={h.bookName} /> : undefined}
      >
        {h.activeTab === "commentaries" && h.data?.commentaries && <CommentariesView data={h.data.commentaries} verseRef={h.verseRef} />}
        {h.activeTab === "crossReferences" && h.data?.crossReferences && <CrossReferencesView data={h.data.crossReferences} />}
        {h.activeTab === "wordStudies" && h.data?.wordStudies && <WordStudiesView data={h.data.wordStudies} />}
        {h.activeTab === "dictionary" && h.data?.dictionaryTerms && <DictionaryView data={h.data.dictionaryTerms} />}
        {h.activeTab === "translations" && <TranslationComparisonView data={h.translations} loading={h.translationsLoading} error={h.translationsError} />}
        {h.activeTab === "interlinear" && h.data?.interlinearWords && <InterlinearView data={h.data.interlinearWords} />}
        {h.activeTab === "topics" && h.data?.relatedTopics && <TopicsView data={h.data.relatedTopics} />}
        {h.data?.studyTools && h.data.studyTools.length > 0 && <StudyToolsSection tools={h.data.studyTools} />}
      </VerseResourcesContent>
    </BiblePageLayout>
  );
}
