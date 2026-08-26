"use client";

/**
 * AddDailyVerse — add/edit daily verse with all rich content fields.
 * All state in useAddDailyVerse hook, UI split into section components.
 */
import {
  Sun, Save, BookOpen, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useAddDailyVerse } from "../hooks/useAddDailyVerse";
import {
  VerseReferenceSection, VerseTextArea, RequiredContentFields,
  BackgroundSection, StructuredContentSection,
} from "../components";
import { routes } from "@/components/Routes/routes";

/** Collapsible section wrapper */
function Section({
  title, defaultOpen = true, children,
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="cursor-pointer select-none flex items-center gap-2 py-2 text-sm font-semibold text-foreground/80 border-b border-border/40 mb-4">
        <span className="group-open:rotate-90 transition-transform text-xs">▶</span>
        {title}
      </summary>
      <div className="space-y-6">{children}</div>
    </details>
  );
}

const AddDailyVerse = () => {
  const h = useAddDailyVerse();
  const navigate = useNavigate();

  return (
    <div dir={h.isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="fade-up flex items-center gap-4">
          <Link to={routes.dashboard.path} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
            ← {h.t.common.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
              <Sun className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gradient">
                {h.isEditing ? "Edit Daily Verse" : h.t.dailyVerse.addVerseTitle}
              </h1>
              <p className="text-muted-foreground">{h.t.dailyVerse.addVerseSubtitle}</p>
            </div>
          </div>
        </div>

        {/* ── Form Card ── */}
        <Card className="fade-up stagger-1 border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {h.t.dailyVerse.verseDetails}
            </CardTitle>
            <CardDescription>{h.t.dailyVerse.verseDetailsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* 1. Reference pickers */}
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

            {/* 2. Verse text */}
            <Section title="Verse Text">
              <VerseTextArea
                verseText={h.verseText} setVerseText={h.setVerseText}
                isVerseEditing={h.isVerseEditing} setIsVerseEditing={h.setIsVerseEditing}
                isVerseLoading={h.isVerseLoading}
                book={h.book} chapter={h.chapter} verseNumber={h.verseNumber}
                bibleVersion={h.bibleVersion} t={h.t}
              />
            </Section>

            {/* 3. Core content (required) */}
            <Section title="Verse Content">
              <RequiredContentFields
                explanation={h.explanation} setExplanation={h.setExplanation}
                application={h.application} setApplication={h.setApplication}
                verseIntroduction={h.verseIntroduction} setVerseIntroduction={h.setVerseIntroduction}
                learnMore={h.learnMore} setLearnMore={h.setLearnMore}
                t={h.t} isRtl={h.isRtl}
              />
            </Section>

            {/* 4. Background */}
            <Section title="Background" defaultOpen={false}>
              <BackgroundSection
                backgroundAuthor={h.backgroundAuthor} setBackgroundAuthor={h.setBackgroundAuthor}
                backgroundBook={h.backgroundBook} setBackgroundBook={h.setBackgroundBook}
                backgroundContext={h.backgroundContext} setBackgroundContext={h.setBackgroundContext}
                isRtl={h.isRtl}
              />
            </Section>

            {/* 5. Structured content */}
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

            {/* 6. Publish + Save */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{h.t.dailyVerse.publishedLabel}</Label>
                  <p className="text-xs text-muted-foreground">{h.t.dailyVerse.publishedDesc}</p>
                </div>
                <Switch checked={h.published} onCheckedChange={h.setPublished} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button type="button" variant="ghost" asChild>
                  <Link to={routes.dailyVerse.path}>{h.t.common.cancel}</Link>
                </Button>
                <Button
                  onClick={h.handleSave}
                  disabled={h.saveDisabled}
                  className="bg-gradient-to-r from-primary to-primary/90 shadow-md"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {h.t.dailyVerse.saveDailyVerse}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Conflict Dialog ── */}
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
            <Button onClick={h.handleConflictUpdate}>
              <Save className="h-4 w-4 mr-2" /> {h.t.dailyVerse.updateExisting}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddDailyVerse;
