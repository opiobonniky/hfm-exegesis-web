// VerseContentForm — verse-specific form fields for AdminDailyContent
import { BookOpen, Loader2, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_BOOKS } from "@/data/staticData";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";

interface Props {
  formBook: string; setFormBook: (v: string) => void;
  formChapter: string; setFormChapter: (v: string) => void;
  formVerse: string; setFormVerse: (v: string) => void;
  verseVersion: string; setVerseVersion: (v: string) => void;
  formExplanation: string; setFormExplanation: (v: string) => void;
  formReflection: string; setFormReflection: (v: string) => void;
  formLearnMore: string; setFormLearnMore: (v: string) => void;
  formChapters: number[]; formMaxVerses: number;
  formVerseText: string; formVerseLoading: boolean;
}
export function VerseContentForm({
  formBook, setFormBook, formChapter, setFormChapter, formVerse, setFormVerse,
  verseVersion, setVerseVersion, formExplanation, setFormExplanation,
  formReflection, setFormReflection, formLearnMore, setFormLearnMore,
  formChapters, formMaxVerses, formVerseText, formVerseLoading,
}: Props) {
  const verseOptions = formMaxVerses > 0
    ? Array.from({ length: formMaxVerses }, (_, i) => i + 1).map(v => ({ value: String(v), label: String(v) }))
    : [];
  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-background pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Verse Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Book / Chapter / Verse / Translation */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Book *</Label>
            <Combobox options={BIBLE_BOOKS.map(b => ({ value: b, label: b }))} value={formBook}
              onChange={v => { setFormBook(v || ""); setFormChapter(""); setFormVerse(""); }}
              placeholder="Select book" searchPlaceholder="Search books..." width="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Chapter *</Label>
            <Combobox options={formChapters.map(c => ({ value: String(c), label: String(c) }))} value={formChapter}
              onChange={v => { setFormChapter(v || ""); setFormVerse(""); }}
              placeholder="Select chapter" disabled={formChapters.length === 0} width="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Verse *</Label>
            <Combobox options={verseOptions} value={formVerse}
              onChange={v => setFormVerse(v || "")}
              placeholder="Select verse" disabled={!formChapter || formMaxVerses === 0} width="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Translation</Label>
            <Combobox options={BIBLE_VERSIONS.map(v => ({ value: v.id, label: `${v.name} (${v.abbreviation})` }))}
              value={verseVersion} onChange={v => { if (v) setVerseVersion(v); }}
              placeholder="Select version" searchPlaceholder="Search translations..." width="w-full" />
          </div>
        </div>
        {/* Verse reference preview */}
        {formBook && formChapter && formVerse && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/[0.03] border border-primary/10 text-sm">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">{formBook} {formChapter}:{formVerse}</span>
          </div>
        )}
        {/* Verse text preview */}
        <div className="space-y-1.5">
            <Label className="flex items-center justify-between text-xs font-semibold">
              <span>Verse Text Preview</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{verseVersion}</span>
            </Label>
            <div className="relative">
              <Textarea value={formVerseText} readOnly
                className="min-h-[80px] resize-none text-sm leading-relaxed font-serif text-foreground/85 bg-muted/10 border-border/30 cursor-default"
                placeholder={formVerseLoading ? "Loading verse text..." : "Select a verse to see the text"} />
              {formVerseLoading && <div className="absolute right-3 bottom-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>}
              {formVerseText && !formVerseLoading && (
                <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/50 font-mono">{formBook} {formChapter}:{formVerse}</div>
              )}
            </div>
        </div>
        {/* Explanation */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Explanation *
          </Label>
          <Textarea value={formExplanation} onChange={e => setFormExplanation(e.target.value)}
            placeholder="Write a brief explanation of this verse..." rows={4} className="resize-none text-sm leading-relaxed" />
        </div>
        {/* Reflection */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Reflection</Label>
          <Textarea value={formReflection} onChange={e => setFormReflection(e.target.value)}
            placeholder="Optional reflection prompt..." rows={3} className="resize-none text-sm leading-relaxed" />
        </div>
        {/* Learn More */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Learn More</Label>
          <Input value={formLearnMore} onChange={e => setFormLearnMore(e.target.value)}
            placeholder="Reference or link for further reading" className="h-9 text-sm" />
        </div>
      </CardContent>
    </Card>
  );
}
