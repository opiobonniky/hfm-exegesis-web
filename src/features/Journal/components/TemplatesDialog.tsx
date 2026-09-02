import type { MouseEventHandler } from "react";
import type { Translations } from "@/components/languages/type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JournalEntryTemplate } from "../hooks/useJournalEntryPage";

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: JournalEntryTemplate[];
  t: Translations;
  onApplyTemplate: (template: JournalEntryTemplate) => void;
}

interface TemplateOptionProps {
  template: JournalEntryTemplate;
  promptLabel: string;
  onApplyTemplate: (template: JournalEntryTemplate) => void;
}

function TemplateOption({
  template,
  promptLabel,
  onApplyTemplate,
}: TemplateOptionProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    onApplyTemplate(template);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left px-4 py-3 rounded-xl border border-border dark:border-stone-800 bg-card dark:bg-stone-900 hover:bg-muted dark:hover:bg-stone-800 transition-colors"
    >
      <p className="font-semibold text-sm text-foreground dark:text-stone-200">
        {template.emoji ? `${template.emoji} ` : ""}{template.name}
      </p>
      <p className="text-xs text-muted-foreground dark:text-muted-foreground/70 mt-0.5">
        {template.description || promptLabel.replace("{n}", String(template.prompts.length))}
      </p>
    </button>
  );
}

function getFallbackTemplates(t: Translations): JournalEntryTemplate[] {
  return [
    {
      id: "study",
      emoji: "📖",
      name: t.journal.bibleStudy || "Bible Study",
      description: t.journal.bibleStudyDesc || "Learnings + Application format",
      prompts: [],
    },
    {
      id: "prayer",
      emoji: "🙏",
      name: t.journal.prayerJournal || "Prayer Journal",
      description: t.journal.prayerJournalDesc || "Prayers + Gratitude format",
      prompts: [],
    },
    {
      id: "gratitude",
      emoji: "✨",
      name: t.journal.gratitudeTitle || "Gratitude",
      description: t.journal.gratitudeDesc || "Focus on gratitude",
      prompts: [],
    },
    {
      id: "reflection",
      emoji: "💭",
      name: t.journal.reflectionTitle || "Reflection",
      description: t.journal.reflectionDesc || "What, So What, Now What",
      prompts: [],
    },
  ];
}

export function TemplatesDialog({
  open,
  onOpenChange,
  templates,
  t,
  onApplyTemplate,
}: TemplatesDialogProps) {
  const availableTemplates = templates.length ? templates : getFallbackTemplates(t);
  const promptLabel = t.journal.promptsLabel || "{n} prompts";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-stone-200">
            {t.journal.chooseTemplate || "Choose a Template"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
          {availableTemplates.map((template) => (
            <TemplateOption
              key={template.id}
              template={template}
              promptLabel={promptLabel}
              onApplyTemplate={onApplyTemplate}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
