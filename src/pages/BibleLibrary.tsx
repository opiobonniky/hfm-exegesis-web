import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookText,
  ChevronDown,
  Loader2,
  Search,
  ScrollText,
  X,
  Scroll,
  Library,
  Bookmark,
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

// ── Helpers ─────────────────────────────────────────────────────────────────

const BOOK_ABBREVIATIONS: Record<string, string> = {
  Genesis: "Gen", Exodus: "Ex", Leviticus: "Lev", Numbers: "Num", Deuteronomy: "Deut",
  Joshua: "Josh", Judges: "Judg", Ruth: "Ruth", "1 Samuel": "1 Sam", "2 Samuel": "2 Sam",
  "1 Kings": "1 Kings", "2 Kings": "2 Kings", "1 Chronicles": "1 Chr", "2 Chronicles": "2 Chr",
  Ezra: "Ezra", Nehemiah: "Neh", Esther: "Esth", Job: "Job", Psalms: "Ps",
  Proverbs: "Prov", Ecclesiastes: "Eccl", "Song of Solomon": "Song", Isaiah: "Isa",
  Jeremiah: "Jer", Lamentations: "Lam", Ezekiel: "Ezek", Daniel: "Dan",
  Hosea: "Hos", Joel: "Joel", Amos: "Amos", Obadiah: "Obad", Jonah: "Jonah",
  Micah: "Mic", Nahum: "Nah", Habakkuk: "Hab", Zephaniah: "Zeph",
  Haggai: "Hag", Zechariah: "Zech", Malachi: "Mal",
  Matthew: "Matt", Mark: "Mark", Luke: "Luke", John: "John", Acts: "Acts",
  Romans: "Rom", "1 Corinthians": "1 Cor", "2 Corinthians": "2 Cor", Galatians: "Gal",
  Ephesians: "Eph", Philippians: "Phil", Colossians: "Col", "1 Thessalonians": "1 Thess",
  "2 Thessalonians": "2 Thess", "1 Timothy": "1 Tim", "2 Timothy": "2 Tim",
  Titus: "Titus", Philemon: "Philem", Hebrews: "Heb", James: "James",
  "1 Peter": "1 Pet", "2 Peter": "2 Pet", "1 John": "1 John", "2 John": "2 John",
  "3 John": "3 John", Jude: "Jude", Revelation: "Rev",
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function BibleLibrary() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const searchRef = useRef<HTMLInputElement>(null);

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
    if (covenant === "ot") filtered = filtered.filter((b) => b.testament === "Old");
    else if (covenant === "nt") filtered = filtered.filter((b) => b.testament === "New");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b) => b.bookName.toLowerCase().includes(q));
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

  const toggleBook = useCallback((bookName: string) => {
    setExpandedBook((prev) => (prev === bookName ? null : bookName));
  }, []);

  const handleChapterClick = useCallback(
    (bookName: string, chapter: number) => {
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(bookName)}&chapter=${chapter}`,
      );
    },
    [navigate],
  );

  const covenantTabs = useMemo(
    () => [
      { value: "all" as CovenantFilter, label: "All Books", count: books.length, icon: Library },
      { value: "ot" as CovenantFilter, label: "Old Testament", count: stats.ot, icon: Scroll },
      { value: "nt" as CovenantFilter, label: "New Testament", count: stats.nt, icon: Bookmark },
    ],
    [books.length, stats.ot, stats.nt],
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary/20 animate-ping" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Loading the Bible Library</p>
            <p className="text-xs text-muted-foreground mt-1">Preparing the books of the Bible...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-muted/20" dir={isRtl ? "rtl" : "ltr"}>
      {/* ══════════════════ HEADER ══════════════════ */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-background via-background/98 to-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 flex items-center justify-center shrink-0 border border-indigo-500/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-card" />
              </div>
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold text-foreground leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                The Bible
              </h1>
              <p className="text-[11px] text-muted-foreground/70 tracking-wider mt-0.5">
                <span className="text-indigo-500 dark:text-indigo-400 font-semibold">66 books</span>
                {" "}·{" "}
                <span className="text-amber-500 dark:text-amber-400 font-semibold">
                  {stats.chapters} chapters
                </span>
                {stats.verses > 0 && (
                  <>
                    {" "}· <span className="font-semibold">{stats.verses.toLocaleString()} verses</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <Input
              ref={searchRef}
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 text-sm bg-muted/40 border-border/40 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Covenant toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/30">
            {covenantTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = covenant === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setCovenant(tab.value);
                    setExpandedBook(null);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all duration-200",
                    "active:scale-[0.97] [touch-action:manipulation]",
                    isActive
                      ? "bg-background text-foreground shadow-sm border border-border/40"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground/50")} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.value === "all" ? "All" : tab.value === "ot" ? "OT" : "NT"}
                  </span>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/50 text-muted-foreground/60",
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ══════════════════ BOOK LIST ══════════════════ */}
      <div className="px-4 sm:px-6 py-4 pb-24 max-w-4xl mx-auto">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-amber-500/10 flex items-center justify-center mb-6 border border-border/30">
              <ScrollText className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">
              {searchQuery
                ? `No books for "${searchQuery}"`
                : "No books available"}
            </h3>
            <p className="text-sm text-muted-foreground/60 max-w-xs">
              {searchQuery
                ? "Try searching for a different book name"
                : "Please try again later"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map((book, idx) => {
              const isExpanded = expandedBook === book.bookName;
              const chapters = Array.from({ length: book.chaptersCount }, (_, i) => i + 1);
              const isOt = book.testament === "Old";

              return (
                <div
                  key={book.bookName}
                  className={cn(
                    "group rounded-xl border bg-card overflow-hidden transition-all duration-200",
                    "hover:border-border/70 hover:shadow-sm",
                    isExpanded
                      ? "border-border/70 shadow-md ring-1 ring-border/30"
                      : "border-border/40",
                  )}
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  {/* Book row */}
                  <button
                    onClick={() => toggleBook(book.bookName)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left transition-all duration-150",
                      "hover:bg-muted/20 active:scale-[0.995] [touch-action:manipulation]",
                      "border-l-[3px]",
                      isOt
                        ? "border-l-indigo-500/60 hover:border-l-indigo-500"
                        : "border-l-amber-500/60 hover:border-l-amber-500",
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        "group-hover:scale-105",
                        isOt
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/15"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/15",
                      )}
                    >
                      <BookText className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/40 font-mono font-medium tabular-nums shrink-0">
                          {String(book.bookNumber).padStart(2, "0")}
                        </span>
                        <p className="text-sm font-bold text-foreground truncate">
                          {book.bookName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 ml-8">
                        <span className="text-[10px] font-semibold text-muted-foreground/60">
                          {book.chaptersCount} {book.chaptersCount === 1 ? "chapter" : "chapters"}
                        </span>
                        {book.totalVerses > 0 && (
                          <>
                            <span className="text-[8px] text-muted-foreground/30">·</span>
                            <span className="text-[10px] font-semibold text-muted-foreground/60">
                              {book.totalVerses} verses
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                      isExpanded
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground/40 group-hover:text-muted-foreground/70",
                    )}>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded chapter grid */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="border-t border-border/20 bg-gradient-to-b from-muted/30 to-muted/10 px-4 sm:px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
                          {book.bookName} — Chapters
                        </p>
                        <span className="text-[9px] text-muted-foreground/40 font-medium">
                          {book.chaptersCount} total
                        </span>
                      </div>
                      <div
                        className={cn(
                          "grid gap-1.5",
                          book.chaptersCount <= 10
                            ? "grid-cols-5 sm:grid-cols-10"
                            : book.chaptersCount <= 22
                            ? "grid-cols-5 sm:grid-cols-11"
                            : "grid-cols-6 sm:grid-cols-12 md:grid-cols-15",
                        )}
                      >
                        {chapters.map((ch) => (
                          <button
                            key={ch}
                            onClick={() => handleChapterClick(book.bookName, ch)}
                            className={cn(
                              "relative flex items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold border transition-all duration-150",
                              "bg-card text-foreground/80 border-border/40",
                              "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-sm hover:-translate-y-0.5",
                              "active:translate-y-0 active:scale-95",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            )}
                            title={`${book.bookName} ${ch}`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filteredBooks.length > 0 && (
          <div className="flex flex-col items-center gap-2 mt-10 pt-5 border-t border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/10 flex items-center justify-center">
                <ScrollText className="w-3 h-3 text-indigo-500/60" />
              </div>
              <span className="text-[11px] text-muted-foreground/50 font-medium">
                {filteredBooks.length} of {books.length} books
              </span>
              <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                <ScrollText className="w-3 h-3 text-amber-500/60" />
              </div>
            </div>
            <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500/20 via-primary/20 to-amber-500/20" />
          </div>
        )}
      </div>
    </div>
  );
}
