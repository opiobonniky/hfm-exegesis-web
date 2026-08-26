"use client";

import { useState, useMemo } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
interface BookPickerProps {
  books: { bookNumber: number; bookName: string; maxChapter: number }[];
  selectedBook: string;
  selectedChapter: number;
  onSelect: (book: string, chapter: number) => void;
  loading?: boolean;
}
export default function BookPicker({
  books,
  selectedBook,
  selectedChapter,
  onSelect,
  loading,
}: BookPickerProps) {
  const [search, setSearch] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBook);
  const { t } = useLanguage();
  const grouped = useMemo(() => {
    const ot = books.filter((b) => b.bookNumber <= 39);
    const nt = books.filter((b) => b.bookNumber > 39);
    return { ot, nt };
  }, [books]);
  const filter = (b: { bookName: string }) =>
    !search || b.bookName.toLowerCase().includes(search.toLowerCase());
  const renderSection = (title: string, bookList: typeof books) => {
    const filtered = bookList.filter(filter);
    if (filtered.length === 0) return null;
    return (
      <div key={title}>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
          {title}
        </p>
        {filtered.map((book) => {
          const isExpanded = expandedBook === book.bookName;
          const isSelected = book.bookName === selectedBook;
          return (
            <div key={book.bookName}>
              <button
                type="button"
                onClick={() => {
                  setExpandedBook(isExpanded ? null : book.bookName);
                  onSelect(book.bookName, 1);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted",
                )}
                aria-expanded={isExpanded}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{book.bookName}</span>
              </button>
              {isExpanded && (
                <div className="flex flex-wrap gap-1 px-2 py-1 ms-5">
                  {Array.from({ length: book.maxChapter }, (_, i) => i + 1).map((ch) => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => onSelect(book.bookName, ch)}
                      className={cn(
                        "w-9 h-9 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected && ch === selectedChapter
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                      aria-label={`${book.bookName}, ${t.bibleReader.chapterLabel.replace("{n}", String(ch))}`}
                      aria-current={isSelected && ch === selectedChapter ? "page" : undefined}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={t.bibleReader.filterBooks}
            aria-label={t.bibleReader.filterBooks}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-8 pe-8 h-9 text-xs"
          />
          {search && (
            <button type="button" aria-label="Clear book search" onClick={() => setSearch("")} className="absolute end-2 top-1/2 -translate-y-1/2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1 space-y-1">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {renderSection("Old Testament", grouped.ot)}
            {renderSection("New Testament", grouped.nt)}
          </>
        )}
      </div>
    </div>
  );
}
