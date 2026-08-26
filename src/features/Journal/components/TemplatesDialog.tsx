import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Template { id: string; name: string; prompts: any[]; }
interface FallbackTemplate { id: string; emoji: string; title: string; desc: string; }
interface Props {
  open: boolean; onOpenChange: (v: boolean) => void;
  templates: Template[]; t: any;
  handleApplyTemplate: (id: string) => void; applyTemplate: (id: string) => void;
}
const FALLBACKS = (t: any): FallbackTemplate[] => [
  { id: "study", emoji: "📖", title: t.journal?.bibleStudy || "Bible Study", desc: t.journal?.bibleStudyDesc || "Learnings + Application format" },
  { id: "prayer", emoji: "🙏", title: t.journal?.prayerJournal || "Prayer Journal", desc: t.journal?.prayerJournalDesc || "Prayers + Gratitude format" },
  { id: "gratitude", emoji: "✨", title: t.journal?.gratitudeTitle || "Gratitude", desc: t.journal?.gratitudeDesc || "Focus on gratitude" },
  { id: "reflection", emoji: "💭", title: t.journal?.reflectionTitle || "Reflection", desc: t.journal?.reflectionDesc || "What, So What, Now What" },
];
export function TemplatesDialog({ open, onOpenChange, templates, t, handleApplyTemplate, applyTemplate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-stone-200">{t.journal?.chooseTemplate || "Choose a Template"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
          {templates.length > 0 ? templates.map((tpl) => (
            <button key={tpl.id} onClick={() => { handleApplyTemplate(tpl.id); onOpenChange(false); }}
              className="w-full text-left px-4 py-3 rounded-xl border border-border dark:border-stone-800 bg-card dark:bg-stone-900 hover:bg-muted dark:hover:bg-stone-800 transition-colors">
              <p className="font-semibold text-sm text-foreground dark:text-stone-200">{tpl.name}</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70 mt-0.5">
                {(t.journal?.promptsLabel || "{n} prompts").replace("{n}", String(tpl.prompts.length))}
              </p>
            </button>
          )) : FALLBACKS(t).map((tpl) => (
            <button key={tpl.id} onClick={() => applyTemplate(tpl.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-border dark:border-stone-800 bg-card dark:bg-stone-900 hover:bg-muted dark:hover:bg-stone-800 transition-colors">
              <p className="font-semibold text-sm text-foreground dark:text-stone-200">{tpl.emoji} {tpl.title}</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70 mt-0.5">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
