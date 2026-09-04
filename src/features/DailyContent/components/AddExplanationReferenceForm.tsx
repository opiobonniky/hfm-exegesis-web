import { BookOpen, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
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

type Model = ReturnType<typeof useAddExplanation>;

interface Props {
  model: Model;
}

const isBibleBookName = (name: string): name is BibleBookName =>
  name in BIBLE_BOOK_CHAPTERS;

export function AddExplanationReferenceForm({ model: h }: Props) {
  const bookOptions = Object.entries(BIBLE_BOOK_CHAPTERS).map(([name], i) => ({
    value: name,
    label: name,
    group: i < 39 ? "Old Testament" : "New Testament",
  }));

  const chapterOptions = isBibleBookName(h.form.bookName)
    ? Array.from(
        { length: BIBLE_BOOK_CHAPTERS[h.form.bookName] },
        (_, idx) => idx + 1,
      )
    : [];

  const translationOptions = (h.translationOptions || [])
    .filter((t) => t.languageName || t.language)
    .sort((a, b) => {
      const aLabel = (a.languageName || a.language || "").toLowerCase();
      const bLabel = (b.languageName || b.language || "").toLowerCase();
      if (aLabel === "english") return -1;
      if (bLabel === "english") return 1;
      return (
        aLabel.localeCompare(bLabel) ||
        (a.name || a.shortName).localeCompare(b.name || b.shortName)
      );
    })
    .map((t) => ({
      value: t.id,
      label: `${t.shortName || t.name} ${t.year ? `(${t.year})` : ""}`.trim(),
      group: t.languageName || t.language || "Other",
    }));

  const selectedVerse = h.form.verseNumber ? Number(h.form.verseNumber) : null;
  const verseLoadingForTrigger =
    h.verseOptionsLoading && h.verseOptions.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm font-medium">Verse reference</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium text-foreground">Book name</Label>
          <Combobox
            options={bookOptions}
            value={h.form.bookName || undefined}
            onChange={(value) =>
              h.updateField("bookName", value)
            }
            placeholder="Select book..."
            width="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Bible version</Label>
          <Select
            value={h.form.bibleVersion}
            onValueChange={(v) => h.updateField("bibleVersion", v)}
          >
            <SelectTrigger className="border-border bg-background text-foreground">
              <SelectValue placeholder="Select a Bible version" />
            </SelectTrigger>
            <SelectContent>
              {translationOptions.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Chapter</Label>
          <Select
            value={h.form.chapter || ""}
            onValueChange={(v) => {
              h.updateField("chapter", v);
              h.updateField("verseNumber", "");
            }}
            disabled={!h.form.bookName}
          >
            <SelectTrigger className="border-border bg-background text-foreground">
              <SelectValue placeholder={h.form.bookName ? "Select" : "Pick book"} />
            </SelectTrigger>
            <SelectContent>
              {chapterOptions.map((c) => (
                <SelectItem key={c} value={String(c)}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {h.form.bookName
              ? `Total chapters: ${h.maxChapterNumber}`
              : "Select a book to view chapter options"}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Verse number</Label>
          <Select
            value={selectedVerse != null ? String(selectedVerse) : ""}
            onValueChange={(v) => h.updateField("verseNumber", v)}
            disabled={
              !h.form.bookName ||
              !h.form.chapter ||
              verseLoadingForTrigger
            }
          >
            <SelectTrigger className="border-border bg-background text-foreground">
              {verseLoadingForTrigger ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue
                  placeholder={
                    !h.form.bookName
                      ? "Pick book"
                      : !h.form.chapter
                        ? "Pick chapter"
                        : "Select"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {h.verseOptions.map((v) => (
                <SelectItem key={v} value={String(v)}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {h.form.bookName && h.form.chapter
              ? `Verses in chapter: ${h.maxVerseNumber}`
              : "Select a book and chapter to view verse options"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Label className="text-sm font-semibold text-foreground">Selected verse text</Label>
          {h.verseTextLoading && <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />}
        </div>
        <div className="min-h-[80px] rounded-xl border border-border bg-background p-3 text-sm leading-relaxed text-foreground/90">
          {h.selectedVerseText ? (
            <p className="font-serif">{h.selectedVerseText}</p>
          ) : (
            <p className="text-muted-foreground italic">
              {h.form.bookName && h.form.chapter && h.form.verseNumber && h.form.bibleVersion
                ? "Verse text is loading..."
                : "Choose a book, chapter, verse, and version to preview the verse text."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
