import { BookOpen, BookText, Sparkles, Loader2 } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import LockedFeatureBadge from "@/components/LockedFeatureBadge";

const BOOK_CHAPTERS: Record<string, number> = { Genesis: 50, Psalms: 150, Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16, Revelation: 22 };

interface PassageSelectorProps {
  bookName: string; chapter: string; verseStart: string; verseEnd: string; books: string[];
  previewText: string; previewLoading: boolean; isFree: boolean; loading: boolean; error: string;
  onUpdate: (patch: { bookName?: string; chapter?: string; verseStart?: string; verseEnd?: string }) => void;
  onStart: () => void;
}

const SelectionCard = ({ icon: Icon, label, children }: { icon: typeof BookOpen; label: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-card shadow-sm"><div className="border-b border-border/30 p-4 pb-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary/60" /><p className="text-xs font-bold">{label}</p></div></div><div className="p-4">{children}</div></div>
);

export function PassageSelector({ bookName, chapter, verseStart, verseEnd, books, previewText, previewLoading, isFree, loading, error, onUpdate, onStart }: PassageSelectorProps) {
  const maxChapters = BOOK_CHAPTERS[bookName] || 50;
  const hasPassage = Boolean(bookName && chapter && verseStart);
  const verseOptions = Array.from({ length: 176 }, (_, i) => ({ value: String(i + 1), label: `Verse ${i + 1}` }));
  return (
    <div className="flex flex-col gap-6 pt-4">
      <SelectionCard icon={BookOpen} label="Book">
        <Combobox options={books.map((b) => ({ value: b, label: b }))} value={bookName} onChange={(v) => onUpdate({ bookName: v, chapter: "", verseStart: "", verseEnd: "" })} placeholder="Select a book..." width="w-full" />
      </SelectionCard>
      {bookName && <SelectionCard icon={BookText} label="Chapter"><Combobox options={Array.from({ length: maxChapters }, (_, i) => ({ value: String(i + 1), label: `Chapter ${i + 1}` }))} value={chapter} onChange={(v) => onUpdate({ chapter: v, verseStart: "", verseEnd: "" })} placeholder="Select chapter..." width="w-full" /></SelectionCard>}
      {bookName && chapter && <SelectionCard icon={Sparkles} label="Verse(s)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Combobox options={verseOptions} value={verseStart} onChange={(v) => onUpdate({ verseStart: v, verseEnd: "" })} placeholder="Start verse..." width="w-full" />
          <Combobox options={verseOptions} value={verseEnd} onChange={(v) => onUpdate({ verseEnd: v })} placeholder="End verse (optional)..." width="w-full" />
        </div>
      </SelectionCard>}
      {error && <p className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center text-xs font-semibold text-destructive">{error}</p>}
      {hasPassage && <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"><p className="mb-3 text-xs font-bold">Passage Preview</p>{previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <p className="font-serif text-sm italic">{previewText || "Could not load preview."}</p>}</div>}
      {isFree && hasPassage ? <LockedFeatureBadge compact featureName="Exegesis Lab" featureDescription="Available for Sower subscribers." /> : <button onClick={onStart} disabled={loading || !hasPassage} className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "Starting..." : "Begin Study Journey"}</button>}
    </div>
  );
}
