"use client";

/**
 * AddDailyVerse — add/edit daily verse with all rich content fields.
 * All state in useAddDailyVerse hook, UI split into section components.
 * Single root div — no inline HTML beyond components.
 */
import { BookOpen } from "lucide-react";
import { useAddDailyVerse } from "../hooks/useAddDailyVerse";
import {
  VerseReferenceSection, VerseTextArea, RequiredContentFields,
  BackgroundSection, StructuredContentSection, CollapsibleSection as Section,
  DailyContentFormActions, DailyContentFormCard,
  PublishToggle, PageContentWrapper,
  AddDailyVerseHeader, AddDailyVerseConflictDialog,
  ExplanationAutoFillBanner,
} from "../components";
import { routes } from "@/components/Routes/routes";

const AddDailyVerse = () => {
  const h = useAddDailyVerse();

  return (
    <PageContentWrapper isRtl={h.isRtl} maxWidth="max-w-7xl">
      <AddDailyVerseHeader model={h} />

      <DailyContentFormCard
        icon={BookOpen}
        title={h.t.dailyVerse.verseDetails}
        description={h.t.dailyVerse.verseDetailsDesc}
        contentClassName="pt-6 space-y-6 fade-up stagger-1"
      >
        <Section title="Verse Reference">
          <VerseReferenceSection
            testament={h.testament} setTestament={h.setTestament}
            book={h.book} setBook={h.setBook}
            chapter={h.chapter} setChapter={h.setChapter}
            verseNumber={h.verseNumber} setVerseNumber={h.setVerseNumber}
            bibleVersion={h.bibleVersion} setBibleVersion={h.setBibleVersion}
            selectedDate={h.selectedDate} setSelectedDate={h.setSelectedDate}
            selectedTime={h.selectedTime} handleTimeChange={h.handleTimeChange}
            books={h.books} chapters={h.chapters} maxVerses={h.maxVerses}
            TESTAMENTS={h.TESTAMENTS} t={h.t} isRtl={h.isRtl}
          />
        </Section>

        <Section title="Verse Text">
          <VerseTextArea
            verseText={h.verseText} setVerseText={h.setVerseText}
            isVerseEditing={h.isVerseEditing} setIsVerseEditing={h.setIsVerseEditing}
            isVerseLoading={h.isVerseLoading}
            book={h.book} chapter={h.chapter} verseNumber={h.verseNumber}
            bibleVersion={h.bibleVersion} t={h.t}
          />
        </Section>

        <ExplanationAutoFillBanner model={h} />

        <Section title="Verse Content">
          <RequiredContentFields
            explanation={h.explanation} setExplanation={h.setExplanation}
            application={h.application} setApplication={h.setApplication}
            verseIntroduction={h.verseIntroduction} setVerseIntroduction={h.setVerseIntroduction}
            learnMore={h.learnMore} setLearnMore={h.setLearnMore}
            t={h.t} isRtl={h.isRtl}
          />
        </Section>

        <Section title="Background" defaultOpen={false}>
          <BackgroundSection
            backgroundAuthor={h.backgroundAuthor} setBackgroundAuthor={h.setBackgroundAuthor}
            backgroundBook={h.backgroundBook} setBackgroundBook={h.setBackgroundBook}
            backgroundContext={h.backgroundContext} setBackgroundContext={h.setBackgroundContext}
            isRtl={h.isRtl}
          />
        </Section>

        <Section title="Rich Content" defaultOpen={false}>
          <StructuredContentSection
            wordStudies={h.wordStudies} setWordStudies={h.setWordStudies}
            practicalApplications={h.practicalApplications} setPracticalApplications={h.setPracticalApplications}
            keyThemes={h.keyThemes} setKeyThemes={h.setKeyThemes}
            crossReferences={h.crossReferences} setCrossReferences={h.setCrossReferences}
            finalThoughts={h.finalThoughts} setFinalThoughts={h.setFinalThoughts}
            takeaways={h.takeaways} setTakeaways={h.setTakeaways}
            isRtl={h.isRtl}
          />
        </Section>

        <Section title="Publish & Save">
          <PublishToggle
            published={h.published}
            onCheckedChange={h.setPublished}
            publishedLabel={h.t.dailyVerse.publishedLabel}
            publishedDesc={h.t.dailyVerse.publishedDesc}
          />
          <DailyContentFormActions
            cancelTo={routes.dailyVerse.path}
            cancelLabel={h.t.common.cancel}
            saveLabel={h.t.dailyVerse.saveDailyVerse}
            disabled={h.saveDisabled}
            onSave={h.handleSave}
          />
        </Section>
      </DailyContentFormCard>

      <AddDailyVerseConflictDialog model={h} />
    </PageContentWrapper>
  );
};

export default AddDailyVerse;
