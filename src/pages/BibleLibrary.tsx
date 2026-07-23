import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookText,
  ChevronDown,
  Loader2,
  Search,
  ScrollText,
} from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { bibleApi, mapTranslationId } from "@/services/bibleApi";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────

interface BookInfo {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
}

type CovenantFilter = "all" | "ot" | "nt";

// ── Testament grouping ──────────────────────────────────────────────────────

const OT_BOOKS_ORDERED = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
];

const NT_BOOKS_ORDERED = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function BibleLibrary() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  const [books, setBooks] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [covenant, setCovenant] = useState<CovenantFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  // ── Load books ──
  useEffect(() => {
    (async () => {
      try {
        const backendId = mapTranslationId("Berean");
        const data = await bibleApi.getBooksWithMaxChapters(backendId);
        // Sort books by canonical order
        const sorted = data.sort((a, b) => {
          const aIdx = OT_BOOKS_ORDERED.indexOf(a.bookName);
          const bIdx = OT_BOOKS_ORDERED.indexOf(b.bookName);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          const aNtIdx = NT_BOOKS_ORDERED.indexOf(a.bookName);
          const bNtIdx = NT_BOOKS_ORDERED.indexOf(b.bookName);
          if (aNtIdx !== -1 && bNtIdx !== -1) return aNtIdx - bNtIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return a.bookName.localeCompare(b.bookName);
        });
        setBooks(sorted);
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Filtered books ──
  const filteredBooks = useMemo(() => {
    let filtered = books;

    if (covenant === "ot") {
      filtered = filtered.filter((b) => b.testament === "Old");
    } else if (covenant === "nt") {
      filtered = filtered.filter((b) => b.testament === "New");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b) =>
        b.bookName.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [books, covenant, searchQuery]);

  // ── Stats ──
  const stats = useMemo(() => {
    const otBooks = books.filter((b) => b.testament === "Old");
    const ntBooks = books.filter((b) => b.testament === "New");
    const totalChapters = books.reduce((s, b) => s + b.chaptersCount, 0);
    const totalVerses = books.reduce((s, b) => s + (b.totalVerses || 0), 0);
    return { ot: otBooks.length, nt: ntBooks.length, chapters: totalChapters, verses: totalVerses };
  }, [books]);

  // ── Handle book expand ──
  const toggleBook = useCallback((bookName: string) => {
    setExpandedBook((prev) => (prev === bookName ? null : bookName));
  }, []);

  // ── Handle chapter click ──
  const handleChapterClick = useCallback(
    (bookName: string, chapter: number) => {
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(bookName)}&chapter=${chapter}`,
      );
    },
    [navigate],
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading the Bible Library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ══════════════════ HEADER ══════════════════ */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1
                className="text-lg sm:text-xl font-bold text-foreground leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                The Bible
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Choose your path through the Word
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-2 py-0.5 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/5"
            >
              {stats.ot} OT Books
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-2 py-0.5 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
            >
              {stats.nt} NT Books
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-2 py-0.5 text-muted-foreground"
            >
              {stats.chapters} Chapters
            </Badge>
            {stats.verses > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] font-bold px-2 py-0.5 text-muted-foreground"
              >
                {stats.verses.toLocaleString()} Verses
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search for a book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-border/50"
            />
          </div>

          {/* Covenant toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/30">
            {([
              { value: "all" as CovenantFilter, label: "All Books", count: books.length },
              { value: "ot" as CovenantFilter, label: "Old Testament", count: stats.ot },
              { value: "nt" as CovenantFilter, label: "New Testament", count: stats.nt },
            ]).map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setCovenant(tab.value);
                  setExpandedBook(null);
                }}
                className={cn(
                  "                  flex-1 py-2 px-3 rounded-lg text-[11px] font-bold transition-all active:scale-[0.97] [touch-action:manipulation]",
                  covenant === tab.value
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                {tab.label}
                <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════════════ BOOK LIST ══════════════════ */}
      <div className="px-4 sm:px-6 py-4 pb-20">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {searchQuery
                ? `No books found for "${searchQuery}"`
                : "No books available"}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {searchQuery
                ? "Try a different search term"
                : "Please try again later"}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredBooks.map((book) => {
              const isExpanded = expandedBook === book.bookName;
              const chapters = Array.from(
                { length: book.chaptersCount },
                (_, i) => i + 1,
              );
              const isOt = book.testament === "Old";
              const bookColor = isOt
                ? "border-l-indigo-500 hover:border-l-indigo-400"
                : "border-l-amber-500 hover:border-l-amber-400";
              const bookAccent = isOt
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

              return (
                <div
                  key={book.bookName}
                  className={cn(
                    "rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200",
                    "hover:border-border/80 hover:shadow-sm",
                    isExpanded && "border-border shadow-sm",
                  )}
                >
                  {/* Book row */}
                  <button
                    onClick={() => toggleBook(book.bookName)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:scale-[0.99] [touch-action:manipulation]",
                      "hover:bg-muted/30",
                      "border-l-[3px]",
                      bookColor,
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        bookAccent,
                      )}
                    >
                      <BookText className="w-4 h-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {book.bookName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {book.chaptersCount} CH
                        </span>
                        {book.totalVerses > 0 && (
                          <>
                            <span className="text-[8px] text-muted-foreground/40">
                              ·
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {book.totalVerses} V
                            </span>
                          </>
                        )}
                        <span className="text-[8px] text-muted-foreground/40">
                          ·
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold px-1.5 py-0",
                            isOt
                              ? "border-indigo-500/30 text-indigo-500 bg-indigo-500/5"
                              : "border-amber-500/30 text-amber-500 bg-amber-500/5",
                          )}
                        >
                          {isOt ? "OT" : "NT"}
                        </Badge>
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Expanded chapter grid */}
                  {isExpanded && (
                    <div className="border-t border-border/30 bg-muted/20 px-4 py-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                        Select a Chapter — {book.bookName}
                      </p>
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                        {chapters.map((ch) => (
                          <button
                            key={ch}
                            onClick={() =>
                              handleChapterClick(book.bookName, ch)
                            }
                            className={cn(
                              "aspect-square rounded-lg text-xs font-semibold border transition-all duration-150",
                              "bg-card text-foreground border-border/50",
                              "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                              "active:scale-95",
                            )}
                            title={`${book.bookName} ${ch}`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-border/30">
          <ScrollText className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            {books.length} books · {stats.chapters} chapters
          </span>
          <ScrollText className="w-3 h-3 text-muted-foreground/40" />
        </div>
      </div>
    </div>
  );
}
