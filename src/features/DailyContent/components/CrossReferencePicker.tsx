import { useCallback, useEffect, useRef, useState } from "react";
import { Link as LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { bibleApi } from "@/services/bibleApi";
import {
  BIBLE_BOOK_CHAPTERS,
  type BibleBookName,
} from "@/features/Bible/constants";

interface CrossReferenceItem {
  bookName: string;
  chapter: number;
  verseNumber: number;
  referenceText: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  bibleVersion: string;
  isRtl: boolean;
}

const bookOptions = Object.keys(BIBLE_BOOK_CHAPTERS).map((bookName, index) => ({
  value: bookName,
  label: bookName,
  group: index < 39 ? "Old Testament" : "New Testament",
}));

function parseReferences(value: string): CrossReferenceItem[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [reference, ...textParts] = line.split(/\s+[—-]\s+/);
      const match = reference.match(/^(.+?)\s+(\d+)(?::|\s)(\d+)$/);
      return {
        bookName: match?.[1] || "",
        chapter: match ? Number(match[2]) : 0,
        verseNumber: match ? Number(match[3]) : 0,
        referenceText: textParts.join(" — ") || (!match ? line : ""),
      };
    });
}

function serializeReferences(items: CrossReferenceItem[]) {
  return items
    .filter((item) => item.bookName && item.chapter && item.verseNumber)
    .map((item) => {
      const reference = `${item.bookName} ${item.chapter}:${item.verseNumber}`;
      return item.referenceText.trim()
        ? `${reference} — ${item.referenceText.trim()}`
        : reference;
    })
    .join("\n");
}

