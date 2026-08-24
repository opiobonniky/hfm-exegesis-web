import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { routes } from "@/components/Routes/routes";

interface Props {
  navigate: (path: string) => void;
  t: any;
  saving: boolean;
  handleSave: () => void;
  setShowTemplates: (v: boolean) => void;
}

export function JournalEntryHeader({ navigate, t, saving, handleSave, setShowTemplates }: Props) {
  return (
    <div className="border-b border-border/60 dark:border-stone-800/60 bg-card/50 dark:bg-stone-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(routes.journal.path)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground dark:text-muted-foreground/70 dark:hover:text-stone-200 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />{t.journal?.backToJournal || "Back to Journal"}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTemplates(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-muted-foreground dark:text-muted-foreground/70 hover:bg-muted dark:hover:bg-stone-800 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />{t.journal?.templates || "Templates"}
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-foreground transition-all disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              {saving ? (t.journal?.saving || "Saving...") : (t.journal?.saveEntry || "Save Entry")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
