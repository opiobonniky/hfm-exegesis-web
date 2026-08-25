import { useState, useEffect, useMemo } from "react";
import { BookOpen, Lightbulb, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import {
  getVerseText, getBooksByTestament, getChaptersForBook,
  getVersesCountForChapter, setActiveVersion,
} from "@/utilities/bibleUtils";
import { useLanguage } from "@/components/languages/languageProvider";
import { TESTAMENTS } from "../constants";
import type { EditState } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: EditState;
  verseText: string;
  isSaving: boolean;
  onChange: (state: EditState) => void;
  onVerseTextChange: (text: string) => void;
  onSave: () => void;
}

export default function EditVerseDialog({
  open, onOpenChange, state, verseText, isSaving,
  onChange, onVerseTextChange, onSave,
}: Props) {
  const { t } = useLanguage();
  const [localState, setLocalState] = useState<EditState>(state);
  useEffect(() => { setLocalState(state); }, [state]);

  const books = useMemo(
    () => localState.testament
      ? getBooksByTestament(localState.testament as "Old" | "New")
      : [],
    [localState.testament],
  );

  const chapters = useMemo(
    () => localState.book ? getChaptersForBook(localState.book) : [],
    [localState.book],
  );

  const maxVerses = useMemo(
    () => (!localState.book || !localState.chapter)
      ? 0
      : getVersesCountForChapter(localState.book, Number(localState.chapter)) || 0,
    [localState.book, localState.chapter],
  );

  const verseTextValue = useMemo(() => {
    if (!localState.bookName || !localState.chapter || !localState.verseNumber) return "";
    if (localState.bibleVersion) setActiveVersion(localState.bibleVersion);
    return getVerseText(localState.bookName, Number(localState.chapter), Number(localState.verseNumber)) || "";
  }, [localState.bookName, localState.chapter, localState.verseNumber, localState.bibleVersion]);

  useEffect(() => { onVerseTextChange(verseTextValue); }, [verseTextValue, onVerseTextChange]);

  const set = (key: keyof EditState, value: unknown) => {
    let ns: any = { ...localState, [key]: value };
    if (key === "testament") ns = { ...ns, book: "", chapter: "", verseNumber: "" };
    else if (key === "book") ns = { ...ns, chapter: "", verseNumber: "" };
    else if (key === "chapter") ns = { ...ns, verseNumber: "" };
    setLocalState(ns);
    onChange(ns);
  };

  const testament = (k: string, v: string) => set(k as keyof EditState, v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />Edit Daily Verse
          </DialogTitle>
          <DialogDescription>Update the verse reference, date, and reflection below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Testament</Label>
              <Combobox options={TESTAMENTS(t)} value={localState.testament || ""} onChange={(v) => testament("testament", v)} placeholder="Select testament" width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Book</Label>
              <Combobox options={books.map((b: string) => ({ value: b, label: b }))} value={localState.book || ""} onChange={(v) => testament("book", v)} placeholder="Select book" disabled={!localState.testament} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Chapter</Label>
              <Combobox options={chapters.map((c: number) => ({ value: String(c), label: String(c) }))} value={localState.chapter} onChange={(v) => testament("chapter", v)} placeholder="Select chapter" disabled={!localState.book} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Verse</Label>
              <Combobox options={maxVerses > 0 ? Array.from({ length: maxVerses }, (_, i) => i + 1).map((v) => ({ value: String(v), label: String(v) })) : []} value={localState.verseNumber} onChange={(v) => testament("verseNumber", v)} placeholder="Select verse" disabled={!localState.chapter} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Version</Label>
              <Combobox options={BIBLE_VERSIONS.map(v => ({ value: v.id, label: `${v.name} (${v.abbreviation})` }))} value={localState.bibleVersion} onChange={(v) => testament("bibleVersion", v)} placeholder="Select version" width="w-full" />
            </div>
          </div>
          {verseTextValue && (
            <div className="space-y-1.5">
              <Label className="text-xs">Verse Text <span className="text-muted-foreground font-normal">(edit to override)</span></Label>
              <Textarea value={verseTextValue} onChange={(e) => testament("verseText", e.target.value)} className="resize-none font-serif leading-relaxed min-h-[80px]" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={localState.displayDate} onChange={(e) => testament("displayDate", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-3.5 h-3.5" />Explanation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={localState.explanation}
              onChange={(e) => testament("explanation", e.target.value)}
              rows={5}
              className="resize-none"
              placeholder="Explain what this verse means..."
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
              Learn More <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              value={localState.learnMore}
              onChange={(e) => testament("learnMore", e.target.value)}
              rows={3}
              placeholder="Additional resources..."
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSave} disabled={isSaving || !verseTextValue.trim() || !localState.explanation.trim()} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
