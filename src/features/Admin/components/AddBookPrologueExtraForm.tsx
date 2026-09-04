// AddBookPrologueExtraForm — step 4: key scripture references via a dynamic
// book/chapter/verse/translation selector. The verse text is auto-filled when
// a verse is selected.
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { BIBLE_BOOK_CHAPTERS, type BibleBookName } from "@/features/Bible/constants";
import { bibleApi } from "@/services/bibleApi";
import type { AddBookPrologueModel } from "../types";

interface Props {
  model: AddBookPrologueModel;
}

const TRANSLATIONS = [
  { id: "Berean", label: "Berean Standard Bible (BSB)" },
  { id: "KJV", label: "King James Version (KJV)" },
  { id: "NIV", label: "New International Version (NIV)" },
  { id: "ESV", label: "English Standard Version (ESV)" },
  { id: "NASB", label: "New American Standard Bible (NASB)" },
];

const isBibleBookName = (name: string): name is BibleBookName =>
  name in BIBLE_BOOK_CHAPTERS;

export function AddBookPrologueExtraForm({ model: h }: Props) {
  const { keyScriptures } = h.form;
  const [verseOptions, setVerseOptions] = useState<Record<number, number[]>>({});
  const [loadingVerses, setLoadingVerses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    keyScriptures.forEach((entry, index) => {
      if (!entry.bookName || entry.chapter == null) return;
      if (verseOptions[index]) return;
      const translation = entry.translation || "Berean";
      setLoadingVerses((cur) => ({ ...cur, [index]: true }));
      bibleApi
        .getVerses(translation, entry.bookName, entry.chapter)
        .then((vd) => {
          const verses = (vd?.verses || []).map((v) => v.verseNumber);
          setVerseOptions((cur) => ({ ...cur, [index]: verses }));
        })
        .catch(() => {
          setVerseOptions((cur) => ({ ...cur, [index]: [] }));
        })
        .finally(() => {
          setLoadingVerses((cur) => ({ ...cur, [index]: false }));
        });
    });
  }, [keyScriptures, verseOptions]);

  const bookOptions = Object.entries(BIBLE_BOOK_CHAPTERS).map(([name], i) => ({
    value: name,
    label: name,
    group: i < 39 ? "Old Testament" : "New Testament",
  }));

  if (keyScriptures.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sky-600">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Key scripture references</span>
        </div>
        <p className="text-xs text-muted-foreground italic">No references yet</p>
        <Button
          type="button"
          variant="outline"
          onClick={h.addKeyScripture}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add scripture reference
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Key scripture references</span>
      </div>

      {keyScriptures.map((entry, i) => {
        const chapterOptions = isBibleBookName(entry.bookName)
          ? Array.from(
              { length: BIBLE_BOOK_CHAPTERS[entry.bookName] },
              (_, idx) => idx + 1,
            )
          : [];
        const verses = verseOptions[i] || [];
        return (
          <div
            key={`ks-${i}`}
            className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Reference #{i + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => h.removeKeyScripture(i)}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">
                Translation
              </Label>
              <Select
                value={entry.translation}
                onValueChange={(v) => h.updateKeyScripture(i, { translation: v })}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Select translation" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSLATIONS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Book</Label>
              <Combobox
                options={bookOptions}
                value={entry.bookName || undefined}
                onChange={(v) =>
                  h.updateKeyScripture(i, {
                    bookName: v,
                    chapter: null,
                    verse: null,
                    reference: "",
                    text: "",
                  })
                }
                placeholder="Select book..."
                width="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">
                  Chapter
                </Label>
                <Select
                  value={entry.chapter != null ? String(entry.chapter) : ""}
                  onValueChange={(v) =>
                    h.updateKeyScripture(i, {
                      chapter: Number(v),
                      verse: null,
                      reference: "",
                      text: "",
                    })
                  }
                  disabled={!entry.bookName}
                >
                  <SelectTrigger className="border-border bg-background text-foreground">
                    <SelectValue placeholder={entry.bookName ? "Select" : "Pick book"} />
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

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Verse</Label>
                <Select
                  value={entry.verse != null ? String(entry.verse) : ""}
                  onValueChange={(v) =>
                    h.pickVerseForKeyScripture(i, Number(v))
                  }
                  disabled={
                    !entry.bookName ||
                    entry.chapter == null ||
                    (loadingVerses[i] && verses.length === 0)
                  }
                >
                  <SelectTrigger className="border-border bg-background text-foreground">
                    {loadingVerses[i] && verses.length === 0 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue
                        placeholder={
                          entry.chapter == null ? "Pick chapter" : "Select"
                        }
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
            </div>

            {entry.reference && (
              <p className="text-sm font-semibold text-sky-600">
                {entry.reference}
              </p>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">
                Verse Text (auto-filled)
              </Label>
              <div className="rounded-lg border border-border bg-background p-3 text-sm text-foreground min-h-[48px]">
                {entry.text ||
                  "Select a verse to load its text automatically."}
              </div>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={h.addKeyScripture}
        className="gap-2"
      >
        <Plus className="w-4 h-4" /> Add scripture reference
      </Button>
    </div>
  );
}