export function CrossReferencePicker({
  value,
  onChange,
  bibleVersion,
  isRtl,
}: Props) {
  const [items, setItems] = useState<CrossReferenceItem[]>(() =>
    parseReferences(value),
  );
  const [verseOptions, setVerseOptions] = useState<Record<number, number[]>>(
    {},
  );
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const loadedVerseKeys = useRef(new Set<string>());

  useEffect(() => {
    const parsed = parseReferences(value);
    // Keep incomplete local rows while the user is choosing book/chapter/verse.
    // They intentionally serialize to an empty string until a verse is chosen.
    if (
      value.trim() !== serializeReferences(items).trim() &&
      value.trim() !== ""
    ) {
      setItems(parsed);
    }
    // The serialized value is the source of truth when explanation auto-fill runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateItems = (next: CrossReferenceItem[]) => {
    setItems(next);
    onChange(serializeReferences(next));
  };

  const updateItem = (index: number, patch: Partial<CrossReferenceItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    updateItems(next);
  };

  const loadVerses = useCallback(
    async (index: number, bookName: string, chapter: number) => {
      if (!bookName || !chapter) return;
      setLoading((current) => ({ ...current, [index]: true }));
      try {
        const translation = bibleVersion || "BSB";
        let result = await bibleApi.getVerses(translation, bookName, chapter);
        // Some bundled translations do not contain every book/chapter. The
        // reference is still valid, so use KJV for the selectable verse list.
        if (
          (!result.verses || result.verses.length === 0) &&
          translation !== "KJV"
        ) {
          result = await bibleApi.getVerses("KJV", bookName, chapter);
        }
        setVerseOptions((current) => ({
          ...current,
          [index]: (result.verses || []).map((verse) => verse.verseNumber),
        }));
      } catch {
        try {
          const fallback = await bibleApi.getVerses("KJV", bookName, chapter);
          setVerseOptions((current) => ({
            ...current,
            [index]: (fallback.verses || []).map((verse) => verse.verseNumber),
          }));
        } catch {
          setVerseOptions((current) => ({ ...current, [index]: [] }));
        }
      } finally {
        setLoading((current) => ({ ...current, [index]: false }));
      }
    },
    [bibleVersion],
  );

  // Existing explanation references already have a chapter and verse, but
  // their dropdown options still need to be loaded when this component mounts.
  // Previously options were fetched only after manually changing the chapter.
  useEffect(() => {
    const translation = bibleVersion || "BSB";
    items.forEach((item, index) => {
      if (!item.bookName || !item.chapter) return;
      const key = `${translation}:${item.bookName}:${item.chapter}`;
      if (loadedVerseKeys.current.has(key)) return;
      loadedVerseKeys.current.add(key);
      void loadVerses(index, item.bookName, item.chapter);
    });
  }, [items, bibleVersion, loadVerses]);

  const selectVerse = async (index: number, verseNumber: number) => {
    const item = items[index];
    const selectedItem = { ...item, verseNumber };
    const selectedItems = [...items];
    selectedItems[index] = selectedItem;
    updateItems(selectedItems);
    try {
      const translation = bibleVersion || "BSB";
      let result = await bibleApi.getVerse(
        translation,
        item.bookName,
        item.chapter,
        verseNumber,
      );
      if (!result?.text && translation !== "KJV") {
        result = await bibleApi.getVerse(
          "KJV",
          item.bookName,
          item.chapter,
          verseNumber,
        );
      }
      const next = [...selectedItems];
      next[index] = { ...selectedItem, referenceText: result.text || "" };
      updateItems(next);
    } catch {
      updateItems(selectedItems);
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <LinkIcon className="h-4 w-4 text-sky-500" />
        Cross references
        <span className="text-xs font-normal text-muted-foreground">
          Select a book, chapter, and verse to quote it automatically.
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm italic text-muted-foreground">
          No cross references added yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const maxChapter =
              BIBLE_BOOK_CHAPTERS[item.bookName as BibleBookName] || 0;
            const chapters = Array.from(
              { length: maxChapter },
              (_, chapter) => chapter + 1,
            );
            const verses = verseOptions[index] || [];
            const verseLoading = loading[index] && verses.length === 0;

            return (
              <div
                key={`${index}-${item.bookName}`}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="grid gap-3 md:grid-cols-12 md:items-end">
                  <div className="space-y-2 md:col-span-5">
                    <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Book
                    </Label>
                    <Combobox
                      options={bookOptions}
                      value={item.bookName || undefined}
                      onChange={(bookName) => {
                        updateItem(index, {
                          bookName,
                          chapter: 0,
                          verseNumber: 0,
                          referenceText: "",
                        });
                        setVerseOptions((current) => ({
                          ...current,
                          [index]: [],
                        }));
                      }}
                      placeholder="Select book..."
                      width="w-full"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Chapter
                    </Label>
                    <Select
                      value={item.chapter ? String(item.chapter) : ""}
                      onValueChange={(chapter) => {
                        const selectedChapter = Number(chapter);
                        updateItem(index, {
                          chapter: selectedChapter,
                          verseNumber: 0,
                          referenceText: "",
                        });
                        loadVerses(index, item.bookName, selectedChapter);
                      }}
                      disabled={!item.bookName}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={item.bookName ? "Select" : "Pick book"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter} value={String(chapter)}>
                            {chapter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Verse
                    </Label>
                    <Select
                      value={item.verseNumber ? String(item.verseNumber) : ""}
                      onValueChange={(verse) =>
                        selectVerse(index, Number(verse))
                      }
                      disabled={!item.bookName || !item.chapter || verseLoading}
                    >
                      <SelectTrigger>
                        {verseLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Select" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {verses.map((verse) => (
                          <SelectItem key={verse} value={String(verse)}>
                            {verse}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-500/10 md:col-span-1"
                    onClick={() =>
                      updateItems(
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="Remove cross reference"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Textarea
                  value={item.referenceText}
                  onChange={(event) =>
                    updateItem(index, { referenceText: event.target.value })
                  }
                  rows={3}
                  className="mt-3 resize-y"
                  placeholder={
                    item.verseNumber
                      ? "Verse text will be filled automatically..."
                      : "Select a verse to fill its text."
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() =>
          updateItems([
            ...items,
            { bookName: "", chapter: 0, verseNumber: 0, referenceText: "" },
          ])
        }
      >
        <Plus className="h-3 w-3" /> Add reference
      </Button>
    </div>
  );
}
