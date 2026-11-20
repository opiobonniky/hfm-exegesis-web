"use client";

/**
 * AddDailyVerse — add/edit daily verse with all rich content fields.
 * All state in useAddDailyVerse hook, UI split into section components.
 * Single root div — no inline HTML beyond components.
 */
import { BookOpen } from "lucide-react";
import { useAddDailyVerse } from "../hooks/useAddDailyVerse";
import { useValidationFeedback } from "../hooks/useValidationFeedback";
import {
  VerseReferenceSection,
  VerseTextArea,
  RequiredContentFields,
  DateTimeFields,
  BackgroundSection,
  StructuredContentSection,
  GuidedTabs,
  GuidedTab,
  DailyContentFormActions,
  DailyContentFormCard,
  PublishToggle,
  PageContentWrapper,
  AddDailyVerseHeader,
  AddDailyVerseConflictDialog,
  ExplanationAutoFillBanner,
  AddDailyVerseWorkspace,
} from "../components";
import { routes } from "@/components/Routes/routes";
import { tt } from '@/components/languages/hardcodedTranslate';
import { VerseIntroductionField } from '../components/RequiredContentFields';
import { VERSE_EXPLANATION_STEPS } from '../constants';

const AddDailyVerse = () => {
  const { data, actions } = useAddDailyVerse();
  const h = { ...data, ...actions };
  const feedback = useValidationFeedback();
  const error = (key: keyof typeof h.fieldErrors, step: number) =>
    feedback.attempted(String(step)) || feedback.visible(key, 'verse') ? h.fieldErrors[key] : undefined;
  const validateStep = (step: number) => {
    if (h.validateStep(step)) return true;
    feedback.attempt(String(step));
    return false;
  };

  return (
    <PageContentWrapper isRtl={h.isRtl} maxWidth="max-w-[1440px]">
      <AddDailyVerseHeader model={h} />

      <AddDailyVerseWorkspace>
        <div {...feedback.capture('verse')}><DailyContentFormCard
          icon={BookOpen}
          title={h.t.dailyVerse.verseDetails}
          description={h.t.dailyVerse.verseDetailsDesc}
          contentClassName="space-y-7 pt-6 sm:pt-8"
        >
          <GuidedTabs validateStep={validateStep}>
            <GuidedTab
              title={tt(VERSE_EXPLANATION_STEPS[0].label)}
              description={tt(VERSE_EXPLANATION_STEPS[0].description)}
            >
              <VerseReferenceSection
                book={h.book}
                setBook={h.setBook}
                chapter={h.chapter}
                setChapter={h.setChapter}
                verseNumber={h.verseNumber}
                setVerseNumber={h.setVerseNumber}
                verseEnd={h.verseEnd}
                setVerseEnd={h.setVerseEnd}
                verseNumbers={h.verseNumbers}
                bibleVersion={h.bibleVersion}
                bibleVersionOptions={h.bibleVersionOptions}
                setBibleVersion={h.setBibleVersion}
                t={h.t}
                isRtl={h.isRtl}
                errors={{
                  bookName: error('bookName', 0), chapter: error('chapter', 0),
                  verseNumber: error('verseNumber', 0), verseEnd: error('verseEnd', 0),
                  bibleVersion: error('bibleVersion', 0),
                }}
              />
              <VerseTextArea
                verseText={h.verseText}
                setVerseText={h.setVerseText}
                isVerseEditing={h.isVerseEditing}
                setIsVerseEditing={h.setIsVerseEditing}
                isVerseLoading={h.isVerseLoading}
                book={h.book}
                chapter={h.chapter}
                verseNumber={h.verseNumber}
                verseEnd={h.verseEnd}
                bibleVersion={h.bibleVersion}
                t={h.t}
                error={error('verseText', 0)}
              />
              {h.passageError && <p role="alert" className="text-sm text-destructive">{tt(h.passageError)} <button type="button" onClick={h.retryPassage}>{tt('Retry')}</button></p>}
            </GuidedTab>

            <GuidedTab
              title={tt(VERSE_EXPLANATION_STEPS[1].label)}
              description={tt(VERSE_EXPLANATION_STEPS[1].description)}
            >
              <ExplanationAutoFillBanner model={h} />
              <RequiredContentFields
                explanation={h.explanation}
                setExplanation={h.setExplanation}
                application={h.application}
                setApplication={h.setApplication}
                isRtl={h.isRtl}
                errors={{
                  explanation: error('explanation', 1), application: error('application', 1),
                }}
              />
            </GuidedTab>

            <GuidedTab
              title={tt(VERSE_EXPLANATION_STEPS[2].label)}
              description={tt(VERSE_EXPLANATION_STEPS[2].description)}
            >
              <VerseIntroductionField value={h.verseIntroduction} onChange={h.setVerseIntroduction}
                error={error('verseIntroduction', 2)} isRtl={h.isRtl} />
              <BackgroundSection
                backgroundAuthor={h.backgroundAuthor}
                setBackgroundAuthor={h.setBackgroundAuthor}
                backgroundBook={h.backgroundBook}
                setBackgroundBook={h.setBackgroundBook}
                backgroundContext={h.backgroundContext}
                setBackgroundContext={h.setBackgroundContext}
                isRtl={h.isRtl}
              />
              <StructuredContentSection
                wordStudies={h.wordStudies}
                setWordStudies={h.setWordStudies}
                practicalApplications={h.practicalApplications}
                setPracticalApplications={h.setPracticalApplications}
                keyThemes={h.keyThemes}
                setKeyThemes={h.setKeyThemes}
                crossReferences={h.crossReferences}
                setCrossReferences={h.setCrossReferences}
                finalThoughts={h.finalThoughts}
                setFinalThoughts={h.setFinalThoughts}
                takeaways={h.takeaways}
                setTakeaways={h.setTakeaways}
                bibleVersion={h.bibleVersion}
                isRtl={h.isRtl}
                requireRichRows={h.requireRichRows}
                revealRowErrors={feedback.attempted('2')}
                takeawayErrors={h.takeawayErrors.map((message, index) =>
                  feedback.attempted('2') || feedback.visible(`takeaways.${index}`, 'verse') ? message : '')}
              />
            </GuidedTab>

            <GuidedTab
              title={tt("Publish & Save")}
              description={tt("Set the publish date, time, and status")}
            >
              <DateTimeFields selectedDate={h.selectedDate} setSelectedDate={h.setSelectedDate}
                selectedTime={h.selectedTime} handleTimeChange={h.handleTimeChange}
                errors={{ date: error('date', 3), time: error('time', 3) }} />
              <PublishToggle
                published={h.published}
                onCheckedChange={h.setPublished}
                publishedLabel={h.t.dailyVerse.publishedLabel}
                publishedDesc={h.t.dailyVerse.publishedDesc}
              />
              <DailyContentFormActions
                cancelTo={routes.adminDailyVerses.path}
                cancelLabel={h.t.common.cancel}
                saveLabel={h.t.dailyVerse.saveDailyVerse}
                disabled={h.saveDisabled && h.validateStep(3)}
                onSave={() => { if (validateStep(3)) void h.handleSave(); }}
              />
            </GuidedTab>
          </GuidedTabs>
        </DailyContentFormCard></div>
      </AddDailyVerseWorkspace>

      <AddDailyVerseConflictDialog model={h} />
    </PageContentWrapper>
  );
};

export default AddDailyVerse;
