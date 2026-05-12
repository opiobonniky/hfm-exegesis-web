import { useState, useEffect, useMemo } from "react";
import { Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HIGHLIGHT_COLORS } from "@/hooks/useBible";
import { cn } from "@/lib/utils";

// ── Shared Verse Range Slider ─────────────────────────────────────────────────

function VerseRangeSlider({
  totalVerses,
  rangeStart,
  rangeEnd,
  onRangeChange,
  currentBook,
  currentChapter,
}: {
  totalVerses: number;
  rangeStart: number;
  rangeEnd: number;
  onRangeChange: (start: number, end: number) => void;
  currentBook: string;
  currentChapter: number | string;
}) {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-muted/40 border border-border/40">
      {/* Reference label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Verse Range
        </span>
        <span className="text-xs font-semibold text-foreground">
          {currentBook} {currentChapter}:{rangeStart}
          {rangeStart !== rangeEnd ? `–${rangeEnd}` : ""}
        </span>
      </div>

      {/* Slider */}
      <Slider
        value={[rangeStart, rangeEnd]}
        onValueChange={([start, end]) => onRangeChange(start, end)}
        min={1}
        max={totalVerses || 1}
        step={1}
        className="w-full"
      />

      {/* Start / End counters */}
      <div className="flex items-center gap-3">
        {/* Start */}
        <div className="flex-1 flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-base rounded-lg"
            onClick={() => onRangeChange(Math.max(1, rangeStart - 1), rangeEnd)}
            disabled={rangeStart <= 1}
          >
            –
          </Button>
          <div className="text-center min-w-[52px]">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
              From
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {rangeStart}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-base rounded-lg"
            onClick={() =>
              onRangeChange(Math.min(rangeEnd, rangeStart + 1), rangeEnd)
            }
            disabled={rangeStart >= rangeEnd}
          >
            +
          </Button>
        </div>

        <div className="w-px h-8 bg-border/60" />

        {/* End */}
        <div className="flex-1 flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-base rounded-lg"
            onClick={() =>
              onRangeChange(rangeStart, Math.max(rangeStart, rangeEnd - 1))
            }
            disabled={rangeEnd <= rangeStart}
          >
            –
          </Button>
          <div className="text-center min-w-[52px]">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
              To
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {rangeEnd}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-base rounded-lg"
            onClick={() =>
              onRangeChange(rangeStart, Math.min(totalVerses, rangeEnd + 1))
            }
            disabled={rangeEnd >= totalVerses}
          >
            +
          </Button>
        </div>
      </div>

      {/* Verse count pill */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {rangeEnd - rangeStart + 1} verse
          {rangeEnd - rangeStart + 1 !== 1 ? "s" : ""} selected
        </span>
      </div>
    </div>
  );
}

// ── Helper: derive range from selectedVerses keys ─────────────────────────────

function deriveRange(
  selectedVerses: string[],
  totalVerses: number,
): { start: number; end: number } {
  const nums = selectedVerses
    .map((k) => {
      const m = k.match(/:(\d+)$/);
      return m ? parseInt(m[1]) : null;
    })
    .filter((n): n is number => n !== null);

  if (nums.length > 0) {
    return {
      start: Math.min(...nums),
      end: Math.max(...nums),
    };
  }

  return { start: 1, end: 1 };
}

// ── Selected Verses Display (used when allowRange=false) ─────────────────────

