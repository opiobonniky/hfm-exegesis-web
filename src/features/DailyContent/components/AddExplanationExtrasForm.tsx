import { Link as LinkIcon, Plus, Tag, Target, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReturnType } from "react";
import { BIBLE_BOOK_CHAPTERS, type BibleBookName } from "@/features/Bible/constants";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { CharCount } from "./CharCount";

type Model = ReturnType<typeof useAddExplanation>;

interface Props {
  model: Model;
}

const isBibleBookName = (name: string): name is BibleBookName =>
  name in BIBLE_BOOK_CHAPTERS;

const bookOptions = Object.entries(BIBLE_BOOK_CHAPTERS).map(([name], i) => ({
  value: name,
  label: name,
  group: i < 39 ? "Old Testament" : "New Testament",
}));

const APP_MAX = 5000;
const COMMENTARY_MAX = 8000;
const FINAL_THOUGHTS_MAX = 10000;

export function AddExplanationExtrasForm({ model: h }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sky-600">
        <Tag className="h-4 w-4" />
        <span className="text-sm font-medium">Additional value</span>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="mb-4 flex items-center gap-2 text-foreground">
          <Target className="h-4 w-4 text-sky-600" />
          <span className="font-semibold">Practical applications</span>
        </div>

        {h.form.practicalApps.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No applications added yet.</p>
        ) : (
          <div className="space-y-3">
            {h.form.practicalApps.map((pa, i) => (
              <div key={i} className="flex gap-2 items-start rounded-xl border border-border bg-background p-3">
                <span className="mt-2 w-6 text-right text-sm font-bold text-sky-600">{i + 1}.</span>
                <div className="flex-1 space-y-1">
                  <Textarea value={pa.applicationText} onChange={(e) => h.updatePracticalApp(i, e.target.value)} rows={3} maxLength={APP_MAX} className="w-full resize-y border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  <div className="flex justify-end"><CharCount value={pa.applicationText} max={APP_MAX} /></div>
                </div>
                <Button variant="ghost" size="icon" className="mt-1 text-red-500 hover:bg-red-500/10" onClick={() => h.removePracticalApp(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" className="gap-2 mt-4" onClick={h.addPracticalApp}>
          <Plus className="h-3 w-3" /> Add point
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <LinkIcon className="h-4 w-4 text-sky-600" />
            <span className="font-semibold">Cross references</span>
          </div>
        </div>

        {h.form.crossReferences.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No cross references added yet.</p>
        ) : (
          <div className="space-y-3">
            {h.form.crossReferences.map((cr, i) => {
              const chapterOptions = isBibleBookName(cr.bookName)
                ? Array.from({ length: BIBLE_BOOK_CHAPTERS[cr.bookName] }, (_, idx) => idx + 1)
                : [];
              const verses = h.crossRefVerseOptions[i]?.verses || [];
              const verseLoading = h.crossRefVerseLoading[i] && verses.length === 0;

              return (
                <div key={i} className="rounded-xl border border-border bg-background p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
                    <div className="space-y-2 md:col-span-5">
                      {i === 0 && <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Book</Label>}
                      <Combobox
                        options={bookOptions}
                        value={cr.bookName || undefined}
                        onChange={(v) => {
                          h.updateCrossRef(i, "bookName", v);
                          h.updateCrossRef(i, "chapter", 0);
                          h.updateCrossRef(i, "verseNumber", 0);
                          if (cr.referenceText) h.updateCrossRef(i, "referenceText", "");
                        }}
                        placeholder="Select book..."
                        width="w-full"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      {i === 0 && <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chapter</Label>}
                      <Select
                        value={cr.chapter ? String(cr.chapter) : ""}
                        onValueChange={(v) => {
                          h.updateCrossRef(i, "chapter", Number(v));
                          h.updateCrossRef(i, "verseNumber", 0);
                          if (cr.referenceText) h.updateCrossRef(i, "referenceText", "");
                        }}
                        disabled={!cr.bookName}
                      >
                        <SelectTrigger className="border-border bg-background text-foreground">
                          <SelectValue placeholder={cr.bookName ? "Select" : "Pick book"} />
                        </SelectTrigger>
                        <SelectContent>
                          {chapterOptions.map((c) => (
                            <SelectItem key={c} value={String(c)}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      {i === 0 && <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Verse</Label>}
                      <Select
                        value={cr.verseNumber ? String(cr.verseNumber) : ""}
                        onValueChange={(v) =>
                          h.pickCrossRefVerse(i, Number(v))
                        }
                        disabled={!cr.bookName || !cr.chapter || verseLoading}
                      >
                        <SelectTrigger className="border-border bg-background text-foreground">
                          {verseLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SelectValue
                              placeholder={!cr.bookName ? "Pick book" : !cr.chapter ? "Pick chapter" : "Select"}
                            />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {verses.map((v) => (
                            <SelectItem key={v} value={String(v)}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end md:col-span-1">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => h.removeCrossRef(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reference text (auto-filled)</Label>
                    <Textarea placeholder={cr.verseNumber ? "Loading verse text..." : "Select a verse to auto-fill its text, or type it manually."} value={cr.referenceText} onChange={(e) => h.updateCrossRef(i, "referenceText", e.target.value)} rows={2} className="w-full resize-y border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Commentary</Label>
                      <CharCount value={cr.commentary} max={COMMENTARY_MAX} />
                    </div>
                    <Textarea placeholder="Commentary" value={cr.commentary} onChange={(e) => h.updateCrossRef(i, "commentary", e.target.value)} rows={3} maxLength={COMMENTARY_MAX} className="w-full resize-y border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button variant="outline" size="sm" className="gap-2 mt-4" onClick={h.addCrossRef}>
          <Plus className="h-3 w-3" /> Add ref
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="mb-4 flex items-center gap-2 text-foreground">
          <Tag className="h-4 w-4 text-sky-600" />
          <span className="font-semibold">Key themes</span>
        </div>

        {h.form.themes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No themes added yet.</p>
        ) : (
          <div className="space-y-2">
            {h.form.themes.map((t, i) => (
              <div key={i} className="flex gap-2 items-center rounded-xl border border-border bg-background p-2">
                <Input className="flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground" placeholder="e.g., Covenant Faithfulness" value={t.themeName} onChange={(e) => h.updateTheme(i, e.target.value)} />
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => h.removeTheme(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" className="gap-2 mt-4" onClick={h.addTheme}>
          <Plus className="h-3 w-3" /> Add theme
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base font-semibold text-foreground">Final thoughts</Label>
          <CharCount value={h.form.studyMetadata.finalThoughts} max={FINAL_THOUGHTS_MAX} />
        </div>
        <Textarea placeholder="Closing encouragement or application..." value={h.form.studyMetadata.finalThoughts} onChange={(e) => h.updateNested("studyMetadata", "finalThoughts", e.target.value)} rows={8} maxLength={FINAL_THOUGHTS_MAX} className="mt-2 resize-y border-border bg-background text-foreground placeholder:text-muted-foreground" />
      </div>
    </div>
  );
}
