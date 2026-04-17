import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Book, ChevronLeft, ChevronRight, Loader2, BookOpen, Star, Highlighter, X, Copy, Share2, StickyNote } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import {
  BIBLE_VERSIONS,
  DEFAULT_VERSION_ID,
  getVersionById,
} from "@/assets/bibleVersion/json/bibleVersions";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";
import {
  HighlightPickerModal,
  SearchModal,
  NoteModal,
  ExplanationModal,
} from "@/components/BibleModals";

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

interface Highlight {
  id?: number;
  verseKey: string;
  color: string;
  colorId: number;
  note?: string;
}

interface BibleData {
  [key: string]: string;
}

interface ChapterData {
  book: string;
  chapter: number;
  verses: { key: string; text: string; num: number }[];
}

const HIGHLIGHT_COLORS = [
  { id: 1, name: "Red", color: "#F87171" },
  { id: 3, name: "Yellow", color: "#FACC15" },
  { id: 4, name: "Orange", color: "#F97316" },
  { id: 13, name: "Pink", color: "#EC4899" },
  { id: 14, name: "Rose", color: "#FB7185" },
  { id: 15, name: "Amber", color: "#F59E0B" },
  { id: 2, name: "Blue", color: "#3B82F6" },
  { id: 7, name: "Cyan", color: "#06B6D4" },
  { id: 8, name: "Teal", color: "#0D9488" },
  { id: 9, name: "Sky", color: "#38BDF8" },
  { id: 10, name: "Indigo", color: "#6366F1" },
  { id: 5, name: "Green", color: "#22C55E" },
  { id: 6, name: "Purple", color: "#A855F7" },
  { id: 11, name: "Lime", color: "#84CC16" },
  { id: 12, name: "Mint", color: "#2DD4BF" },
];

