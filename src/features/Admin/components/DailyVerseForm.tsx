// Daily verse create/edit form view
import { Sun } from "lucide-react";
import {
  AdminFormHeader, PublishedToggle, FormActions, DateField,
  VerseContentForm,
} from "./index";
import type { useAdminDailyContent } from "../hooks/useAdminDailyContent";
import { isFormValid } from "../utils";

export function DailyVerseForm({ h }: { h: ReturnType<typeof useAdminDailyContent> }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminFormHeader icon={Sun} title={`${h.editItem ? "Edit" : "New"} Daily Verse`} subtitle="Create a new daily verse with explanation" onBack={h.closeForm} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <VerseContentForm formBook={h.formBook} setFormBook={h.setFormBook} formChapter={h.formChapter} setFormChapter={h.setFormChapter}
          formVerse={h.formVerse} setFormVerse={h.setFormVerse} verseVersion={h.verseVersion} setVerseVersion={h.setVerseVersion}
          formExplanation={h.formExplanation} setFormExplanation={h.setFormExplanation} formReflection={h.formReflection} setFormReflection={h.setFormReflection}
          formLearnMore={h.formLearnMore} setFormLearnMore={h.setFormLearnMore} formChapters={h.formChapters} formMaxVerses={h.formMaxVerses}
          formVerseText={h.formVerseText} formVerseLoading={h.formVerseLoading} />
        <DateField label="Display Date" value={h.formDate} onChange={h.setFormDate} required />
        <PublishedToggle checked={h.formPublished} onCheckedChange={h.setFormPublished} />
        <FormActions saving={h.saving} disabled={!isFormValid("verse", h)} onCancel={h.closeForm}
          onSave={h.handleSave} saveLabel={h.editItem ? "Update Verse" : "Add Verse"} savingLabel="Saving..." />
      </div>
    </div>
  );
}
