import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HIGHLIGHT_COLORS } from "@/hooks/useBible";

interface HighlightPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (colorId: number, color: string) => void;
}

export function HighlightPickerModal({
  visible,
  onClose,
  onSelectColor,
}: HighlightPickerModalProps) {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Highlight Color</DialogTitle>
          <DialogDescription>
            Choose a color to highlight the selected verse(s)
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-3 py-4">
          {HIGHLIGHT_COLORS.map((col) => (
            <button
              key={col.id}
              onClick={() => onSelectColor(col.id, col.color)}
              className="w-12 h-12 rounded-full border-2 border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: col.color }}
              title={col.name}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

interface NoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  noteText: string;
  onNoteChange: (text: string) => void;
  saving: boolean;
  selectedVerses: string[];
  currentBook: string;
  currentChapter: number;
}

export function NoteModal({
  visible,
  onClose,
  onSave,
  noteText,
  onNoteChange,
  saving,
  selectedVerses,
  currentBook,
  currentChapter,
}: NoteModalProps) {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            {currentBook} {currentChapter}:{selectedVerses.join(", ")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            value={noteText}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Enter your note..."
            className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                  book === currentBook ? "bg-muted font-medium" : ""
                }`}
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
                className={`p-2 rounded-md text-center hover:bg-muted transition-colors ${
                  ch === currentChapter ? "bg-primary text-primary-foreground" : ""
                }`}
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