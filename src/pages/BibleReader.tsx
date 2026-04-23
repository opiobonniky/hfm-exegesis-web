import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Star,
  Highlighter,
  X,
  Copy,
  Share2,
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
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
} from "@/components/BibleModals";

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function processVerses(verses: BibleData, book: string, chapter: number) {
  return Object.entries(verses)
    .filter(([key]) => key.startsWith(`${book} ${chapter}:`))
    .sort((a, b) => parseInt(a[0].split(":")[1]) - parseInt(b[0].split(":")[1]))
    .map(([key, text]) => ({ key, text, num: parseInt(key.split(":")[1]) }));
}

function renderVerseText(text: string) {
  return text.split("[").map((part, idx) => {
    if (idx === 0) return part;
    const closeBracket = part.indexOf("]");
    if (closeBracket === -1) return part;
    return (
      <span key={idx} className="italic text-muted-foreground">
        {part.substring(0, closeBracket)}
      </span>
    );
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "…";
}

/** Parse a full verse key like "Genesis 1:3" → { book, chapter, verse } */
function parseVerseKey(key: string) {
  const match = key.match(/^(.+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return {
    book: match[1],
    chapter: parseInt(match[2]),
    verse: parseInt(match[3]),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibleReader() {
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // ── Navigation state ─────────────────────────────────────────────────────
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [versionId, setVersionId] = useState(DEFAULT_VERSION_ID);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Chapter / verse data ─────────────────────────────────────────────────
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [displayChapter, setDisplayChapter] = useState(1);

  // ── Selection — stored as full verse keys e.g. "Genesis 1:1" ─────────────
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);

  // ── Annotations ──────────────────────────────────────────────────────────
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});

  // ── Verse explanations — keyed by full verse key for inline display ─────────────
  const [verseExplanationMap, setVerseExplanationMap] = useState<Record<string, string>>({});
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [expandedFullExplanation, setExpandedFullExplanation] = useState<Set<string>>(new Set());

  // ── Voice reading state ─────────────────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechProgress, setSpeechProgress] = useState<number>(0);
  const speechQueueRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isReadingRef = useRef(false);
  const isPausedRef = useRef(false);

// ── Modal / UI state ─────────────────────────────────────────────────────
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const currentVersion = useMemo(() => getVersionById(versionId), [versionId]);

  // ── Chapter counts ────────────────────────────────────────────────────────
  const maxChapters: Record<string, number> = useMemo(
    () => ({
      Genesis: 50,
      Exodus: 40,
      Leviticus: 27,
      Numbers: 36,
      Deuteronomy: 34,
      Joshua: 24,
      Judges: 21,
      Ruth: 4,
      "1 Samuel": 31,
      "2 Samuel": 24,
      "1 Kings": 22,
      "2 Kings": 25,
      "1 Chronicles": 29,
      "2 Chronicles": 36,
      Ezra: 10,
      Nehemiah: 13,
      Esther: 10,
      Job: 42,
      Psalms: 150,
      Proverbs: 31,
      Ecclesiastes: 12,
      "Song of Solomon": 8,
      Isaiah: 66,
      Jeremiah: 52,
      Lamentations: 5,
      Ezekiel: 48,
      Daniel: 12,
      Hosea: 14,
      Joel: 3,
      Amos: 9,
      Obadiah: 1,
      Jonah: 4,
      Micah: 7,
      Nahum: 3,
      Habakkuk: 3,
      Zephaniah: 3,
      Haggai: 2,
      Zechariah: 14,
      Malachi: 4,
      Matthew: 28,
      Mark: 16,
      Luke: 24,
      John: 21,
      Acts: 28,
      Romans: 16,
      "1 Corinthians": 16,
      "2 Corinthians": 13,
      Galatians: 6,
      Ephesians: 6,
      Philippians: 4,
      Colossians: 4,
      "1 Thessalonians": 5,
      "2 Thessalonians": 3,
      "1 Timothy": 6,
      "2 Timothy": 4,
      Titus: 3,
      Philemon: 1,
      Hebrews: 13,
      James: 5,
      "1 Peter": 5,
      "2 Peter": 3,
      "1 John": 5,
      "2 John": 1,
      "3 John": 1,
      Jude: 1,
      Revelation: 22,
    }),
    [],
  );

  const maxChapter = maxChapters[selectedBook] || 1;
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter < maxChapter ? currentChapter + 1 : null;

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadChapters = useCallback(
    async (book: string, startChapter: number, count: number) => {
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
          if (chapterVerses.length > 0)
            loadedChapters.push({ book, chapter: ch, verses: chapterVerses });
        }
        setChapters((prev) => {
          const existingKeys = new Set(
            prev.map((c) => `${c.book}-${c.chapter}`),
          );
          return [
            ...prev,
            ...loadedChapters.filter(
              (c) => !existingKeys.has(`${c.book}-${c.chapter}`),
            ),
          ];
        });
        setHasMore(loadedChapters.length === count);
      } catch (error) {
        console.error("Failed to load chapters:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, versionId, maxChapters],
  );

  const loadHighlights = useCallback(
    async (book: string, chapter: number) => {
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
            const col = HIGHLIGHT_COLORS.find((c) => c.id === h.colorId);
            if (col)
              map[key] = {
                id: h.id,
                verseKey: key,
                color: col.color,
                colorId: h.colorId,
                note: h.note,
              };
          });
          setHighlights((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error("Error loading highlights:", e);
      }
    },
    [isAuthenticated],
  );

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await sendPostRequest("bible", "get-favorites", {});
      if (res.returnCode === 200 && res.returnData?.favorites) {
        setFavorites(
          new Set(
            res.returnData.favorites.map(
              (i: any) => `${i.bookName} ${i.chapter}:${i.verseNumber}`,
            ),
          ),
        );
      }
    } catch (e) {
      console.error("Error loading favorites:", e);
    }
  }, [isAuthenticated]);

  const loadNotes = useCallback(
    async (book: string, chapter: number) => {
      if (!isAuthenticated) return;
      try {
        const res = await sendPostRequest("bible", "get-verse-note", {
          bookName: book,
          chapter,
        });
        if (res.returnCode === 200 && res.returnData) {
          const notesMap: Record<string, string> = {};
          const notes = Array.isArray(res.returnData)
            ? res.returnData
            : res.returnData.notes || [];
          notes.forEach((n: any) => {
            notesMap[`${n.bookName} ${n.chapter}:${n.verseNumber}`] = n.note;
          });
          setVerseNotes((prev) => ({ ...prev, ...notesMap }));
        }
      } catch (e) {
        console.error("Error loading notes:", e);
      }
    },
    [isAuthenticated],
  );

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    setChapters([]);
    setDisplayChapter(1);
    loadChapters(selectedBook, 1, 5);
    if (isAuthenticated) {
      loadHighlights(selectedBook, 1);
      loadFavorites();
      loadNotes(selectedBook, 1);
    }
  }, [selectedBook, versionId, isAuthenticated]);

  useEffect(() => {
    const el = chapterRefs.current[`${selectedBook}-${currentChapter}`];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (isAuthenticated) {
      loadHighlights(selectedBook, currentChapter);
      loadNotes(selectedBook, currentChapter);
    }
  }, [currentChapter, selectedBook]);

  // Infinite scroll sentinel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const lastChapter = chapters[chapters.length - 1];
          if (lastChapter)
            loadChapters(lastChapter.book, lastChapter.chapter + 1, 5);
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [chapters, hasMore, loading, loadChapters]);

  // Track which chapter is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const key = entry.target.getAttribute("data-chapter-key");
            if (key) {
              const parts = key.split("-");
              setDisplayChapter(parseInt(parts[parts.length - 1]));
            }
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.5 },
    );
    Object.values(chapterRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [chapters]);

  // ── Derived / filtered ────────────────────────────────────────────────────

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return BOOKS;
    return BOOKS.filter((book) =>
      book.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  // ── Selection helpers ─────────────────────────────────────────────────────

  const toggleVerseSelection = (verseKey: string) => {
    // Close expanded explanation if deselecting a verse that has it
    if (selectedVerses.includes(verseKey) && expandedExplanation === verseKey) {
      setExpandedExplanation(null);
      setExpandedFullExplanation((prev) => {
        const next = new Set(prev);
        next.delete(verseKey);
        return next;
      });
    }
    // Close explanation if selecting a different verse
    if (expandedExplanation && expandedExplanation !== verseKey) {
      setExpandedExplanation(null);
    }
    setSelectedVerses((prev) =>
      prev.includes(verseKey)
        ? prev.filter((v) => v !== verseKey)
        : [...prev, verseKey],
    );
  };

  const clearSelection = () => {
    setSelectedVerses([]);
    setExpandedExplanation(null);
    setExpandedFullExplanation(new Set());
    stopSpeaking();
  };

  /**
   * Groups selected verse keys by book+chapter.
   * e.g. ["Genesis 1:1", "Genesis 1:3", "Genesis 2:5"]
   *   → [{ book: "Genesis", chapter: 1, verses: [1, 3] },
   *      { book: "Genesis", chapter: 2, verses: [5] }]
   *
   * This is the source of truth for all API calls — never relies on
   * currentChapter state, so cross-chapter selections always work correctly.
   */
  const getSelectionGroups = useCallback(() => {
    const groups = new Map<
      string,
      { book: string; chapter: number; verses: number[] }
    >();
    for (const key of selectedVerses) {
      const parsed = parseVerseKey(key);
      if (!parsed) continue;
      const { book, chapter, verse } = parsed;
      const groupKey = `${book}|${chapter}`;
      if (!groups.has(groupKey))
        groups.set(groupKey, { book, chapter, verses: [] });
      groups.get(groupKey)!.verses.push(verse);
    }
    return [...groups.values()];
  }, [selectedVerses]);

  // ── Annotation lookup — keyed by full verse key, not verse number ─────────
  // These work correctly across all lazily-loaded chapters.

  const isHighlighted = (verseKey: string) => highlights[verseKey]?.color;
  const isFavorite = (verseKey: string) => favorites.has(verseKey);
  const getVerseNote = (verseKey: string) => verseNotes[verseKey] || null;
  const getVerseExplanation = (verseKey: string) => verseExplanationMap[verseKey] || null;

  // ── Toggle explanation inline ─────────────────────────────────────────────
  const toggleExplanation = async (verseKey: string) => {
    // If already expanded, collapse it and scroll verse back into view
    if (expandedExplanation === verseKey) {
      setExpandedExplanation(null);
      setExpandedFullExplanation((prev) => {
        const next = new Set(prev);
        next.delete(verseKey);
        return next;
      });
      requestAnimationFrame(() => {
        const verseEl = verseRefs.current[verseKey];
        if (verseEl) {
          verseEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return;
    }

    // Check if we already have the explanation cached
    if (verseExplanationMap[verseKey]) {
      setExpandedExplanation(verseKey);
      return;
    }

    // Need to fetch from API
    const parsed = parseVerseKey(verseKey);
    if (!parsed) return;
    
    setExplanationLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: parsed.book,
        chapter: parsed.chapter,
        verseNumber: parsed.verse,
      });
      if (res?.returnCode === 200 && res.returnData?.explanation) {
        setVerseExplanationMap((prev) => ({
          ...prev,
          [verseKey]: res.returnData.explanation,
        }));
        setExpandedExplanation(verseKey);
      } else {
        toast({
          title: "No Explanation",
          description: "No explanation found for this verse.",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load explanation.",
        variant: "destructive",
      });
    } finally {
      setExplanationLoading(false);
    }
  };

  const clearExplanation = (verseKey: string) => {
    setVerseExplanationMap((prev) => {
      const next = { ...prev };
      delete next[verseKey];
      return next;
    });
    if (expandedExplanation === verseKey) {
      setExpandedExplanation(null);
    }
  };

  // ── Voice reading ──────────────────────────────────────────────────────────────
  const cleanTextForSpeech = (text: string): string => {
    return text.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  };

  const getVerseTextByKey = (verseKey: string): string => {
    for (const chapter of chapters) {
      const verse = chapter.verses.find((v) => v.key === verseKey);
      if (verse) return cleanTextForSpeech(verse.text);
    }
    return "";
  };

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    isReadingRef.current = false;
    isPausedRef.current = false;
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeechProgress(0);
    speechQueueRef.current = [];
    currentIndexRef.current = 0;
  };

  const pauseSpeaking = () => {
    window.speechSynthesis.pause();
    isPausedRef.current = true;
    setIsPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis.resume();
    isPausedRef.current = false;
    setIsPaused(false);
  };

  const readSelectedVerses = async () => {
    if (selectedVerses.length === 0) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const sortedVerses = [...selectedVerses].sort((a, b) => {
      const aRef = a.match(/(\d+):(\d+)$/);
      const bRef = b.match(/(\d+):(\d+)$/);
      if (!aRef || !bRef) return 0;
      const chDiff = parseInt(aRef[1]) - parseInt(bRef[1]);
      return chDiff !== 0 ? chDiff : parseInt(aRef[2]) - parseInt(bRef[2]);
    });

    const texts = sortedVerses.map((key) => {
      const parsed = parseVerseKey(key);
      const verseText = getVerseTextByKey(key);
      return verseText ? `${key} ${verseText}` : key;
    });

    speechQueueRef.current = texts;
    currentIndexRef.current = 0;
    isReadingRef.current = true;
    isPausedRef.current = false;
    setIsSpeaking(true);
    setIsPaused(false);
    setSpeechProgress(0);

    for (let i = 0; i < texts.length; i++) {
      if (!isReadingRef.current) break;

      while (isPausedRef.current && isReadingRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!isReadingRef.current) break;

      currentIndexRef.current = i;
      setSpeechProgress(((i + 1) / texts.length) * 100);

      try {
        await speak(texts[i]);
      } catch (e) {
        console.error("Speech error:", e);
      }
    }

    stopSpeaking();
  };

  const readChapter = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const currentChapterData = chapters.find(
      (c) => c.book === selectedBook && c.chapter === currentChapter
    );
    if (!currentChapterData) return;

    const texts = currentChapterData.verses.map((v) => {
      return `${selectedBook} ${currentChapter}:${v.num} ${cleanTextForSpeech(v.text)}`;
    });

    speechQueueRef.current = texts;
    currentIndexRef.current = 0;
    isReadingRef.current = true;
    isPausedRef.current = false;
    setIsSpeaking(true);
    setIsPaused(false);
    setSpeechProgress(0);

    for (let i = 0; i < texts.length; i++) {
      if (!isReadingRef.current) break;

      while (isPausedRef.current && isReadingRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!isReadingRef.current) break;

      currentIndexRef.current = i;
      setSpeechProgress(((i + 1) / texts.length) * 100);

      try {
        await speak(texts[i]);
      } catch (e) {
        console.error("Speech error:", e);
      }
    }

    stopSpeaking();
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setCurrentChapter(1);
    setChapters([]);
    clearSelection();
    loadChapters(book, 1, 5);
  };

  const handleChapterChange = (ch: number) => {
    setCurrentChapter(ch);
    setChapters([]);
    clearSelection();
    loadChapters(selectedBook, ch, 5);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const addFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }
    if (selectedVerses.length === 0) return;
    try {
      await Promise.all(
        getSelectionGroups().map(({ book, chapter, verses }) =>
          sendPostRequest("bible", "add-favorite", {
            bookName: book,
            chapter,
            verseNumbers: verses,
          }),
        ),
      );
      toast({ title: "Added to Favorites" });
      loadFavorites();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to add favorite.",
        variant: "destructive",
      });
    }
    clearSelection();
  };

  const highlightVerses = async (colorId: number, color: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Sign in to highlight verses.",
        variant: "destructive",
      });
      return;
    }
    const groups = getSelectionGroups();
    if (groups.length === 0) return;
    try {
      await Promise.all(
        groups.map(({ book, chapter, verses }) =>
          sendPostRequest("bible", "add-highlight", {
            bookName: book,
            chapter,
            verseNumbers: verses,
            colorId,
            note: "",
          }),
        ),
      );
      // Optimistic local update — verse.key is already the full verse key
      selectedVerses.forEach((key) => {
        setHighlights((prev) => ({
          ...prev,
          [key]: { verseKey: key, color, colorId },
        }));
      });
      // Reload from server to get IDs (needed for delete later)
      groups.forEach(({ book, chapter }) => loadHighlights(book, chapter));
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to highlight.",
        variant: "destructive",
      });
    }
    clearSelection();
  };

  const removeHighlight = async (verseKey: string) => {
    const h = highlights[verseKey];
    if (!h?.id) return;
    try {
      await sendPostRequest("bible", "delete-highlight", { highlightId: h.id });
      setHighlights((prev) => {
        const next = { ...prev };
        delete next[verseKey];
        return next;
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to remove highlight.",
        variant: "destructive",
      });
    }
  };

  const copyVerses = () => {
    const text = [...selectedVerses]
      .sort((a, b) => {
        const aRef = a.match(/(\d+):(\d+)$/);
        const bRef = b.match(/(\d+):(\d+)$/);
        if (!aRef || !bRef) return 0;
        const chDiff = parseInt(aRef[1]) - parseInt(bRef[1]);
        return chDiff !== 0 ? chDiff : parseInt(aRef[2]) - parseInt(bRef[2]);
      })
      .map((key) => {
        const parsed = parseVerseKey(key);
        if (!parsed) return key;
        const verse = chapters
          .find((c) => c.book === parsed.book && c.chapter === parsed.chapter)
          ?.verses.find((vn) => vn.num === parsed.verse);
        return verse ? `${key}\n${verse.text}` : key;
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Verses copied to clipboard." });
    clearSelection();
  };

  const shareVerses = async () => {
    const text = [...selectedVerses]
      .sort((a, b) => {
        const aRef = a.match(/(\d+):(\d+)$/);
        const bRef = b.match(/(\d+):(\d+)$/);
        if (!aRef || !bRef) return 0;
        const chDiff = parseInt(aRef[1]) - parseInt(bRef[1]);
        return chDiff !== 0 ? chDiff : parseInt(aRef[2]) - parseInt(bRef[2]);
      })
      .map((key) => {
        const parsed = parseVerseKey(key);
        if (!parsed) return key;
        const verse = chapters
          .find((c) => c.book === parsed.book && c.chapter === parsed.chapter)
          ?.verses.find((vn) => vn.num === parsed.verse);
        return verse ? `${key}\n${verse.text}` : key;
      })
      .join("\n\n");
    try {
      await navigator.share({ text });
    } catch (e) {
      console.error(e);
    }
    clearSelection();
  };

  const saveNote = async () => {
    if (!noteText.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter a note.",
        variant: "destructive",
      });
      return;
    }
    setNoteSaving(true);
    try {
      await Promise.all(
        getSelectionGroups().map(({ book, chapter, verses }) =>
          sendPostRequest("bible", "add-verse-note", {
            bookName: book,
            chapter,
            verseNumbers: verses,
            note: noteText.trim(),
          }),
        ),
      );
      toast({ title: "Note Saved", description: "Your note has been saved." });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save note.",
        variant: "destructive",
      });
    }
    setNoteText("");
    setShowNoteModal(false);
    clearSelection();
    setNoteSaving(false);
  };

  // ── Search ────────────────────────────────────────────────────────────────

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
        Object.entries(allVerses)
          .filter(([, text]) =>
            text.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 30)
          .forEach(([key]) => {
            const match = key.match(/^(.+?)\s+(\d+):(\d+)$/);
            if (match)
              results.push({
                book: match[1],
                chapter: parseInt(match[2]),
                verse: parseInt(match[3]),
              });
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        {/* Top bar: logo + version */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1
                className="text-lg font-semibold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Scripture
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Bible Reader
              </p>
            </div>
          </div>

          <Select value={versionId} onValueChange={setVersionId}>
            <SelectTrigger className="w-[180px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {BIBLE_VERSIONS.map((version) => (
                <SelectItem
                  key={version.id}
                  value={version.id}
                  className="text-xs"
                >
                  {version.name} ({version.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Book + chapter selectors */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/40">
          <div className="relative flex-1 max-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter books…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs border-border/50 bg-muted/30"
            />
          </div>

          <Select value={selectedBook} onValueChange={handleBookChange}>
            <SelectTrigger className="w-[180px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue placeholder="Select book" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[300px]">
                {filteredBooks.map((book) => (
                  <SelectItem key={book} value={book} className="text-xs">
                    {book}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <Select
            value={currentChapter.toString()}
            onValueChange={(val) => handleChapterChange(parseInt(val))}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue placeholder="Chapter" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {Array.from({ length: maxChapter }, (_, i) => i + 1).map(
                  (ch) => (
                    <SelectItem
                      key={ch}
                      value={ch.toString()}
                      className="text-xs"
                    >
                      Chapter {ch}
                    </SelectItem>
                  ),
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Chapter navigation bar */}
        <div className="flex items-center justify-between px-6 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => prevChapter && handleChapterChange(prevChapter)}
            disabled={!prevChapter}
            className="flex items-center gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {prevChapter ? (
              <span>Ch. {prevChapter}</span>
            ) : (
              <span>Previous</span>
            )}
          </Button>

          <div className="text-center">
            <p
              className="text-sm font-medium text-foreground tracking-wide leading-none"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {selectedBook}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Chapter {displayChapter || currentChapter} of {maxChapter}
              <span className="mx-1.5 opacity-40">·</span>
              <span className="text-primary/80">
                {currentVersion?.abbreviation}
              </span>
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => nextChapter && handleChapterChange(nextChapter)}
            disabled={!nextChapter}
            className="flex items-center gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            {nextChapter ? <span>Ch. {nextChapter}</span> : <span>Next</span>}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* ── Floating selection toolbar ── */}
      {selectedVerses.length > 0 && (
        <div className="sticky top-0 z-40 flex justify-center px-4 pt-2 pb-1 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 bg-background/95 backdrop-blur border border-border/60 rounded-full px-3 py-1.5 shadow-lg">
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>{selectedVerses.length}</span>
            </button>

            <div className="w-px h-4 bg-border/60 mx-1" />

            {/* Voice reading — available when selected verses exist */}
            {selectedVerses.length > 0 && (
              <button
                onClick={readSelectedVerses}
                className={[
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors whitespace-nowrap",
                  isSpeaking
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                ].join(" ")}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3 h-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    Listen
                  </>
                )}
              </button>
            )}

            <ToolbarBtn
              onClick={() => setShowHighlightPicker(true)}
              icon={<Highlighter className="w-3 h-3" />}
              label="Highlight"
            />
            <ToolbarBtn onClick={() => setShowNoteModal(true)} label="Note" />
            <ToolbarBtn
              onClick={addFavorite}
              icon={<Star className="w-3 h-3" />}
              label="Favorite"
            />
            <ToolbarBtn
              onClick={copyVerses}
              icon={<Copy className="w-3 h-3" />}
              label="Copy"
            />
            <ToolbarBtn
              onClick={shareVerses}
              icon={<Share2 className="w-3 h-3" />}
              label="Share"
            />
          </div>
        </div>
      )}

      {/* ── Main reading area ── */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div
            ref={contentRef}
            className="max-w-7xl mx-auto px-6 sm:px-10 py-12"
          >
            {chapters.length === 0 && loading ? (
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-7 w-40 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto mb-6" />
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {chapters.map((chapter) => (
                  <div
                    key={`${chapter.book}-${chapter.chapter}`}
                    data-chapter-key={`${chapter.book}-${chapter.chapter}`}
                    ref={(el) => {
                      if (el)
                        chapterRefs.current[
                          `${chapter.book}-${chapter.chapter}`
                        ] = el;
                    }}
                    className="mb-20"
                  >
                    {/* Chapter heading */}
                    <div className="mb-10 text-center">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
                        <h2
                          className="text-2xl font-medium tracking-widest text-foreground uppercase"
                          style={{
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: "0.12em",
                          }}
                        >
                          {chapter.book}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
                      </div>
                      <p
                        className="text-sm text-muted-foreground tracking-widest uppercase"
                        style={{
                          fontFamily: "'Cinzel', serif",
                          letterSpacing: "0.2em",
                        }}
                      >
                        Chapter {chapter.chapter}
                      </p>
                    </div>

                    {/* Verses */}
                    <div
                      className="text-[1.25rem] leading-[2.15] text-foreground/90"
                      style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                      {chapter.verses.map((verse) => {
                        // All lookups use the full verse key — correct across all loaded chapters
                        const highlightColor = isHighlighted(verse.key);
                        const isSelected = selectedVerses.includes(verse.key);
                        const isFav = isFavorite(verse.key);
                        const vNote = getVerseNote(verse.key);
                        const vExplanation = getVerseExplanation(verse.key);
                        const isExplanationExpanded = expandedExplanation === verse.key;

                        return (
                          <span key={verse.key}>
                            <span
                              ref={(el) => {
                                verseRefs.current[verse.key] = el;
                              }}
                              onClick={() => toggleVerseSelection(verse.key)}
                              className={[
                                "inline cursor-pointer rounded transition-all duration-150",
                                isSelected
                                  ? "bg-primary/15 ring-1 ring-primary/30 -mx-0.5 px-0.5"
                                  : "",
                                highlightColor && !isSelected
                                  ? "-mx-0.5 px-0.5 rounded"
                                  : "",
                              ].join(" ")}
                              style={
                                highlightColor && !isSelected
                                  ? {
                                      backgroundColor: `${highlightColor}28`,
                                      borderBottom: `2px solid ${highlightColor}60`,
                                    }
                                  : undefined
                              }
                            >
                              {/* Verse number */}
                              <sup
                                className="text-primary font-semibold mr-1 not-italic select-none"
                                style={{
                                  fontFamily: "'Cinzel', serif",
                                  fontSize: "0.6rem",
                                  letterSpacing: "0.05em",
                                  verticalAlign: "super",
                                  lineHeight: 0,
                                }}
                              >
                                {verse.num}
                              </sup>
                              {renderVerseText(verse.text)}
                              {/* Indicators — only show when NOT selected */}
                              {!isSelected && (
                                <>
                                  {isFav && (
                                    <Star
                                      className="inline w-3 h-3 ml-1 text-amber-400 fill-amber-400 align-middle"
                                      style={{ verticalAlign: "middle" }}
                                    />
                                  )}
                                  {vNote && !isFav && (
                                    <span className="text-xs text-muted-foreground ml-1 not-italic align-middle">
                                      📝
                                    </span>
                                  )}
                                </>
                              )}{" "}
                              {/* Small inline Explain button — only when one verse is selected */}
                              {isSelected && selectedVerses.length === 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExplanation(verse.key);
                                  }}
                                  disabled={explanationLoading}
                                  className={[
                                    "inline-flex items-center gap-0.5 ml-1 text-[0.65rem] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded transition-all duration-150",
                                    isExplanationExpanded
                                      ? "bg-primary/20 text-primary"
                                      : "bg-primary/10 text-primary/70 hover:bg-primary/15 hover:text-primary",
                                  ].join(" ")}
                                >
                                  {explanationLoading && expandedExplanation === verse.key ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <>
                                      {isExplanationExpanded ? "Close" : "Explain"}
                                    </>
                                  )}
                                </button>
                              )}{" "}
                            </span>
                            {/* Inline explanation content — right below verse when expanded */}
                            {isExplanationExpanded && (
                              <div className="mt-1 mb-3 ml-4 pl-3 border-l-2 border-primary/30 max-h-52 overflow-y-auto scrollbar-thin">
                                {vExplanation ? (
                                  <div className="text-sm leading-relaxed text-foreground/80 animate-in slide-in-from-top-2">
                                    <p className="whitespace-pre-wrap">
                                      {expandedFullExplanation.has(verse.key)
                                        ? vExplanation
                                        : truncateText(vExplanation, 200)}
                                    </p>
                                    {vExplanation.length > 200 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedFullExplanation((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(verse.key)) {
                                              next.delete(verse.key);
                                            } else {
                                              next.add(verse.key);
                                            }
                                            return next;
                                          });
                                        }}
                                        className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                      >
                                        {expandedFullExplanation.has(verse.key) ? (
                                          <>
                                            <ChevronUp className="w-3 h-3" />
                                            Show less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="w-3 h-3" />
                                            Read more
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Loading explanation...
                                  </span>
                                )}
                              </div>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Load-more sentinel */}
                <div ref={loadMoreRef} className="py-12 flex justify-center">
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground tracking-widest uppercase">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span style={{ fontFamily: "'Cinzel', serif" }}>
                        Loading…
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── Modals ── */}
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

      {/* ── Voice reading control bar ── */}
      {isSpeaking && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background/95 backdrop-blur border border-border/80 rounded-full px-4 py-2.5 shadow-xl">
          {/* Progress bar */}
          <div className="absolute -top-1 left-4 right-4 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${speechProgress}%` }}
            />
          </div>

          {/* Stop button */}
          <button
            onClick={stopSpeaking}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <VolumeX className="w-4 h-4 text-primary" />
          </button>

          {/* Pause/Resume button */}
          <button
            onClick={isPaused ? resumeSpeaking : pauseSpeaking}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-primary" />
            ) : (
              <Pause className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* Current position info */}
          <div className="text-xs text-muted-foreground min-w-[60px]">
            {currentIndexRef.current + 1} / {speechQueueRef.current.length || selectedVerses.length}
          </div>

          {/* Verse reference */}
          {selectedVerses.length === 1 && (
            <div className="text-xs text-muted-foreground/70 font-medium">
              {selectedVerses[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tiny toolbar button ────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full hover:bg-muted/50 transition-colors whitespace-nowrap"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