function SelectedVersesDisplay({
  selectedVerses,
}: {
  selectedVerses: string[];
}) {
  const verseNums = selectedVerses
    .map((k) => {
      const m = k.match(/:(\d+)$/);
      return m ? parseInt(m[1]) : null;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  return (
    <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Selected Verses
      </span>
      <div className="flex flex-wrap gap-1.5">
        {verseNums.map((n) => (
          <span
            key={n}
            className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold"
          >
            {n}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {verseNums.length} verse{verseNums.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}

// ── HighlightPickerModal ──────────────────────────────────────────────────────

interface HighlightPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (
    colorId: number,
    color: string,
    rangeStart?: number,
    rangeEnd?: number,
  ) => void;
  totalVerses: number;
  currentBook: string;
  currentChapter: number;
  selectedVerses?: string[];
  allowRange?: boolean;
}

export function HighlightPickerModal({
  visible,
  onClose,
  onSelectColor,
  totalVerses,
  currentBook,
  currentChapter,
  selectedVerses = [],
  allowRange = true,
}: HighlightPickerModalProps) {
  const derived = useMemo(
    () => deriveRange(selectedVerses, totalVerses),
    [selectedVerses, totalVerses],
  );

  const [rangeStart, setRangeStart] = useState(derived.start);
  const [rangeEnd, setRangeEnd] = useState(derived.end);

  useEffect(() => {
    if (visible) {
      setRangeStart(derived.start);
      setRangeEnd(derived.end);
    }
  }, [visible, derived.start, derived.end]);

  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-primary" />
            Highlight Verses
          </DialogTitle>
          <DialogDescription>
            {currentBook} {currentChapter}
          </DialogDescription>
        </DialogHeader>

        {allowRange ? (
          <VerseRangeSlider
            totalVerses={totalVerses}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeChange={(s, e) => {
              setRangeStart(s);
              setRangeEnd(e);
            }}
            currentBook={currentBook}
            currentChapter={currentChapter}
          />
        ) : (
          <SelectedVersesDisplay selectedVerses={selectedVerses} />
        )}

        {/* Color grid */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                allowRange
                  ? onSelectColor(c.id, c.color, rangeStart, rangeEnd)
                  : onSelectColor(c.id, c.color)
              }
              title={c.name}
              className="aspect-square rounded-xl border-2 border-transparent hover:border-foreground/30 hover:scale-110 active:scale-95 transition-all shadow-sm"
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-sm">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── NoteModal ─────────────────────────────────────────────────────────────────

interface NoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rangeStart?: number, rangeEnd?: number) => void;
  noteText: string;
  onNoteChange: (text: string) => void;
  saving: boolean;
  currentBook: string;
  currentChapter: number;
  totalVerses?: number;
  selectedVerses?: string[];
  allowRange?: boolean;
}

export function NoteModal({
  visible,
  onClose,
  onSave,
  noteText,
  onNoteChange,
  saving,
  currentBook,
  currentChapter,
  totalVerses = 1,
  selectedVerses = [],
  allowRange = true,
}: NoteModalProps) {
  const derived = useMemo(
    () => deriveRange(selectedVerses, totalVerses),
    [selectedVerses, totalVerses],
  );

  const [rangeStart, setRangeStart] = useState(derived.start);
  const [rangeEnd, setRangeEnd] = useState(derived.end);

  useEffect(() => {
    if (visible) {
      setRangeStart(derived.start);
      setRangeEnd(derived.end);
    }
  }, [visible, derived.start, derived.end]);

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            {currentBook} {currentChapter}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {allowRange ? (
            <VerseRangeSlider
              totalVerses={totalVerses}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onRangeChange={(s, e) => {
                setRangeStart(s);
                setRangeEnd(e);
              }}
              currentBook={currentBook}
              currentChapter={currentChapter}
            />
          ) : (
            <SelectedVersesDisplay selectedVerses={selectedVerses} />
          )}

          <textarea
            value={noteText}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Enter your note..."
            className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                allowRange ? onSave(rangeStart, rangeEnd) : onSave()
              }
              disabled={saving || !noteText.trim()}
            >
              {saving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── RangePickerModal (Favorites / Copy / Share) ───────────────────────────────

export interface RangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  totalVerses: number;
  selectedVerses?: string[];
  allowRange?: boolean;
  actionLabel: string;
  onConfirm: (rangeStart?: number, rangeEnd?: number) => void;
}

export function RangePickerModal({
  visible,
  onClose,
  title,
  description,
  totalVerses,
  selectedVerses = [],
  allowRange = true,
  actionLabel,
  onConfirm,
}: RangePickerModalProps) {
  const derived = useMemo(
    () => deriveRange(selectedVerses, totalVerses),
    [selectedVerses, totalVerses],
  );

  const [rangeStart, setRangeStart] = useState(derived.start);
  const [rangeEnd, setRangeEnd] = useState(derived.end);

  useEffect(() => {
    if (visible) {
      setRangeStart(derived.start);
      setRangeEnd(derived.end);
    }
  }, [visible, derived.start, derived.end]);

  // Parse "Genesis 1" → book="Genesis", chapter="1"
  const { book, chapter } = useMemo(() => {
    if (!description) return { book: "", chapter: "" };
    const parts = description.trim().split(/\s+/);
    return {
      book: parts.slice(0, -1).join(" "),
      chapter: parts[parts.length - 1],
    };
  }, [description]);

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {allowRange ? (
          <VerseRangeSlider
            totalVerses={totalVerses}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeChange={(s, e) => {
              setRangeStart(s);
              setRangeEnd(e);
            }}
            currentBook={book || description || ""}
            currentChapter={chapter || ""}
          />
        ) : (
          <SelectedVersesDisplay selectedVerses={selectedVerses} />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              allowRange ? onConfirm(rangeStart, rangeEnd) : onConfirm();
              onClose();
            }}
          >
            {actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── SearchModal ───────────────────────────────────────────────────────────────

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: any[];
  onSelectResult: (book: string, chapter: number, verse?: number) => void;
  loading: boolean;
}

export function SearchModal({
  visible,
  onClose,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectResult,
  loading,
}: SearchModalProps) {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Bible</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search for verses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {searchQuery.length > 2
                  ? "No results found"
                  : "Type at least 3 characters to search"}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onSelectResult(result.book, result.chapter, result.verse)
                    }
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm">
                      {result.book} {result.chapter}:{result.verse}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {result.text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── ExplanationModal ──────────────────────────────────────────────────────────

interface ExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  explanation: string;
  currentBook: string;
  currentChapter: number;
}

export function ExplanationModal({
  visible,
  onClose,
  explanation,
  currentBook,
  currentChapter,
}: ExplanationModalProps) {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Verse Explanation</DialogTitle>
          <DialogDescription>
            {currentBook} {currentChapter}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm leading-relaxed">{explanation}</p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── BookSelectorModal ─────────────────────────────────────────────────────────

interface BookSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  books: string[];
  currentBook: string;
  onSelectBook: (book: string) => void;
}

export function BookSelectorModal({
  visible,
  onClose,
  books,
  currentBook,
  onSelectBook,
}: BookSelectorModalProps) {
  const BOOKS = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation",
  ];

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Book</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {BOOKS.map((book) => (
              <button
                key={book}
                onClick={() => onSelectBook(book)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm",
                  book === currentBook ? "bg-muted font-medium" : "",
                )}
              >
                {book}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── ChapterSelectorModal ──────────────────────────────────────────────────────

interface ChapterSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  maxChapters: number;
  currentChapter: number;
  onSelectChapter: (ch: number) => void;
}

export function ChapterSelectorModal({
  visible,
  onClose,
  maxChapters,
  currentChapter,
  onSelectChapter,
}: ChapterSelectorModalProps) {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Chapter</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: maxChapters }, (_, i) => i + 1).map((ch) => (
              <button
                key={ch}
                onClick={() => onSelectChapter(ch)}
                className={cn(
                  "p-2 rounded-md text-center hover:bg-muted transition-colors text-sm",
                  ch === currentChapter
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "",
                )}
              >
                {ch}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
