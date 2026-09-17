"use client";

// VerseResources — one study section at a time for a single verse.
//
// The reader arrives here from the verse action sheet with a `tab` param (for
// example `tab=crossReferences`), and sees exactly that section. The section
// rail lets them move to the others without leaving the page.
import { useVerseResources } from "../hooks/useVerseResources";
import {
  BookPrologueSection,
  CommentariesView,
  CrossReferencesView,
  DictionaryView,
  ExplanationView,
  InterlinearView,
  LoadingSkeleton,
  SectionEmpty,
  SectionIntro,
  SectionPager,
  SectionRail,
  StudyToolsSection,
  TopicsView,
  TranslationComparisonView,
  VerseReferencesView,
  WordStudiesView,
} from "@/components/verseResources";
import { BiblePageLayout, VerseResourcesErrorState, VerseResourcesHero } from "../components";

export default function VerseResources() {
  const { data, actions } = useVerseResources();
  const section = data.section;
  const content = data.sectionData;

  if (!data.bookName || !data.chapter) {
    return (
      <VerseResourcesErrorState
        error={data.error || "No verse was provided to study."}
        verseRef={data.verseRef}
      />
    );
  }

  const sectionCount = data.counts?.[section] ?? undefined;

  const renderSection = () => {
    if (data.loading) return <LoadingSkeleton />;

    switch (section) {
      case "explanation":
        if (!content.explanation) return <SectionEmpty sectionId={section} error={data.error} />;
        return <ExplanationView data={content.explanation} />;

      case "commentaries":
        if (content.commentaries.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <CommentariesView data={content.commentaries} verseRef={data.verseRef} />;

      case "crossReferences":
        if (content.crossReferences.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <CrossReferencesView data={content.crossReferences} />;

      case "wordStudies":
        if (content.wordStudies.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <WordStudiesView data={content.wordStudies} />;

      case "dictionary":
        if (content.dictionary.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <DictionaryView data={content.dictionary} />;

      case "interlinear":
        if (content.interlinear.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <InterlinearView data={content.interlinear} />;

      case "topics":
        if (content.topics.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <TopicsView data={content.topics} />;

      case "verseReferences":
        if (content.verseReferences.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <VerseReferencesView data={content.verseReferences} />;

      case "studyTools":
        if (content.studyTools.length === 0)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <StudyToolsSection tools={content.studyTools} />;

      case "translations":
        return (
          <TranslationComparisonView
            data={data.translations}
            loading={data.translationsLoading}
            error={data.translationsError}
          />
        );

      case "prologue":
        if (data.prologueLoading) return <LoadingSkeleton />;
        if (!data.prologue)
          return <SectionEmpty sectionId={section} error={data.error} />;
        return <BookPrologueSection prologue={data.prologue} bookName={data.bookName} />;

      default:
        return <SectionEmpty sectionId={section} error={data.error} />;
    }
  };

  return (
    <BiblePageLayout className="flex flex-col">
      <VerseResourcesHero
        verseRef={data.verseRef}
        sectionHeading={data.sectionHeading}
        goToReader={actions.goToReader}
        rail={
          <SectionRail
            activeSection={section}
            onSectionChange={actions.handleSectionChange}
            counts={data.counts}
          />
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 sm:px-6">
        <SectionIntro sectionId={section} count={sectionCount ?? undefined} />
        {renderSection()}
        <SectionPager
          activeSection={section}
          onSectionChange={actions.handleSectionChange}
          counts={data.counts}
        />
        <div className="h-10" />
      </main>
    </BiblePageLayout>
  );
}
