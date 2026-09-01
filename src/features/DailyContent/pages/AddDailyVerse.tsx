"use client";

/**
 * AddDailyVerse — add/edit daily verse with all rich content fields.
 * All state in useAddDailyVerse hook, UI split into section components.
 * Single root div — no inline HTML beyond components.
 */
import { Sun, BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useAddDailyVerse } from "../hooks/useAddDailyVerse";
import {
  VerseReferenceSection, VerseTextArea, RequiredContentFields,
  BackgroundSection, StructuredContentSection, CollapsibleSection as Section,
  DailyContentPageHeader, DailyContentFormActions, DailyContentFormCard,
  PublishToggle, PageContentWrapper,
} from "../components";
import { routes } from "@/components/Routes/routes";

const AddDailyVerse = () => {
  const h = useAddDailyVerse();
  const navigate = useNavigate();

  return (
    <PageContentWrapper isRtl={h.isRtl} maxWidth="max-w-7xl">
      <div className="fade-up">
        <DailyContentPageHeader
          backTo={routes.dashboard.path}
          backLabel={h.t.common.back}
          icon={Sun}
          title={h.isEditing ? "Edit Daily Verse" : h.t.dailyVerse.addVerseTitle}
          subtitle={h.t.dailyVerse.addVerseSubtitle}
        />
      </div>

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

      <Dialog open={h.conflictDialog.open} onOpenChange={(o) => !o && h.setConflictDialog({ open: false, conflict: null, payload: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {h.t.dailyVerse.verseAlreadyExists}
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const ref = h.conflictDialog.conflict?.existing?.bookName
                  ? `${h.conflictDialog.conflict.existing.bookName} ${h.conflictDialog.conflict.existing.chapter}:${h.conflictDialog.conflict.existing.verseNumber}`
                  : "";
                return h.conflictDialog.conflict?.type === "date"
                  ? h.t.dailyVerse.verseConflictForDate.replace("{ref}", ref)
                  : h.t.dailyVerse.verseConflictForVerse.replace("{ref}", ref).replace("{date}", h.conflictDialog.conflict?.existing?.displayDate || "");
              })()}{" "}
              {h.t.dailyVerse.verseConflictUpdatePrompt}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => h.setConflictDialog({ open: false, conflict: null, payload: null })}>
              {h.t.common.cancel}
            </Button>
            <Button variant="outline" onClick={() => { h.setConflictDialog({ open: false, conflict: null, payload: null }); navigate(routes.dailyVerse.path); }}>
              <BookOpen className="h-4 w-4 mr-2" /> {h.t.dailyVerse.viewExisting}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContentWrapper>
  );
};

export default AddDailyVerse;
