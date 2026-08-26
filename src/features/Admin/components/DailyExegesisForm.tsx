// Daily exegesis create/edit form view
import { BookOpen } from "lucide-react";
import { AdminFormHeader, FormActions, ExegesisContentForm } from "./index";
import type { useAdminDailyContent } from "../hooks/useAdminDailyContent";
import { isFormValid } from "../utils";

export function DailyExegesisForm({ h }: { h: ReturnType<typeof useAdminDailyContent> }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminFormHeader icon={BookOpen} title={`${h.editItem ? "Edit" : "New"} Daily Exegesis`} subtitle="Create a new daily exegesis with full teaching content" onBack={h.closeForm} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <ExegesisContentForm formTitle={h.formTitle} setFormTitle={h.setFormTitle} formPassageRef={h.formPassageRef} setFormPassageRef={h.setFormPassageRef}
          formIntro={h.formIntro} setFormIntro={h.setFormIntro} formContextSummary={h.formContextSummary} setFormContextSummary={h.setFormContextSummary}
          formTeachingBody={h.formTeachingBody} setFormTeachingBody={h.setFormTeachingBody} formApplication={h.formApplication} setFormApplication={h.setFormApplication}
          formPrayer={h.formPrayer} setFormPrayer={h.setFormPrayer} formTags={h.formTags} setFormTags={h.setFormTags} />
        <FormActions saving={h.saving} disabled={!isFormValid("exegesis", h)} onCancel={h.closeForm}
          onSave={h.handleSave} saveLabel={h.editItem ? "Update Exegesis" : "Add Exegesis"} savingLabel="Saving..." />
      </div>
    </div>
  );
}