const VERSION_FILES: Record<string, () => Promise<{ default: BibleData }>> = {
  BSB: () => import("@/assets/bibleVersion/json/verses-bsb.json"),
  KJV: () => import("@/assets/bibleVersion/json/verses-kjv.json"),
  WEB: () => import("@/assets/bibleVersion/json/verses-web.json"),
  ASV: () => import("@/assets/bibleVersion/json/verses-asv.json"),
  YLT: () => import("@/assets/bibleVersion/json/verses-ylt.json"),
  DARBY: () => import("@/assets/bibleVersion/json/verses-darby.json"),
  WEBSTER: () => import("@/assets/bibleVersion/json/verses-webster.json"),
  BBE: () => import("@/assets/bibleVersion/json/verses-bbe.json"),
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
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

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

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [verseExplanation, setVerseExplanation] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const loadHighlights = useCallback(async (book: string, chapter: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await sendPostRequest("bible", "get-highlights", {
        bookName: book,
        chapter,
      });
      if (res.returnCode === 200 && res.returnData?.highlights) {
        const map: Record<string, Highlight> = {};
        res.returnData.highlights.forEach((h: any) => {
          const key = `${h.bookName} ${h.chapter}:${h.verseNumber}`;
          const col = HIGHLIGHT_COLORS.find(c => c.id === h.colorId);
          if (col)
            map[key] = {
              id: h.id,
              verseKey: key,
              color: col.color,
              colorId: h.colorId,
              note: h.note,
            };
        });
        setHighlights(map);
      }
    } catch (e) {
      console.error("Error loading highlights:", e);
    }
  }, [isAuthenticated]);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await sendPostRequest("bible", "get-favorites", {});
      if (res.returnCode === 200 && res.returnData?.favorites) {
        setFavorites(new Set(
          res.returnData.favorites.map((i: any) => `${i.bookName} ${i.chapter}:${i.verseNumber}`)
        ));
      }
    } catch (e) {
      console.error("Error loading favorites:", e);
    }
  }, [isAuthenticated]);

  const loadNotes = useCallback(async (book: string, chapter: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await sendPostRequest("bible", "get-verse-note", { bookName: book, chapter });
      if (res.returnCode === 200 && res.returnData) {
        const notesMap: Record<string, string> = {};
        const notes = Array.isArray(res.returnData) ? res.returnData : res.returnData.notes || [];
        notes.forEach((n: any) => {
          const key = `${n.bookName} ${n.chapter}:${n.verseNumber}`;
          notesMap[key] = n.note;
        });
        setVerseNotes(notesMap);
      }
    } catch (e) {
      console.error("Error loading notes:", e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setChapters([]);
    loadChapters(selectedBook, 1, 5);
    if (isAuthenticated) {
      loadHighlights(selectedBook, 1);
      loadFavorites();
      loadNotes(selectedBook, 1);
    }
  }, [selectedBook, versionId, isAuthenticated]);

  useEffect(() => {
    const chapterKey = `${selectedBook}-${currentChapter}`;
    const chapterElement = chapterRefs.current[chapterKey];
    if (chapterElement) {
      chapterElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (isAuthenticated) {
      loadHighlights(selectedBook, currentChapter);
      loadNotes(selectedBook, currentChapter);
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

  // Removed auto chapter detection on scroll to fix jumping to next chapter before reading

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return BOOKS;
    const query = searchQuery.toLowerCase();
    return BOOKS.filter(book => book.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setCurrentChapter(1);
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum)
        ? prev.filter(v => v !== verseNum)
        : [...prev, verseNum]
    );
  };

  const clearSelection = () => setSelectedVerses([]);

  const addFavorite = async () => {
    if (!isAuthenticated) {
      toast({ title: "Sign In Required", description: "Sign in to save favorites.", variant: "warning" });
      return;
    }
    if (selectedVerses.length === 0) return;
    try {
      const res = await sendPostRequest("bible", "add-favorite", {
        bookName: selectedBook,
        chapter: currentChapter,
        verseNumbers: selectedVerses,
      });
      if (res.returnCode === 200) {
        toast({ title: "Added to Favorites", description: "Verse(s) added to favorites." });
        loadFavorites();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to add favorite.", variant: "destructive" });
    }
    clearSelection();
  };

  const highlightVerses = async (colorId: number, color: string) => {
    if (!isAuthenticated) {
      toast({ title: "Sign In Required", description: "Sign in to highlight verses.", variant: "warning" });
      return;
    }
    try {
      const res = await sendPostRequest("bible", "add-highlight", {
        bookName: selectedBook,
        chapter: currentChapter,
        verseNumbers: selectedVerses,
        colorId,
        note: "",
      });
      if (res.returnCode === 200) {
        selectedVerses.forEach(verseNum => {
          const key = `${selectedBook} ${currentChapter}:${verseNum}`;
          setHighlights(prev => ({ ...prev, [key]: { verseKey: key, color, colorId } }));
        });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to highlight.", variant: "destructive" });
    }
    clearSelection();
  };

  const removeHighlight = async (verseNum: number) => {
    const key = `${selectedBook} ${currentChapter}:${verseNum}`;
    const h = highlights[key];
    if (!h?.id) return;
    try {
      await sendPostRequest("bible", "delete-highlight", { highlightId: h.id });
      loadHighlights(selectedBook, currentChapter);
    } catch (e) {
      toast({ title: "Error", description: "Failed to remove highlight.", variant: "destructive" });
    }
  };

  const getVerseExplanation = async () => {
    if (selectedVerses.length !== 1) return;
    try {
      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: selectedBook,
        chapter: currentChapter,
        verseNumber: selectedVerses[0],
      });
      if (res?.returnCode === 200 && res.returnData?.explanation) {
        setVerseExplanation(res.returnData.explanation);
        setShowExplanation(true);
      } else {
        toast({ title: "No Explanation", description: "No explanation found for this verse." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load explanation.", variant: "destructive" });
    }
  };

  const shareVerses = async () => {
    const text = selectedVerses
      .sort((a, b) => a - b)
      .map(v => {
        const verse = chapters.find(c => c.chapter === currentChapter)?.verses.find(vn => vn.num === v);
        return verse ? `${selectedBook} ${currentChapter}:${v}\n${verse.text}` : `${selectedBook} ${currentChapter}:${v}`;
      })
      .join("\n\n");
    try {
      await navigator.share({ text });
    } catch (e) {
      console.error(e);
    }
    clearSelection();
  };

  const copyVerses = () => {
    const text = selectedVerses
      .sort((a, b) => a - b)
      .map(v => {
        const verse = chapters.find(c => c.chapter === currentChapter)?.verses.find(vn => vn.num === v);
        return verse ? `${selectedBook} ${currentChapter}:${v}\n${verse.text}` : `${selectedBook} ${currentChapter}:${v}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Verses copied to clipboard." });
    clearSelection();
  };

  const saveNote = async () => {
    if (!noteText.trim()) {
      toast({ title: "Empty Note", description: "Please enter a note.", variant: "warning" });
      return;
    }
    setNoteSaving(true);
    try {
      const res = await sendPostRequest("bible", "add-verse-note", {
        bookName: selectedBook,
        chapter: currentChapter,
        verseNumbers: selectedVerses,
        note: noteText.trim(),
      });
      if (res.returnCode === 200) {
        toast({ title: "Note Saved", description: "Your note has been saved." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save note.", variant: "destructive" });
    }
    setNoteText("");
    setShowNoteModal(false);
    clearSelection();
    setNoteSaving(false);
  };

  const goToVerse = (book: string, chapterNum: number) => {
    setSelectedBook(book);
    setCurrentChapter(chapterNum);
    setShowSearchModal(false);
    setSearchQuery("");
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      setSearchLoading(true);
      try {
        const module = await VERSION_FILES[versionId]();
        const allVerses = module.default;
        const results: any[] = [];
        const searchTerm = query.toLowerCase();
        Object.entries(allVerses)
          .filter(([, text]) => text.toLowerCase().includes(searchTerm))
          .slice(0, 30)
          .forEach(([key, text]) => {
            const match = key.match(/^(.+?)\s+(\d+):(\d+)$/);
            if (match) {
              results.push({ book: match[1], chapter: parseInt(match[2]), verse: parseInt(match[3]) });
            }
          });
        setSearchResults(results);
      } catch (e) {
        setSearchResults([]);
      }
      setSearchLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const isHighlighted = (verseNum: number) => {
    const key = `${selectedBook} ${currentChapter}:${verseNum}`;
    return highlights[key]?.color;
  };

  const isFavorite = (verseNum: number) => {
    const key = `${selectedBook} ${currentChapter}:${verseNum}`;
    return favorites.has(key);
  };

  const getVerseNote = (verseNum: number) => {
    const key = `${selectedBook} ${currentChapter}:${verseNum}`;
    return verseNotes[key] || null;
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

      {selectedVerses.length > 0 && (
        <div className="sticky top-0 z-25 bg-background/95 backdrop-blur border-b shadow-sm flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedVerses.length} selected
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={getVerseExplanation}>
              Explain
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowHighlightPicker(true)}>
              <Highlighter className="w-4 h-4 mr-1" /> Highlight
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNoteModal(true)}>
              Note
            </Button>
            <Button variant="ghost" size="sm" onClick={addFavorite}>
              <Star className="w-4 h-4 mr-1" /> Favorite
            </Button>
            <Button variant="ghost" size="sm" onClick={copyVerses}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={shareVerses}>
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </div>
      )}

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
                    {chapter.verses.map((verse, index) => {
                      const verseNum = verse.num;
                      const highlightColor = isHighlighted(verseNum);
                      const isSelected = selectedVerses.includes(verseNum);
                      const isFav = isFavorite(verseNum);
                      const noteText = getVerseNote(verseNum);

                      return (
                        <span 
                          key={verse.key}
                          className={`${isSelected ? "bg-primary/20 -mx-1 px-1 rounded" : ""} ${highlightColor && !isSelected ? "-mx-1 px-1 rounded" : ""} transition-colors cursor-pointer block w-full`}
                          style={highlightColor && !isSelected ? { backgroundColor: `${highlightColor}30` } : undefined}
                        >
                          <button
                            type="button"
                            onClick={() => toggleVerseSelection(verseNum)}
                            className="inline w-full text-left"
                          >
                            <sup className="text-primary font-semibold text-base mr-1">{verseNum}</sup>
                            {renderVerseText(verse.text)}
                            {isFav && <Star className="w-3 h-3 ml-1 text-yellow-500 fill-yellow-500" />}
                            {noteText && !isFav && (
                              <span className="text-xs text-muted-foreground ml-1">📝 {noteText}</span>
                            )}
                          </button>
                          {index < chapter.verses.length - 1 && " "}
                        </span>
                      );
                    })}
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

      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        onSelectResult={goToVerse}
        loading={searchLoading}
      />

      <HighlightPickerModal
        visible={showHighlightPicker}
        onClose={() => setShowHighlightPicker(false)}
        onSelectColor={(colorId, color) => {
          setShowHighlightPicker(false);
          highlightVerses(colorId, color);
        }}
      />

      <NoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={saveNote}
        noteText={noteText}
        onNoteChange={setNoteText}
        saving={noteSaving}
        selectedVerses={selectedVerses}
        currentBook={selectedBook}
        currentChapter={currentChapter}
      />

      <ExplanationModal
        visible={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={verseExplanation}
        currentBook={selectedBook}
        currentChapter={currentChapter}
      />
    </div>
  );
}