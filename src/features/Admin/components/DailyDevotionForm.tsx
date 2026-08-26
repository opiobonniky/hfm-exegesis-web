// Daily devotion create/edit form view
import { Sprout } from "lucide-react";
import {
  AdminFormHeader, FormActions, DateField,
  DevotionContentForm,
} from "./index";
import type { useAdminDailyContent } from "../hooks/useAdminDailyContent";
import { isFormValid } from "../utils";

export function DailyDevotionForm({ h }: { h: ReturnType<typeof useAdminDailyContent> }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminFormHeader icon={Sprout} title={`${h.editItem ? "Edit" : "New"} Daily Devotion`} subtitle="Create a new daily devotion with optional Bible reference" onBack={h.closeForm} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <DevotionContentForm formTitle={h.formTitle} setFormTitle={h.setFormTitle} formContent={h.formContent} setFormContent={h.setFormContent}
          formBook={h.formBook} setFormBook={h.setFormBook} formChapter={h.formChapter} setFormChapter={h.setFormChapter}
          formVerse={h.formVerse} setFormVerse={h.setFormVerse} formChapters={h.formChapters} formMaxVerses={h.formMaxVerses} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateField label="Display Date" value={h.formDate} onChange={h.setFormDate} required />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Display Time</label>
            <input type="time" value={h.formTime} onChange={h.handleTimeChange} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" />
          </div>
        </div>
        <FormActions saving={h.saving} disabled={!isFormValid("devotion", h)} onCancel={h.closeForm}
          onSave={h.handleSave} saveLabel={h.editItem ? "Update Devotion" : "Add Devotion"} savingLabel="Saving..." />
      </div>
    </div>
  );
}
