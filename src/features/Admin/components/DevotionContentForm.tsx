// DevotionContentForm — devotion-specific form fields for AdminDailyContent
import { Sprout, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_BOOKS } from "@/data/staticData";

interface Props {
  formTitle: string; setFormTitle: (v: string) => void;
  formContent: string; setFormContent: (v: string) => void;
  formBook: string; setFormBook: (v: string) => void;
  formChapter: string; setFormChapter: (v: string) => void;
  formVerse: string; setFormVerse: (v: string) => void;
  formChapters: number[]; formMaxVerses: number;
}
export function DevotionContentForm({
  formTitle, setFormTitle, formContent, setFormContent,
  formBook, setFormBook, formChapter, setFormChapter,
  formVerse, setFormVerse, formChapters, formMaxVerses,
}: Props) {
  const verseOptions = formMaxVerses > 0
    ? Array.from({ length: formMaxVerses }, (_, i) => i + 1).map(v => ({ value: String(v), label: String(v) }))
    : [];
  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-background pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Sprout className="w-4 h-4 text-primary" /> Devotion Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Title *</Label>
          <Input value={formTitle} onChange={e => setFormTitle(e.target.value)}
            placeholder="Devotion title" className="h-9 text-sm" />
        </div>
        {/* Content */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Content *</Label>
          <Textarea value={formContent} onChange={e => setFormContent(e.target.value)}
            placeholder="Write the devotion content..." rows={10} className="resize-none text-sm leading-relaxed" />
        </div>
        {/* Optional Bible Reference */}
        <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Optional Bible Reference</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Book</Label>
              <Combobox options={BIBLE_BOOKS.map(b => ({ value: b, label: b }))} value={formBook}
                onChange={v => { setFormBook(v || ""); setFormChapter(""); setFormVerse(""); }}
                placeholder="Select" searchPlaceholder="Search..." width="w-full" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Chapter</Label>
              <Combobox options={formChapters.map(c => ({ value: String(c), label: String(c) }))} value={formChapter}
                onChange={v => { setFormChapter(v || ""); setFormVerse(""); }}
                placeholder="Ch." disabled={formChapters.length === 0} width="w-full" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Verse</Label>
              <Combobox options={verseOptions} value={formVerse}
                onChange={v => setFormVerse(v || "")}
                placeholder="V." disabled={!formChapter || formMaxVerses === 0} width="w-full" />
            </div>
          </div>
          {formBook && formChapter && formVerse && (
            <p className="text-xs text-muted-foreground">Reference: <span className="font-semibold">{formBook} {formChapter}:{formVerse}</span></p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
