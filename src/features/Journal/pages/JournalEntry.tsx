import { JournalEntryForm } from "../components/JournalEntryForm";
import { JournalEntryHeader } from "../components/JournalEntryHeader";
import { TemplatesDialog } from "../components/TemplatesDialog";
import { useJournalEntryPage } from "../hooks/useJournalEntryPage";

export default function JournalEntryPage() {
  const p = useJournalEntryPage();

  return (
    <div
      className="min-h-screen bg-amber-50/30 dark:bg-stone-950"
      dir={p.isRtl ? "rtl" : "ltr"}
    >
      <JournalEntryHeader
        navigate={p.goBack}
        t={p.t}
        saving={p.saving}
        handleSave={p.handleSave}
        setShowTemplates={p.setShowTemplates}
      />

      <JournalEntryForm model={p} />

      <TemplatesDialog
        open={p.showTemplates}
        onOpenChange={p.setShowTemplates}
        templates={p.templates}
        t={p.t}
        onApplyTemplate={p.handleApplyTemplate}
      />
    </div>
  );
}
