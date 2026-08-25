import { BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormCard } from "./FormCard";
import { TESTAMENTS } from "../constants";

interface Props {
  t: any; testament: string; setTestament: (v: string) => void;
  entry: { bookName: string; chapter: string; verseNumber: string };
  setEntry: (fn: (prev: any) => any) => void;
  books: string[]; chapters: number[]; verses: number[];
  verseText: string | null; updateField: (k: string, v: any) => void;
  navigate: (path: string) => void;
}

export function ScriptureLink({ t, testament, setTestament, entry, setEntry, books, chapters, verses, verseText, updateField, navigate }: Props) {
  const selectCls = "rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm h-9";
  const labelCls = "text-xs font-medium text-foreground/80 dark:text-muted-foreground/50";

  return (
    <FormCard title={t.journal?.linkToScripture || "Link to Scripture"} icon={BookOpen}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>{t.dailyVerse?.testament || "Testament"}</Label>
          <Select value={testament} onValueChange={(v) => { setTestament(v); setEntry((prev: any) => ({ ...prev, bookName: "", chapter: "", verseNumber: "" })); }}>
            <SelectTrigger className={selectCls}><SelectValue placeholder={t.journal?.selectTestament || "Select testament"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.journal?.allBooks || "All Books"}</SelectItem>
              {TESTAMENTS.map((tst) => <SelectItem key={tst.value} value={tst.value}>{(t.dailyVerse as any)?.[tst.labelKey] || tst.labelKey}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>{t.dailyVerse?.book || "Book"}</Label>
          <Select value={entry.bookName} onValueChange={(v) => setEntry((prev: any) => ({ ...prev, bookName: v, chapter: "", verseNumber: "" }))} disabled={!testament}>
            <SelectTrigger className={selectCls}><SelectValue placeholder={t.dailyVerse?.selectBook || "Select book"} /></SelectTrigger>
            <SelectContent>{books.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {entry.bookName && chapters.length > 0 && (
          <>
            <div className="space-y-1.5">
              <Label className={labelCls}>{t.dailyVerse?.chapter || "Chapter"}</Label>
              <Select value={entry.chapter} onValueChange={(v) => setEntry((prev: any) => ({ ...prev, chapter: v, verseNumber: "" }))}>
                <SelectTrigger className={selectCls}><SelectValue placeholder={t.dailyVerse?.selectChapter || "Select chapter"} /></SelectTrigger>
                <SelectContent>{chapters.map((ch) => <SelectItem key={ch} value={String(ch)}>{`${t.dailyVerse?.chapter || "Chapter"} ${ch}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {entry.chapter && verses.length > 0 && (
              <div className="space-y-1.5">
                <Label className={labelCls}>{t.dailyVerse?.verse || "Verse"}</Label>
                <Select value={entry.verseNumber} onValueChange={(v) => updateField("verseNumber", v)}>
                  <SelectTrigger className={selectCls}><SelectValue placeholder={t.dailyVerse?.selectVerse || "Select verse"} /></SelectTrigger>
                  <SelectContent>{verses.map((v) => <SelectItem key={v} value={String(v)}>{`${t.dailyVerse?.verse || "Verse"} ${v}`}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
        {entry.bookName && (
          <button onClick={() => { if (entry.bookName && entry.chapter && entry.verseNumber) navigate(`/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`); }} disabled={!entry.bookName || !entry.chapter}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-muted-foreground dark:text-muted-foreground/70 hover:bg-muted dark:hover:bg-stone-800 transition-colors disabled:opacity-40">
            <BookOpen className="w-3.5 h-3.5" />{t.journal?.openBibleReader || "Open in Bible Reader"}
          </button>
        )}
      </div>
    </FormCard>
  );
}
