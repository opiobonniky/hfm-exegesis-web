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
  BookMarked,
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

const MAX_CHAPTERS: Record<string, number> = {
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
};

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

/** One item in the speech queue */
interface SpeechItem {
  verseKey: string;
  verseNum: number;
  text: string; // what is spoken aloud
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

// ── Helpers ────────────────────────────────────────────────────────────────

function processVerses(verses: BibleData, book: string, chapter: number) {
  return Object.entries(verses)
    .filter(([key]) => key.startsWith(`${book} ${chapter}:`))
    .sort((a, b) => parseInt(a[0].split(":")[1]) - parseInt(b[0].split(":")[1]))
    .map(([key, text]) => ({ key, text, num: parseInt(key.split(":")[1]) }));
}

function renderVerseText(text: string) {
  return text.split("[").map((part, idx) => {
    if (idx === 0) return part;
    const close = part.indexOf("]");
    if (close === -1) return part;
    return (
      <span key={idx} className="italic text-muted-foreground">
        {part.substring(0, close)}
      </span>
    );
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "…";
}

function parseVerseKey(key: string) {
  const match = key.match(/^(.+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return {
    book: match[1],
    chapter: parseInt(match[2]),
    verse: parseInt(match[3]),
  };
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BibleReader() {
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

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

  // ── Navigation ────────────────────────────────────────────────────────────
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [versionId, setVersionId] = useState(DEFAULT_VERSION_ID);
  const [bookFilter, setBookFilter] = useState("");
  const [displayBook, setDisplayBook] = useState("Genesis");
  const [displayChapter, setDisplayChapter] = useState(1);

  // ── Chapter data ──────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const isNavigatingRef = useRef(false);
  const loadingRef = useRef(false);

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);

  // ── Annotations ───────────────────────────────────────────────────────────
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});

  // ── Explanations ──────────────────────────────────────────────────────────
  const [verseExplanationMap, setVerseExplanationMap] = useState<
    Record<string, string>
  >({});
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(
    null,
  );
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [expandedFullExplanation, setExpandedFullExplanation] = useState<
    Set<string>
  >(new Set());

  // ── Voice reading ─────────────────────────────────────────────────────────
  const [voiceMode, setVoiceMode] = useState<"chapter" | "selected" | null>(
    null,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeechIdx, setCurrentSpeechIdx] = useState(0);
  const [speechItems, setSpeechItems] = useState<SpeechItem[]>([]);

  // Refs for async loop — avoids stale-closure issues entirely
  const speechItemsRef = useRef<SpeechItem[]>([]);
  const currentIdxRef = useRef(0);
  const isReadingRef = useRef(false);
  const isPausedRef = useRef(false);
  // Resolving this lets the loop skip the current utterance immediately
  const skipRef = useRef<(() => void) | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentVersion = useMemo(() => getVersionById(versionId), [versionId]);
  const maxChapterForDisplay = MAX_CHAPTERS[displayBook] ?? 1;

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadChapters = useCallback(
    async (book: string, startChapter: number, count: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const mod = await VERSION_FILES[versionId]();
        const verses = mod.default;
        const loaded: ChapterData[] = [];
        for (let i = 0; i < count; i++) {
          const ch = startChapter + i;
          if (ch > (MAX_CHAPTERS[book] ?? 1)) break;
          const cv = processVerses(verses, book, ch);
          if (cv.length > 0) loaded.push({ book, chapter: ch, verses: cv });
        }
        setChapters((prev) => {
          const ex = new Set(prev.map((c) => `${c.book}-${c.chapter}`));
          return [
            ...prev,
            ...loaded.filter((c) => !ex.has(`${c.book}-${c.chapter}`)),
          ];
        });
        setHasMore(loaded.length === count);
      } catch (err) {
        console.error("Failed to load chapters:", err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [versionId],
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
        console.error(e);
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
      console.error(e);
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
          const notes = Array.isArray(res.returnData)
            ? res.returnData
            : res.returnData.notes || [];
          const map: Record<string, string> = {};
          notes.forEach((n: any) => {
            map[`${n.bookName} ${n.chapter}:${n.verseNumber}`] = n.note;
          });
          setVerseNotes((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [isAuthenticated],
  );

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    chapterRefs.current = {};
    verseRefs.current = {};
    setChapters([]);
    setHasMore(true);
    setDisplayBook(selectedBook);
    setDisplayChapter(selectedChapter);
    loadChapters(selectedBook, selectedChapter, 5);
    if (isAuthenticated) {
      loadHighlights(selectedBook, selectedChapter);
      loadFavorites();
      loadNotes(selectedBook, selectedChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, versionId]);

  useEffect(() => {
    const key = `${selectedBook}-${selectedChapter}`;
    const el = chapterRefs.current[key];
    if (el) {
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    }
    if (isAuthenticated) {
      loadHighlights(selectedBook, selectedChapter);
      loadNotes(selectedBook, selectedChapter);
    }
  }, [
    selectedChapter,
    selectedBook,
    isAuthenticated,
    loadHighlights,
    loadNotes,
  ]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setChapters((prev) => {
            const last = prev[prev.length - 1];
            if (last) loadChapters(last.book, last.chapter + 1, 5);
            return prev;
          });
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadChapters]);

  // Scroll-based chapter tracking
  useEffect(() => {
    if (chapters.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!best || entry.intersectionRatio > best.intersectionRatio)
          )
            best = entry;
        }
        if (best) {
          const ck = best.target.getAttribute("data-chapter-key");
          if (!ck) return;
          const ld = ck.lastIndexOf("-");
          const book = ck.substring(0, ld);
          const ch = parseInt(ck.substring(ld + 1), 10);
          if (!book || isNaN(ch)) return;
          setDisplayBook(book);
          setDisplayChapter(ch);
          setSelectedChapter(ch);
        }
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      },
    );
    Object.values(chapterRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [chapters]);

  // Scroll currently-reading verse into view
  useEffect(() => {
    if (!isSpeaking || speechItems.length === 0) return;
    const item = speechItems[currentSpeechIdx];
    if (!item) return;
    verseRefs.current[item.verseKey]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentSpeechIdx, isSpeaking, speechItems]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    if (!bookFilter) return BOOKS;
    return BOOKS.filter((b) =>
      b.toLowerCase().includes(bookFilter.toLowerCase()),
    );
  }, [bookFilter]);

  const isAtVeryStart = displayBook === BOOKS[0] && displayChapter === 1;
  const isAtVeryEnd =
    displayBook === BOOKS[BOOKS.length - 1] &&
    displayChapter >= maxChapterForDisplay;

  // ── Speech engine ─────────────────────────────────────────────────────────

  /**
   * Speak one text string. The promise resolves when the utterance ends
   * OR when skipRef.current() is called (skip forward / back).
   */
  const speakOne = (text: string): Promise<void> =>
    new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      skipRef.current = resolve; // allow external skip
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 1.0;
      u.onend = () => {
        skipRef.current = null;
        resolve();
      };
      u.onerror = () => {
        skipRef.current = null;
        resolve();
      };
      window.speechSynthesis.speak(u);
    });

  /** Main loop: reads from currentIdxRef through speechItemsRef */
  const runLoop = async () => {
    const items = speechItemsRef.current;
    while (currentIdxRef.current < items.length && isReadingRef.current) {
      // Pause gate
      while (isPausedRef.current && isReadingRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!isReadingRef.current) break;

      const i = currentIdxRef.current;
      setCurrentSpeechIdx(i);
      await speakOne(items[i].text);

      // After speaking, advance only if we weren't skipped backwards
      // (skipBack sets currentIdxRef to a lower value before cancelling,
      //  so we must NOT blindly increment — just let the while condition re-check)
      if (isReadingRef.current && currentIdxRef.current === i) {
        currentIdxRef.current = i + 1;
      }
    }

    // Finished naturally
    if (isReadingRef.current) {
      isReadingRef.current = false;
      isPausedRef.current = false;
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSpeechIdx(0);
      setVoiceMode(null);
    }
  };

  const buildChapterItems = (cd: ChapterData): SpeechItem[] =>
    cd.verses.map((v) => ({
      verseKey: v.key,
      verseNum: v.num,
      text: `Verse ${v.num}. ${cleanTextForSpeech(v.text)}`,
    }));

  const buildSelectionItems = (keys: string[]): SpeechItem[] => {
    const sorted = [...keys].sort((a, b) => {
      const am = a.match(/(\d+):(\d+)$/)!,
        bm = b.match(/(\d+):(\d+)$/)!;
      if (!am || !bm) return 0;
      const cd = parseInt(am[1]) - parseInt(bm[1]);
      return cd !== 0 ? cd : parseInt(am[2]) - parseInt(bm[2]);
    });
    return sorted.map((key) => {
      const p = parseVerseKey(key);
      let text = key;
      if (p) {
        const ch = chapters.find(
          (c) => c.book === p.book && c.chapter === p.chapter,
        );
        const v = ch?.verses.find((vv) => vv.num === p.verse);
        if (v) text = `Verse ${p.verse}. ${cleanTextForSpeech(v.text)}`;
      }
      return { verseKey: key, verseNum: p?.verse ?? 0, text };
    });
  };

  const startSpeech = (
    items: SpeechItem[],
    mode: "chapter" | "selected",
    startIdx = 0,
  ) => {
    window.speechSynthesis.cancel();
    speechItemsRef.current = items;
    currentIdxRef.current = startIdx;
    isReadingRef.current = true;
    isPausedRef.current = false;
    setSpeechItems(items);
    setCurrentSpeechIdx(startIdx);
    setIsSpeaking(true);
    setIsPaused(false);
    setVoiceMode(mode);
    runLoop();
  };

  const stopSpeaking = useCallback(() => {
    isReadingRef.current = false;
    isPausedRef.current = false;
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSpeechIdx(0);
    setSpeechItems([]);
    setVoiceMode(null);
  }, []);

  const pauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      isPausedRef.current = false;
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      isPausedRef.current = true;
      setIsPaused(true);
    }
  };

  /**
   * Skip to next verse: cancel current utterance and advance the index.
   * The loop checks `currentIdxRef.current === i` before incrementing,
   * so we pre-set it to i+1 then cancel → loop sees mismatch and stays.
   */
  const skipForward = () => {
    const next = currentIdxRef.current + 1;
    if (next >= speechItemsRef.current.length) {
      stopSpeaking();
      return;
    }
    currentIdxRef.current = next;
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
  };

  /**
   * Skip to previous verse: set index back, then cancel.
   */
  const skipBack = () => {
    const prev = Math.max(0, currentIdxRef.current - 1);
    currentIdxRef.current = prev;
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
  };

  const readChapter = () => {
    if (isSpeaking && voiceMode === "chapter") {
      stopSpeaking();
      return;
    }
    if (isSpeaking) stopSpeaking();
    const cd = chapters.find(
      (c) => c.book === displayBook && c.chapter === displayChapter,
    );
    if (!cd) {
      toast({
        title: "Chapter not loaded",
        description: "Scroll to the chapter first.",
        variant: "destructive",
      });
      return;
    }
    const items = buildChapterItems(cd);
    if (items.length === 0) return;
    startSpeech(items, "chapter", 0);
  };

  const readSelectedVerses = () => {
    if (selectedVerses.length === 0) return;
    if (isSpeaking && voiceMode === "selected") {
      stopSpeaking();
      return;
    }
    if (isSpeaking) stopSpeaking();
    const items = buildSelectionItems(selectedVerses);
    startSpeech(items, "selected", 0);
  };

  // ── Selection helpers ─────────────────────────────────────────────────────

  const toggleVerseSelection = (verseKey: string) => {
    if (selectedVerses.includes(verseKey) && expandedExplanation === verseKey) {
      setExpandedExplanation(null);
      setExpandedFullExplanation((prev) => {
        const n = new Set(prev);
        n.delete(verseKey);
        return n;
      });
    }
    if (expandedExplanation && expandedExplanation !== verseKey)
      setExpandedExplanation(null);
    setSelectedVerses((prev) =>
      prev.includes(verseKey)
        ? prev.filter((v) => v !== verseKey)
        : [...prev, verseKey],
    );
  };

  const clearSelection = useCallback(() => {
    setSelectedVerses([]);
    setExpandedExplanation(null);
    setExpandedFullExplanation(new Set());
  }, []);

  const getSelectionGroups = useCallback(() => {
    const groups = new Map<
      string,
      { book: string; chapter: number; verses: number[] }
    >();
    for (const key of selectedVerses) {
      const p = parseVerseKey(key);
      if (!p) continue;
      const gk = `${p.book}|${p.chapter}`;
      if (!groups.has(gk))
        groups.set(gk, { book: p.book, chapter: p.chapter, verses: [] });
      groups.get(gk)!.verses.push(p.verse);
    }
    return [...groups.values()];
  }, [selectedVerses]);

  // ── Annotation helpers ────────────────────────────────────────────────────
  const isHighlighted = (vk: string) => highlights[vk]?.color;
  const isFavorite = (vk: string) => favorites.has(vk);
  const getVerseNote = (vk: string) => verseNotes[vk] || null;
  const getVerseExplanation = (vk: string) => verseExplanationMap[vk] || null;

  // ── Toggle explanation ────────────────────────────────────────────────────
  const toggleExplanation = async (verseKey: string) => {
    if (expandedExplanation === verseKey) {
      setExpandedExplanation(null);
      setExpandedFullExplanation((prev) => {
        const n = new Set(prev);
        n.delete(verseKey);
        return n;
      });
      requestAnimationFrame(() =>
        verseRefs.current[verseKey]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      );
      return;
    }
    if (verseExplanationMap[verseKey]) {
      setExpandedExplanation(verseKey);
      return;
    }
    const p = parseVerseKey(verseKey);
    if (!p) return;
    setExplanationLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: p.book,
        chapter: p.chapter,
        verseNumber: p.verse,
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
          description: "No explanation found.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load explanation.",
        variant: "destructive",
      });
    } finally {
      setExplanationLoading(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleBookChange = (book: string) => {
    if (book === selectedBook) return;
    if (isSpeaking) stopSpeaking();
    clearSelection();
    chapterRefs.current = {};
    verseRefs.current = {};
    setSelectedBook(book);
    setSelectedChapter(1);
    setDisplayBook(book);
    setDisplayChapter(1);
    setChapters([]);
    setHasMore(true);
    loadChapters(book, 1, 5);
    if (isAuthenticated) {
      loadHighlights(book, 1);
      loadFavorites();
      loadNotes(book, 1);
    }
  };

  const handleChapterChange = (ch: number) => {
    if (isSpeaking) stopSpeaking();
    clearSelection();
    setSelectedChapter(ch);
    const key = `${selectedBook}-${ch}`;
    if (chapterRefs.current[key]) {
      isNavigatingRef.current = true;
      chapterRefs.current[key].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setDisplayBook(selectedBook);
      setDisplayChapter(ch);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    } else {
      chapterRefs.current = {};
      verseRefs.current = {};
      setChapters([]);
      setHasMore(true);
      setDisplayBook(selectedBook);
      setDisplayChapter(ch);
      loadChapters(selectedBook, ch, 5);
      if (isAuthenticated) {
        loadHighlights(selectedBook, ch);
        loadNotes(selectedBook, ch);
      }
    }
  };

  const goToPrevChapter = () => {
    if (displayChapter > 1) {
      handleChapterChange(displayChapter - 1);
    } else {
      const idx = BOOKS.indexOf(displayBook);
      if (idx > 0) {
        const prevBook = BOOKS[idx - 1];
        const lastCh = MAX_CHAPTERS[prevBook] ?? 1;
        if (isSpeaking) stopSpeaking();
        clearSelection();
        chapterRefs.current = {};
        verseRefs.current = {};
        setSelectedBook(prevBook);
        setSelectedChapter(lastCh);
        setDisplayBook(prevBook);
        setDisplayChapter(lastCh);
        setChapters([]);
        setHasMore(true);
        loadChapters(prevBook, lastCh, 5);
        if (isAuthenticated) {
          loadHighlights(prevBook, lastCh);
          loadFavorites();
          loadNotes(prevBook, lastCh);
        }
      }
    }
  };

  const goToNextChapter = () => {
    if (displayChapter < maxChapterForDisplay) {
      handleChapterChange(displayChapter + 1);
    } else {
      const idx = BOOKS.indexOf(displayBook);
      if (idx < BOOKS.length - 1) handleBookChange(BOOKS[idx + 1]);
    }
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
    } catch {
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
        description: "Sign in to highlight.",
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
      selectedVerses.forEach((key) => {
        setHighlights((prev) => ({
          ...prev,
          [key]: { verseKey: key, color, colorId },
        }));
      });
      groups.forEach(({ book, chapter }) => loadHighlights(book, chapter));
    } catch {
      toast({
        title: "Error",
        description: "Failed to highlight.",
        variant: "destructive",
      });
    }
    clearSelection();
  };

  const versesToText = (keys: string[]) => {
    const sorted = [...keys].sort((a, b) => {
      const am = a.match(/(\d+):(\d+)$/)!,
        bm = b.match(/(\d+):(\d+)$/)!;
      if (!am || !bm) return 0;
      const cd = parseInt(am[1]) - parseInt(bm[1]);
      return cd !== 0 ? cd : parseInt(am[2]) - parseInt(bm[2]);
    });
    return sorted
      .map((key) => {
        const p = parseVerseKey(key);
        if (!p) return key;
        const v = chapters
          .find((c) => c.book === p.book && c.chapter === p.chapter)
          ?.verses.find((vn) => vn.num === p.verse);
        return v ? `${key}\n${v.text}` : key;
      })
      .join("\n\n");
  };

  const copyVerses = () => {
    navigator.clipboard.writeText(versesToText(selectedVerses));
    toast({ title: "Copied", description: "Verses copied to clipboard." });
    clearSelection();
  };

  const shareVerses = async () => {
    try {
      await navigator.share({ text: versesToText(selectedVerses) });
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
      toast({ title: "Note Saved" });
    } catch {
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
    handleBookChange(book);
    setTimeout(() => handleChapterChange(chapterNum), 100);
    setShowSearchModal(false);
    setSearchQuery("");
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      setSearchLoading(true);
      try {
        const mod = await VERSION_FILES[versionId]();
        const results: any[] = [];
        Object.entries(mod.default)
          .filter(([, text]) =>
            text.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 30)
          .forEach(([key]) => {
            const m = key.match(/^(.+?)\s+(\d+):(\d+)$/);
            if (m)
              results.push({
                book: m[1],
                chapter: parseInt(m[2]),
                verse: parseInt(m[3]),
              });
          });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  // ── Player derived values ─────────────────────────────────────────────────
  const currentItem = speechItems[currentSpeechIdx] ?? null;
  const progressPct =
    speechItems.length > 0
      ? ((currentSpeechIdx + 1) / speechItems.length) * 100
      : 0;
  const canSkipBack = currentSpeechIdx > 0;
  const canSkipForward = currentSpeechIdx < speechItems.length - 1;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        {/* Top bar */}
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

          <div className="flex items-center gap-2">
            {/* Read Chapter button in header */}
            <Button
              variant={
                isSpeaking && voiceMode === "chapter" ? "default" : "outline"
              }
              size="sm"
              onClick={readChapter}
              className="h-8 px-3 text-xs gap-1.5"
            >
              {isSpeaking && voiceMode === "chapter" ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Read Chapter
                </>
              )}
            </Button>

            <Select value={versionId} onValueChange={setVersionId}>
              <SelectTrigger className="w-[160px] h-8 text-xs border-border/50 bg-muted/30">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_VERSIONS.map((v) => (
                  <SelectItem key={v.id} value={v.id} className="text-xs">
                    {v.name} ({v.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Book + chapter selectors */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/40">
          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter books…"
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className="pl-8 h-8 text-xs border-border/50 bg-muted/30"
            />
          </div>

          <Select value={selectedBook} onValueChange={handleBookChange}>
            <SelectTrigger className="w-[175px] h-8 text-xs border-border/50 bg-muted/30">
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
            value={displayChapter.toString()}
            onValueChange={(val) => handleChapterChange(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue placeholder="Chapter" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {Array.from(
                  { length: maxChapterForDisplay },
                  (_, i) => i + 1,
                ).map((ch) => (
                  <SelectItem
                    key={ch}
                    value={ch.toString()}
                    className="text-xs"
                  >
                    Chapter {ch}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Chapter nav bar */}
        <div className="flex items-center justify-between px-6 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevChapter}
            disabled={isAtVeryStart}
            className="flex items-center gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>
              {displayChapter > 1
                ? `Ch. ${displayChapter - 1}`
                : BOOKS.indexOf(displayBook) > 0
                  ? BOOKS[BOOKS.indexOf(displayBook) - 1]
                  : "Prev"}
            </span>
          </Button>

          <div className="text-center">
            <p
              className="text-sm font-medium text-foreground tracking-wide leading-none"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {displayBook}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Chapter {displayChapter} of {maxChapterForDisplay}
              <span className="mx-1.5 opacity-40">·</span>
              <span className="text-primary/80">
                {currentVersion?.abbreviation}
              </span>
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextChapter}
            disabled={isAtVeryEnd}
            className="flex items-center gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <span>
              {displayChapter < maxChapterForDisplay
                ? `Ch. ${displayChapter + 1}`
                : BOOKS.indexOf(displayBook) < BOOKS.length - 1
                  ? BOOKS[BOOKS.indexOf(displayBook) + 1]
                  : "End"}
            </span>
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

            <button
              onClick={readSelectedVerses}
              className={[
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors whitespace-nowrap",
                isSpeaking && voiceMode === "selected"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              ].join(" ")}
            >
              {isSpeaking && voiceMode === "selected" ? (
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
            style={{ paddingBottom: isSpeaking ? "8rem" : "3rem" }}
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
                {chapters.map((chapter) => {
                  const chapterKey = `${chapter.book}-${chapter.chapter}`;
                  return (
                    <div
                      key={chapterKey}
                      data-chapter-key={chapterKey}
                      ref={(el) => {
                        if (el) chapterRefs.current[chapterKey] = el;
                      }}
                      className="mb-20"
                    >
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

                      <div
                        className="text-[1.25rem] leading-[2.15] text-foreground/90"
                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                      >
                        {chapter.verses.map((verse) => {
                          const highlightColor = isHighlighted(verse.key);
                          const isSelected = selectedVerses.includes(verse.key);
                          const isFav = isFavorite(verse.key);
                          const vNote = getVerseNote(verse.key);
                          const vExplanation = getVerseExplanation(verse.key);
                          const isExplanationExpanded =
                            expandedExplanation === verse.key;
                          const isCurrentlyReading =
                            isSpeaking && currentItem?.verseKey === verse.key;

                          return (
                            <span key={verse.key}>
                              <span
                                ref={(el) => {
                                  verseRefs.current[verse.key] = el;
                                }}
                                onClick={() => toggleVerseSelection(verse.key)}
                                className={[
                                  "inline cursor-pointer rounded transition-all duration-200",
                                  isSelected
                                    ? "bg-primary/15 ring-1 ring-primary/30 -mx-0.5 px-0.5"
                                    : "",
                                  isCurrentlyReading && !isSelected
                                    ? "bg-primary/10 ring-1 ring-primary/20 -mx-0.5 px-0.5"
                                    : "",
                                  highlightColor &&
                                  !isSelected &&
                                  !isCurrentlyReading
                                    ? "-mx-0.5 px-0.5"
                                    : "",
                                ].join(" ")}
                                style={
                                  highlightColor &&
                                  !isSelected &&
                                  !isCurrentlyReading
                                    ? {
                                        backgroundColor: `${highlightColor}28`,
                                        borderBottom: `2px solid ${highlightColor}60`,
                                      }
                                    : undefined
                                }
                              >
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
                                {!isSelected && (
                                  <>
                                    {isFav && (
                                      <Star
                                        className="inline w-3 h-3 ml-1 text-amber-400 fill-amber-400"
                                        style={{ verticalAlign: "middle" }}
                                      />
                                    )}
                                    {vNote && !isFav && (
                                      <span className="text-xs text-muted-foreground ml-1 not-italic">
                                        📝
                                      </span>
                                    )}
                                  </>
                                )}{" "}
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
                                    {explanationLoading &&
                                    expandedExplanation === verse.key ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    ) : isExplanationExpanded ? (
                                      "Close"
                                    ) : (
                                      "Explain"
                                    )}
                                  </button>
                                )}{" "}
                              </span>

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
                                            setExpandedFullExplanation(
                                              (prev) => {
                                                const n = new Set(prev);
                                                n.has(verse.key)
                                                  ? n.delete(verse.key)
                                                  : n.add(verse.key);
                                                return n;
                                              },
                                            );
                                          }}
                                          className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                          {expandedFullExplanation.has(
                                            verse.key,
                                          ) ? (
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
                  );
                })}

                {/* Infinite scroll sentinel */}
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
        currentChapter={selectedChapter}
      />

      {/* ── Voice Player ── */}
      {isSpeaking && (
        <VoicePlayerBar
          currentItem={currentItem}
          currentIndex={currentSpeechIdx}
          total={speechItems.length}
          progress={progressPct}
          isPaused={isPaused}
          voiceMode={voiceMode}
          displayBook={displayBook}
          displayChapter={displayChapter}
          canSkipBack={canSkipBack}
          canSkipForward={canSkipForward}
          onPauseResume={pauseResume}
          onStop={stopSpeaking}
          onSkipBack={skipBack}
          onSkipForward={skipForward}
        />
      )}
    </div>
  );
}

// ── Voice Player Bar ───────────────────────────────────────────────────────

interface VoicePlayerBarProps {
  currentItem: SpeechItem | null;
  currentIndex: number;
  total: number;
  progress: number;
  isPaused: boolean;
  voiceMode: "chapter" | "selected" | null;
  displayBook: string;
  displayChapter: number;
  canSkipBack: boolean;
  canSkipForward: boolean;
  onPauseResume: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

function VoicePlayerBar({
  currentItem,
  currentIndex,
  total,
  progress,
  isPaused,
  voiceMode,
  displayBook,
  displayChapter,
  canSkipBack,
  canSkipForward,
  onPauseResume,
  onStop,
  onSkipBack,
  onSkipForward,
}: VoicePlayerBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div
        className="max-w-xl mx-auto rounded-2xl border border-border/70 shadow-2xl overflow-hidden pointer-events-auto"
        style={{
          background: "hsl(var(--background) / 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Progress bar */}
        <div className="h-[3px] w-full bg-muted/50">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Icon + info */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className={[
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                isPaused ? "bg-muted" : "bg-primary/10",
              ].join(" ")}
            >
              {isPaused ? (
                <Pause className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-0.5 truncate">
                {voiceMode === "chapter"
                  ? `${displayBook} · Chapter ${displayChapter}`
                  : "Selected verses"}
              </p>
              <p
                className="text-sm font-semibold text-foreground truncate leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {currentItem ? `Verse ${currentItem.verseNum}` : "—"}
              </p>
            </div>
          </div>

          {/* Counter */}
          <div className="flex-shrink-0 tabular-nums text-xs text-muted-foreground min-w-[44px] text-center">
            <span className="font-medium text-foreground">
              {currentIndex + 1}
            </span>
            <span className="opacity-40 mx-0.5">/</span>
            {total}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Prev verse */}
            <PlayerIconBtn
              onClick={onSkipBack}
              disabled={!canSkipBack}
              title="Previous verse"
            >
              <SkipBack className="w-4 h-4" />
            </PlayerIconBtn>

            {/* Pause / Resume — primary accent */}
            <button
              onClick={onPauseResume}
              title={isPaused ? "Resume" : "Pause"}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all mx-1"
            >
              {isPaused ? (
                <Play className="w-4 h-4 ml-0.5" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>

            {/* Next verse */}
            <PlayerIconBtn
              onClick={onSkipForward}
              disabled={!canSkipForward}
              title="Next verse"
            >
              <SkipForward className="w-4 h-4" />
            </PlayerIconBtn>

            {/* Divider */}
            <div className="w-px h-5 bg-border/50 mx-1.5" />

            {/* Stop */}
            <PlayerIconBtn
              onClick={onStop}
              title="Stop reading"
              className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <VolumeX className="w-4 h-4" />
            </PlayerIconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerIconBtn({
  onClick,
  disabled,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95",
        "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        "disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Toolbar button ─────────────────────────────────────────────────────────

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
