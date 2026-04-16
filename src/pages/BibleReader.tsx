import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Book, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BIBLE_VERSIONS,
  DEFAULT_VERSION_ID,
  getVersionById,
} from "@/assets/bibleVersion/json/bibleVersions";

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
  "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
  "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John",
  "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

interface BibleData {
  [key: string]: string;
}

interface ChapterData {
  book: string;
  chapter: number;
  verses: { key: string; text: string; num: number }[];
}

const VERSION_FILES: Record<string, () => Promise<{ default: BibleData }>> = {
  KJV: () => import("@/assets/bibleVersion/json/verses-kjv.json"),
  WEB: () => import("@/assets/bibleVersion/json/verses-web.json"),
  ASV: () => import("@/assets/bibleVersion/json/verses-asv.json"),
  BBE: () => import("@/assets/bibleVersion/json/verses-bbe.json"),
  YLT: () => import("@/assets/bibleVersion/json/verses-ylt.json"),
};

function processVerses(verses: BibleData, book: string, chapter: number) {
  const chapterVerses = Object.entries(verses)
    .filter(([key]) => key.startsWith(`${book} ${chapter}:`))
    .sort((a, b) => {
      const verseNumA = parseInt(a[0].split(":")[1]);
      const verseNumB = parseInt(b[0].split(":")[1]);
      return verseNumA - verseNumB;
    })
    .map(([key, text]) => ({
      key,
      text,
      num: parseInt(key.split(":")[1]),
    }));
  return chapterVerses;
}

function renderVerseText(text: string) {
  return text.split("[").map((part, idx) => {
    if (idx === 0) return part;
    const closeBracket = part.indexOf("]");
    if (closeBracket === -1) return part;
    const content = part.substring(0, closeBracket);
    return (
      <span key={idx} className="italic text-muted-foreground">
        {content}
      </span>
    );
  });
}

export default function BibleReader() {
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [versionId, setVersionId] = useState(DEFAULT_VERSION_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});

  const currentVersion = useMemo(() => getVersionById(versionId), [versionId]);

  const maxChapters: Record<string, number> = useMemo(() => ({
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
    "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
    "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42,
    "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8,
    "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48,
    "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1,
    "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3,
    "Haggai": 2, "Zechariah": 14, "Malachi": 4,
    "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
    "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
    "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5,
    "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3,
    "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3,
    "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
  }), []);

  const maxChapter = maxChapters[selectedBook] || 1;
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter < maxChapter ? currentChapter + 1 : null;

  const loadChapters = useCallback(async (book: string, startChapter: number, count: number) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const module = await VERSION_FILES[versionId]();
      const verses = module.default;
      const loadedChapters: ChapterData[] = [];
      
      for (let i = 0; i < count; i++) {
        const ch = startChapter + i;
        if (ch > maxChapters[book]) break;
        
        const chapterVerses = processVerses(verses, book, ch);
        if (chapterVerses.length > 0) {
          loadedChapters.push({ book, chapter: ch, verses: chapterVerses });
        }
      }
      
      setChapters(prev => {
        const existingKeys = new Set(prev.map(c => `${c.book}-${c.chapter}`));
        const newChapters = loadedChapters.filter(c => !existingKeys.has(`${c.book}-${c.chapter}`));
        return [...prev, ...newChapters];
      });
      
      setHasMore(loadedChapters.length === count);
    } catch (error) {
      console.error("Failed to load chapters:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, versionId, maxChapters]);

  useEffect(() => {
    setChapters([]);
    loadChapters(selectedBook, 1, 5);
  }, [selectedBook, versionId]);

  useEffect(() => {
    const chapterKey = `${selectedBook}-${currentChapter}`;
    const chapterElement = chapterRefs.current[chapterKey];
    if (chapterElement) {
      chapterElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentChapter, selectedBook]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const lastChapter = chapters[chapters.length - 1];
          if (lastChapter) {
            loadChapters(lastChapter.book, lastChapter.chapter + 1, 5);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [chapters, hasMore, loading, loadChapters]);

  useEffect(() => {
    const visibleChapterRefs = new Map<string, HTMLDivElement>();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute("data-chapter-key");
            if (key) {
              const [book, ch] = key.split("-");
              setCurrentChapter(parseInt(ch));
            }
          }
        });
      },
      { rootMargin: "-20% 0px -20% 0px", threshold: 0 }
    );

    Object.values(chapterRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapters]);

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return BOOKS;
    const query = searchQuery.toLowerCase();
    return BOOKS.filter(book => book.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setCurrentChapter(1);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b p-4 space-y-4 bg-background sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Bible Reader</h1>
          </div>

          <div className="flex items-center gap-3">
            <Select value={versionId} onValueChange={setVersionId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_VERSIONS.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name} ({version.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedBook} onValueChange={handleBookChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select book" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[300px]">
                  {filteredBooks.map((book) => (
                    <SelectItem key={book} value={book}>
                      {book}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>

            <Select
              value={currentChapter.toString()}
              onValueChange={(val) => setCurrentChapter(parseInt(val))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {Array.from({ length: maxChapter }, (_, i) => i + 1).map((ch) => (
                    <SelectItem key={ch} value={ch.toString()}>
                      Chapter {ch}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => prevChapter && setCurrentChapter(prevChapter)}
            disabled={!prevChapter}
            className="flex flex-col items-center h-auto py-2 px-4"
          >
            <ChevronLeft className="w-5 h-5 mb-1" />
            <span className="text-xs">Previous</span>
            {prevChapter && (
              <span className="text-xs font-medium text-muted-foreground">
                Ch. {prevChapter}
              </span>
            )}
          </Button>

          <div className="flex flex-col items-center px-4">
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4 text-primary" />
              <span className="font-semibold">{selectedBook}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Chapter {currentChapter} of {maxChapter} · {currentVersion.abbreviation}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {nextChapter && (
                <span>Next: Chapter {nextChapter}</span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => nextChapter && setCurrentChapter(nextChapter)}
            disabled={!nextChapter}
            className="flex flex-col items-center h-auto py-2 px-4"
          >
            <ChevronRight className="w-5 h-5 mb-1" />
            <span className="text-xs">Next</span>
            {nextChapter && (
              <span className="text-xs font-medium text-muted-foreground">
                Ch. {nextChapter}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={contentRef} className="max-w-6xl mx-auto px-8 py-8">
          {chapters.length === 0 && loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-[95%]" />
                    <Skeleton className="h-6 w-[90%]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {chapters.map((chapter) => (
                <div 
                  key={`${chapter.book}-${chapter.chapter}`}
                  data-chapter-key={`${chapter.book}-${chapter.chapter}`}
                  ref={(el) => { if (el) chapterRefs.current[`${chapter.book}-${chapter.chapter}`] = el; }}
                  className="mb-16"
                >
                  <div className="mb-6 pb-4 border-b border-border/50">
                    <h2 className="text-2xl font-bold text-center">{chapter.book}</h2>
                    <p className="text-center text-muted-foreground mt-1 text-lg">
                      Chapter {chapter.chapter}
                    </p>
                  </div>
                  <div className="text-3xl leading-[2.5] text-justify">
                    {chapter.verses.map((verse, index) => (
                      <span key={verse.key}>
                        <sup className="text-primary font-semibold text-base mr-1">{verse.num}</sup>
                        {renderVerseText(verse.text)}
                        {index < chapter.verses.length - 1 && " "}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </ScrollArea>
      </div>
    </div>
  );
}