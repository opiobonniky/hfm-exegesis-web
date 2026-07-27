import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  X,
  Copy,
  Lightbulb,
  GraduationCap,
  Volume2,
  VolumeX,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";
import { bibleApi, mapTranslationId, mapFrontendId, getTranslationSettings } from "@/services/bibleApi";
import {
  HighlightPickerModal,
  SearchModal,
  NoteModal,
  RangePickerModal,
} from "@/components/BibleModals";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { getVerseWords } from "@/services/strongsApi";
import WordDetailSheet from "@/components/WordDetailSheet";
import StudyToolsSheet from "@/components/StudyToolsSheet";
import HowToStudySheet from "@/components/HowToStudySheet";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import MobileNavDrawer from "@/components/MobileNavDrawer";
import VerseDisplay from "@/components/VerseDisplay";
import SelectionActionBar from "@/components/SelectionActionBar";
import BibleReaderHeader from "@/components/BibleReaderHeader";
import {
  type Highlight,
  type ChapterData,
  type SpeechItem,
  type StrongsWord,
  type TranslationOption,
  FREE_TRANSLATION_IDS,
  HIGHLIGHT_COLORS,
  renderVerseWithStrongs,
  parseVerseKey,
  cleanTextForSpeech,
  TextContent,
} from "@/lib/bibleHelpers";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function BibleReader() {
  const { t, isRtl } = useLanguage();
  const audio = useAudioPlayer();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);
  const [searchParams] = useSearchParams();

  const urlBook = searchParams.get("book");
  const urlChapter = searchParams.get("chapter");
  const urlTranslation = searchParams.get("translation");

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

  // ── State ──
  const [selectedBook, setSelectedBook] = useState(urlBook || "Genesis");
  const [selectedChapter, setSelectedChapter] = useState(
    urlChapter ? parseInt(urlChapter, 10) : 1,
  );
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [versionId, setVersionId] = useState(urlTranslation || "Berean");
  const [bookFilter, setBookFilter] = useState("");
  const [displayBook, setDisplayBook] = useState(urlBook || "Genesis");
  const [displayChapter, setDisplayChapter] = useState(
    urlChapter ? parseInt(urlChapter, 10) : 1,
  );
  const [availableTranslations, setAvailableTranslations] = useState<
    TranslationOption[]
  >([]);
  const [freeTranslationsOnly, setFreeTranslationsOnly] = useState(false);
  const [backendBooks, setBackendBooks] = useState<
    { bookNumber: number; bookName: string; maxChapter: number }[]
  >([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const isNavigatingRef = useRef(false);
  const loadingRef = useRef(false);
  const pendingNavigationRef = useRef<{
    book: string;
    startChapter: number;
    count: number;
  } | null>(null);
  const scrollObserverRef = useRef<IntersectionObserver | null>(null);

  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});

  const [verseExplanationMap, setVerseExplanationMap] = useState<
    Record<string, { explanation: string; learnMore?: string; promptIds?: number[] }>
  >({});
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(
    null,
  );
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [expandedFullExplanation, setExpandedFullExplanation] = useState<
    Set<string>
  >(new Set());

  const [verseExplanationPrompts, setVerseExplanationPrompts] = useState<
    Record<string, { id: number; prompt: string; category: string }[]>
  >({});

  const [chapterPrompts, setChapterPrompts] = useState<
    Record<string, { id: number; prompt: string; category: string }[]>
  >({});

  const [allPromptsLoaded, setAllPromptsLoaded] = useState(false);
  const [allPrompts, setAllPrompts] = useState<
    {
      id: number;
      prompt: string;
      category: string;
      bookName: string | null;
      chapter: number | null;
      verseNumber: number | null;
    }[]
  >([]);

  const [voiceMode, setVoiceMode] = useState<"chapter" | "selected" | null>(
    null,
  );
  const [speechItems, setSpeechItems] = useState<SpeechItem[]>([]);
  const [afterPlay, setAfterPlay] = useState<"continue" | "stop">("continue");
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);

  const previousVolumeRef = useRef(1);
  const displayBookRef = useRef(displayBook);
  const displayChapterRef = useRef(displayChapter);
  const afterPlayRef = useRef<"continue" | "stop">("continue");

  useEffect(() => {
    displayBookRef.current = displayBook;
  }, [displayBook]);

  useEffect(() => {
    displayChapterRef.current = displayChapter;
  }, [displayChapter]);

  useEffect(() => {
    afterPlayRef.current = afterPlay;
  }, [afterPlay]);

  useEffect(() => {
    localStorage.setItem(
      "exegesis_last_bible",
      JSON.stringify({ book: selectedBook, chapter: selectedChapter }),
    );
  }, [selectedBook, selectedChapter]);





  // Sleep timer countdown effect
  useEffect(() => {
    if (sleepTimer && sleepTimer > 0) {
      const interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired - stop speaking
            audio.stopPlayback();
            setSleepTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sleepTimer, audio.stopPlayback]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Desktop-only book filter
  const [verseWordsMap, setVerseWordsMap] = useState<
  Record<string, StrongsWord[]>
>({});
  const [strongsWordModalOpen, setStrongsWordModalOpen] = useState(false);
  const [selectedStrongsId, setSelectedStrongsId] = useState<string | null>(null);
  const [selectedStrongsWordText, setSelectedStrongsWordText] = useState<string>("");

  const handleWordTap = useCallback((strongsId: string, wordText: string) => {
    setSelectedStrongsId(strongsId);
    setSelectedStrongsWordText(wordText);
    setStrongsWordModalOpen(true);
  }, []);

  const [desktopBookFilter, setDesktopBookFilter] = useState("");

  const [showStudyTools, setShowStudyTools] = useState(false);
  const [showHowToStudy, setShowHowToStudy] = useState(false);

  // ── Strong's verse words loading ──
  const loadVerseWordsForChapter = useCallback(
    async (book: string, chapter: number) => {
      const chapterKey = `${book}-${chapter}`;
      try {
        if (versionId !== 'Berean') return; // Strong's only available for Berean

        const words = await getVerseWords(book, chapter);
        if (!words || words.length === 0) return;

        // Group words by verse number
        const grouped: Record<
          string,
          StrongsWord[]
        > = {};
        for (const w of words) {
          const vNum = w.verseNumber || 1;
          const key = `${book} ${chapter}:${vNum}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            text: w.surfaceText,
            strongsId: w.strongsId,
            hasData: w.hasData,
          });
        }

        setVerseWordsMap((prev) => ({ ...prev, ...grouped }));
      } catch {
        // Silently fail — Strong's data is additive
      }
    },
    [versionId],
  );

  // Load Strong's verse words when the chapter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVerseWordsForChapter(selectedBook, selectedChapter);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, selectedChapter]);

  // Helper to get Strong's words for a verse key
  const getStrongsForVerse = useCallback(
    (verseKey: string) => {
      return verseWordsMap[verseKey] || [];
    },
    [verseWordsMap],
  );

  // Translation search
  const [translationSearch, setTranslationSearch] = useState("");
  const [translationOpen, setTranslationOpen] = useState(false);

  const effectiveTranslations = useMemo(() => {
    if (!freeTranslationsOnly) return availableTranslations;
    return availableTranslations.filter((t) => FREE_TRANSLATION_IDS.has(t.id));
  }, [availableTranslations, freeTranslationsOnly]);

  // Reset to a free translation if current one is no longer available
  useEffect(() => {
    if (freeTranslationsOnly && availableTranslations.length > 0) {
      const isFree = FREE_TRANSLATION_IDS.has(versionId);
      if (!isFree) {
        const firstFree = availableTranslations.find((t) => FREE_TRANSLATION_IDS.has(t.id));
        if (firstFree) setVersionId(firstFree.id);
      }
    }
  }, [freeTranslationsOnly, availableTranslations.length, versionId]);

  const filteredTranslations = useMemo(() => {
    if (!translationSearch.trim()) return effectiveTranslations;
    const search = translationSearch.toLowerCase();
    return effectiveTranslations.filter(
      (tr) =>
        tr.name.toLowerCase().includes(search) ||
        tr.shortName.toLowerCase().includes(search),
    );
  }, [translationSearch, effectiveTranslations]);

  const currentVersion = useMemo(() => {
    const trans = effectiveTranslations.find((tr) => tr.id === versionId);
    return trans
      ? { abbreviation: trans.shortName, name: trans.name }
      : { abbreviation: versionId, name: versionId };
  }, [versionId, effectiveTranslations]);

  const getMaxChapter = (bookName: string): number => {
    const book = backendBooks.find((b) => b.bookName === bookName);
    return book?.maxChapter ?? 1;
  };

  const maxChapterForDisplay = getMaxChapter(displayBook);
  const currentChapterVerseCount = useMemo(
    () =>
      chapters.find(
        (c) => c.book === displayBook && c.chapter === displayChapter,
      )?.verses.length || 0,
    [chapters, displayBook, displayChapter],
  );

  const filteredBooks = useMemo(() => {
    if (backendBooks.length === 0) return [];
    if (!desktopBookFilter) return backendBooks.map((b) => b.bookName);
    return backendBooks
      .map((b) => b.bookName)
      .filter((b) => b.toLowerCase().includes(desktopBookFilter.toLowerCase()));
  }, [desktopBookFilter, backendBooks]);

  // Load available translations and books on mount
  useEffect(() => {
    const loadData = async () => {
      // Load translation settings
      let loadedDefaultId = "Berean";
      try {
        const settings = await getTranslationSettings();
        setFreeTranslationsOnly(settings.freeTranslationsOnly);
        loadedDefaultId = settings.defaultTranslationId;
      } catch (e) {
        console.error("Failed to load translation settings:", e);
      }

      // Load translations
      const translations = await bibleApi.getTranslations();
      const sorted = [...translations].sort((a, b) => {
        const popular = [
          "Berean",
          "KJV",
          "NIV",
          "ESV",
          "GW",
          "NASB",
          "NLT",
          "BSB",
          "CSB",
        ];
        const aIdx = popular.indexOf(a.id);
        const bIdx = popular.indexOf(b.id);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
      const options = sorted.map((t) => ({
        id: t.id,
        name: t.year ? `${t.name} (${t.year})` : t.name,
        shortName: t.shortName,
        year: t.year,
      }));
      setAvailableTranslations(options);

      // Apply URL translation param (overrides admin default)
      if (urlTranslation && urlTranslation !== "Berean") {
        const exists = options.some((o) => o.id === urlTranslation);
        if (exists) setVersionId(urlTranslation);
      } else if (loadedDefaultId && loadedDefaultId !== "Berean") {
        // Fallback to admin-configured default translation
        const exists = options.some((o) => o.id === loadedDefaultId);
        if (exists) setVersionId(loadedDefaultId);
      }

      // Load books from Berean translation
      setBooksLoading(true);
      try {
        const backendId = mapTranslationId("Berean");
        const books = await bibleApi.getBooksWithMaxChapters(backendId);
        setBackendBooks(
          books.map((b) => ({
            bookNumber: b.bookNumber,
            bookName: b.bookName,
            maxChapter: b.maxChapter,
          })),
        );
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setBooksLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Data loading ──
  const loadChapters = useCallback(
    async (book: string, startChapter: number, count: number) => {
      if (loadingRef.current) return;
      if (backendBooks.length === 0) return; // Wait for books to load first

      loadingRef.current = true;
      setLoading(true);
      pendingNavigationRef.current = null;
      try {
        const translationId = mapTranslationId(versionId);
        const maxChapter = getMaxChapter(book);

        // Determine which chapters to fetch
        const chaptersToFetch: number[] = [];
        for (let i = 0; i < count; i++) {
          const ch = startChapter + i;
          if (ch > maxChapter) break;
          chaptersToFetch.push(ch);
        }

        let loaded: ChapterData[];

        if (chaptersToFetch.length > 1) {
          // Use batch endpoint for multiple chapters — single HTTP round trip
          const batchData = await bibleApi.getVersesBatch(translationId, book, chaptersToFetch);
          loaded = batchData.map((cd) => ({
            book,
            chapter: cd.chapterNumber,
            verses: cd.verses.map((v) => ({
              key: `${book} ${cd.chapterNumber}:${v.verseNumber}`,
              text: v.text,
              num: v.verseNumber,
            })),
          }));
        } else if (chaptersToFetch.length === 1) {
          const ch = chaptersToFetch[0];
          const verseData = await bibleApi.getVerses(translationId, book, ch);
          loaded = [{
            book,
            chapter: ch,
            verses: verseData.verses.map((v) => ({
              key: `${book} ${ch}:${v.verseNumber}`,
              text: v.text,
              num: v.verseNumber,
            })),
          }];
        } else {
          loaded = [];
        }

        setChapters((prev) => {
          const ex = new Set(prev.map((c) => `${c.book}-${c.chapter}`));
          return [
            ...prev,
            ...loaded.filter((c) => !ex.has(`${c.book}-${c.chapter}`)),
          ];
        });
        setHasMore(loaded.length === chaptersToFetch.length);
      } catch (err) {
        console.error("Failed to load chapters:", err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
        const pending = pendingNavigationRef.current;
        if (pending) {
          pendingNavigationRef.current = null;
          setChapters([]);
          setHasMore(true);
          loadChapters(pending.book, pending.startChapter, pending.count);
        }
      }
    },
    [versionId, backendBooks],
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

  const loadChapterPrompts = useCallback(
    async (book: string, chapter: number) => {
      const key = `${book}-${chapter}`;
      if (chapterPrompts[key]) return;

      let promptsToUse = allPrompts;

      if (!allPromptsLoaded) {
        try {
          const res = await sendPostRequest("journal", "prompts/get-all", {
            isActive: true,
          });
          if (res.returnCode === 200 && res.returnData) {
            promptsToUse = res.returnData;
            setAllPrompts(res.returnData);
            setAllPromptsLoaded(true);
          }
        } catch (e) {
          console.error(e);
          return;
        }
      }

      const chapterPromptsForChapter = promptsToUse.filter(
        (p: any) =>
          p.bookName === book && p.chapter === chapter && !p.verseNumber,
      );
      setChapterPrompts((prev) => ({
        ...prev,
        [key]: chapterPromptsForChapter,
      }));
    },
    [allPrompts, allPromptsLoaded, chapterPrompts],
  );

  // ── Effects ──
  useEffect(() => {
    chapterRefs.current = {};
    verseRefs.current = {};
    setChapters([]);
    setHasMore(true);
    setDisplayBook(selectedBook);
    setDisplayChapter(selectedChapter);
    loadChapters(selectedBook, selectedChapter, 8);
    if (isAuthenticated) {
      loadHighlights(selectedBook, selectedChapter);
      loadFavorites();
      loadNotes(selectedBook, selectedChapter);
    }
    loadChapterPrompts(selectedBook, selectedChapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, versionId]);

  // Load chapters when backendBooks becomes available (after initial load)
  useEffect(() => {
    if (backendBooks.length > 0 && chapters.length === 0) {
      loadChapters(selectedBook, selectedChapter, 8);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendBooks.length]);

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
    loadChapterPrompts(selectedBook, selectedChapter);
  }, [
    selectedChapter,
    selectedBook,
    isAuthenticated,
    loadHighlights,
    loadNotes,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Infinite scroll: load more chapters when last chapter is visible
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            hasMore &&
            !loadingRef.current &&
            chapters.length > 0
          ) {
            const lastChapter = chapters[chapters.length - 1];
            const nextChapter = lastChapter.chapter + 1;
            const maxChapter = getMaxChapter(lastChapter.book);
            if (nextChapter <= maxChapter) {
              loadChapters(lastChapter.book, nextChapter, 3);
            }
          }
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadChapters, chapters]);

  // Stable observer — created once, never disconnects, so intersection state is never lost.
  useEffect(() => {
    scrollObserverRef.current = new IntersectionObserver(
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
          if (book !== displayBookRef.current || ch !== displayChapterRef.current) {
            setSelectedVerse(null);
          }
          setDisplayBook(book);
          setDisplayChapter(ch);
          // NOT updating selectedChapter — prevents scroll fighting
        }
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      },
    );
    return () => {
      scrollObserverRef.current?.disconnect();
      scrollObserverRef.current = null;
    };
  }, []);

  // Observe new chapter elements as they render — doesn't disconnect existing observer.
  useEffect(() => {
    if (chapters.length === 0 || !scrollObserverRef.current) return;
    Object.values(chapterRefs.current).forEach((el) => {
      if (el) scrollObserverRef.current?.observe(el);
    });
  }, [chapters]);

  useEffect(() => {
    if (!audio.isPlaying || speechItems.length === 0) return;
    const item = speechItems[audio.currentVerseIdx];
    if (!item) return;
    verseRefs.current[item.verseKey]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [audio.currentVerseIdx, audio.isPlaying, speechItems]);

  // ── Derived ──
  const isSpeaking = audio.isPlaying;
  const bookNames = backendBooks.map((b) => b.bookName);
  const isAtVeryStart =
    bookNames.length > 0 &&
    bookNames[0] === displayBook &&
    displayChapter === 1;
  const isAtVeryEnd =
    bookNames.length > 0 &&
    bookNames[bookNames.length - 1] === displayBook &&
    displayChapter >= maxChapterForDisplay;

  // ── Speech ──


  const advanceToNextChapter = async (): Promise<boolean> => {
    const bookNames = backendBooks.map((b) => b.bookName);
    const currentBookIdx = bookNames.indexOf(displayBookRef.current);
    let nextBook = displayBookRef.current;
    let nextChapter = displayChapterRef.current + 1;

    if (nextChapter > getMaxChapter(displayBookRef.current)) {
      if (currentBookIdx >= 0 && currentBookIdx < bookNames.length - 1) {
        nextBook = bookNames[currentBookIdx + 1];
        nextChapter = 1;
      } else {
        return false;
      }
    }

    try {
      const translationId = mapTranslationId(versionId);
      const verseData = await bibleApi.getVerses(
        translationId,
        nextBook,
        nextChapter,
      );
      const verses = verseData.verses.map((v) => ({
        key: `${nextBook} ${nextChapter}:${v.verseNumber}`,
        text: v.text,
        num: v.verseNumber,
      }));
      const nextChapterData = { book: nextBook, chapter: nextChapter, verses };
      const nextItems = buildChapterItems(nextChapterData);
      setSpeechItems(nextItems);
      audio.startPlayback(nextItems.map(i => ({ text: i.text })), 0);
      setDisplayBook(nextBook);
      setDisplayChapter(nextChapter);
      setSelectedBook(nextBook);
      setSelectedChapter(nextChapter);
      setChapters((prev) => {
        const ex = new Set(prev.map((c) => `${c.book}-${c.chapter}`));
        if (ex.has(`${nextBook}-${nextChapter}`)) return prev;
        return [...prev, nextChapterData];
      });
      return true;
    } catch (err) {
      console.error("Failed to load next chapter for audio:", err);
      return false;
    }
  };


  const buildChapterItems = (cd: ChapterData): SpeechItem[] =>
    cd.verses.map((v) => ({
      verseKey: v.key,
      verseNum: v.num,
      text: cleanTextForSpeech(v.text),
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
        if (v) text = cleanTextForSpeech(v.text);
      }
      return { verseKey: key, verseNum: p?.verse ?? 0, text };
    });
  };

  const startSpeech = (
    items: SpeechItem[],
    mode: "chapter" | "selected",
    startIdx = 0,
  ) => {
    setSpeechItems(items);
    setVoiceMode(mode);
    audio.startPlayback(items.map(i => ({ text: i.text })), startIdx);
  };

  const stopSpeaking = useCallback(() => {
    audio.stopPlayback();
    setSpeechItems([]);
    setVoiceMode(null);
    audio.setRepeatMode("none");
  }, []);

  const pauseResume = () => {
    audio.togglePause();
  };

  const toggleRepeatMode = () => {
    audio.cycleRepeatMode();
  };

  const toggleAfterPlay = () => {
    setAfterPlay((prev) => (prev === "continue" ? "stop" : "continue"));
  };

  const setSleepTimerMinutes = (minutes: number | null) => {
    if (minutes === null) {
      // Cancel timer
      setSleepTimer(null);
      setSleepTimerRemaining(0);
    } else {
      const seconds = minutes * 60;
      setSleepTimer(seconds);
      setSleepTimerRemaining(seconds);
    }
  };

  const handleSpeedChange = (newRate: number) => {
    audio.setSpeechRate(newRate);
  };

  const skipForward = () => {
    audio.skipForward();
  };

  const skipBack = () => {
    audio.skipBackward();
  };


  const readChapter = () => {
    if (audio.isPlaying && voiceMode === "chapter") {
      audio.stopPlayback();
      setSpeechItems([]);
      setVoiceMode(null);
      return;
    }
    if (audio.isPlaying) {
      audio.stopPlayback();
      setVoiceMode(null);
    }
    const cd = chapters.find(
      (c) => c.book === displayBook && c.chapter === displayChapter,
    );
    if (!cd) {
      toast({
        title: t.bibleReader.chapterNotLoaded,
        description: t.bibleReader.scrollToChapter,
        variant: "destructive",
      });
      return;
    }
    if (isAuthenticated) {
      for (const v of cd.verses) {
        const p = parseVerseKey(v.key);
        if (p)
          sendPostRequest("bible", "add-read-history", {
            bookName: p.book,
            chapter: p.chapter,
            verseNumber: p.verse,
          }).catch(console.error);
      }
    }
    const items = buildChapterItems(cd);
    if (items.length === 0) return;
    startSpeech(items, "chapter", 0);
  };

  const readSelectedVerses = () => {
    if (selectedVerses.length === 0) return;
    if (audio.isPlaying && voiceMode === "selected") {
      audio.stopPlayback();
      setSpeechItems([]);
      setVoiceMode(null);
      return;
    }
    if (audio.isPlaying) {
      audio.stopPlayback();
      setVoiceMode(null);
    }
    if (isAuthenticated) {
      for (const vk of selectedVerses) {
        const p = parseVerseKey(vk);
        if (p)
          sendPostRequest("bible", "add-read-history", {
            bookName: p.book,
            chapter: p.chapter,
            verseNumber: p.verse,
          }).catch(console.error);
      }
    }
    const items = buildSelectionItems(selectedVerses);
    startSpeech(items, "selected", 0);
  };

  // ── Selection helpers ──
  const trackReadHistory = async (verseKey: string) => {
    if (!isAuthenticated) return;
    const p = parseVerseKey(verseKey);
    if (!p) return;
    try {
      await sendPostRequest("bible", "add-read-history", {
        bookName: p.book,
        chapter: p.chapter,
        verseNumber: p.verse,
      });
    } catch (e) {
      console.error(e);
    }
  };

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
    trackReadHistory(verseKey);
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

  const isSingleChapterSelection = useCallback(() => {
    if (selectedVerses.length === 0) return true;
    return getSelectionGroups().length === 1;
  }, [selectedVerses, getSelectionGroups]);

  const isConsecutiveSelection = useCallback(() => {
    const groups = getSelectionGroups();
    if (groups.length !== 1) return false;
    const verses = [...groups[0].verses].sort((a, b) => a - b);
    for (let i = 1; i < verses.length; i++) {
      if (verses[i] !== verses[i - 1] + 1) return false;
    }
    return true;
  }, [selectedVerses, getSelectionGroups]);

  // ── Annotation helpers ──
  const isHighlighted = (vk: string) => highlights[vk]?.color;
  const isFavorite = (vk: string) => favorites.has(vk);
  const getVerseNote = (vk: string) => verseNotes[vk] || null;
  const getVerseExplanation = (vk: string) =>
    verseExplanationMap[vk]?.explanation || null;
  const getVerseLearnMore = (vk: string) =>
    verseExplanationMap[vk]?.learnMore || null;
  const getVerseExplanationPrompts = (vk: string) =>
    verseExplanationPrompts[vk] || [];

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

    let promptsToUse = allPrompts;
    if (!allPromptsLoaded) {
      try {
        const promptsRes = await sendPostRequest("journal", "prompts/get-all", {
          isActive: true,
        });
        if (promptsRes.returnCode === 200 && promptsRes.returnData) {
          promptsToUse = promptsRes.returnData;
          setAllPrompts(promptsRes.returnData);
          setAllPromptsLoaded(true);
        }
      } catch (e) {
        console.error("Error loading prompts:", e);
      }
    }

    try {
      const versePrompts = promptsToUse.filter(
        (prompt: any) =>
          prompt.bookName === p.book &&
          prompt.chapter === p.chapter &&
          prompt.verseNumber === p.verse,
      );

      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: p.book,
        chapter: p.chapter,
        verseNumber: p.verse,
      });

      if (res?.returnCode === 404) {
        setExplanationLoading(false);
        toast({
          title: t.bibleReader.noExplanationTitle,
          description: res.returnMessage || t.bibleReader.noExplanationFound,
        });
        return;
      }

      if (res?.returnCode === 200 && res.returnData?.explanation) {
        const data = res.returnData;
        let promptIds: number[] = [];
        if (data.promptIds) {
          try {
            const parsed = JSON.parse(data.promptIds);
            if (Array.isArray(parsed)) {
              promptIds = parsed.map(Number);
            }
          } catch (e) {
            console.error("Error parsing promptIds:", e);
          }
        }

        let allVersePrompts = [...versePrompts];
        if (promptIds.length > 0) {
          const additionalPrompts = promptsToUse.filter((prompt: any) =>
            promptIds.includes(prompt.id),
          );
          allVersePrompts = [...allVersePrompts, ...additionalPrompts];
        }

        setVerseExplanationMap((prev) => ({
          ...prev,
          [verseKey]: { explanation: data.explanation, learnMore: data.learnMore, promptIds },
        }));

        if (allVersePrompts.length > 0) {
          setVerseExplanationPrompts((prev) => ({
            ...prev,
            [verseKey]: allVersePrompts,
          }));
        }
        setExpandedExplanation(verseKey);
      } else if (versePrompts.length > 0) {
        setVerseExplanationPrompts((prev) => ({
          ...prev,
          [verseKey]: versePrompts,
        }));
        setExpandedExplanation(verseKey);
      } else {
        toast({
          title: t.bibleReader.noExplanationTitle,
          description: t.bibleReader.noExplanationFound,
        });
      }
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToLoadExplanation,
        variant: "destructive",
      });
    } finally {
      setExplanationLoading(false);
    }
  };

  // ── Navigation ──
  const handleBookChange = (book: string) => {
    if (book === selectedBook) return;
    if (audio.isPlaying) audio.stopPlayback();
    clearSelection();
    setSelectedVerse(null);
    chapterRefs.current = {};
    verseRefs.current = {};
    setSelectedBook(book);
    setSelectedChapter(1);
    setDisplayBook(book);
    setDisplayChapter(1);
    setChapters([]);
    setHasMore(true);
    loadChapters(book, 1, 8);
    if (isAuthenticated) {
      loadHighlights(book, 1);
      loadFavorites();
      loadNotes(book, 1);
    }
  };

  const handleChapterChange = (ch: number) => {
    if (audio.isPlaying) audio.stopPlayback();
    clearSelection();
    setSelectedVerse(null);
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
      loadChapters(selectedBook, ch, 8);
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
      const bookNames = backendBooks.map((b) => b.bookName);
      const idx = bookNames.indexOf(displayBook);
      if (idx > 0) {
        const prevBook = bookNames[idx - 1];
        const lastCh = getMaxChapter(prevBook);
        if (audio.isPlaying) audio.stopPlayback();
        clearSelection();
        setSelectedVerse(null);
        chapterRefs.current = {};
        verseRefs.current = {};
        setSelectedBook(prevBook);
        setSelectedChapter(lastCh);
        setDisplayBook(prevBook);
        setDisplayChapter(lastCh);
        setChapters([]);
        setHasMore(true);
        loadChapters(prevBook, lastCh, 8);
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
      const bookNames = backendBooks.map((b) => b.bookName);
      const idx = bookNames.indexOf(displayBook);
      if (idx >= 0 && idx < bookNames.length - 1) {
        handleBookChange(bookNames[idx + 1]);
      }
    }
  };

  const handleVerseChange = (verseStr: string) => {
    const verseNum = parseInt(verseStr, 10);
    if (isNaN(verseNum)) return;
    setSelectedVerse(verseNum);
    const verseKey = `${displayBook} ${displayChapter}:${verseNum}`;
    const el = verseRefs.current[verseKey];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ── Actions ──
  const addFavorite = async (rangeStart?: number, rangeEnd?: number) => {
    if (!isAuthenticated) {
      toast({
        title: t.bibleReader.signInRequired,
        description: t.bibleReader.signInToFavorite,
        variant: "destructive",
      });
      return;
    }
    if (selectedVerses.length === 0 && (!rangeStart || !rangeEnd)) return;
    try {
      if (rangeStart && rangeEnd) {
        const verses = [];
        for (let v = rangeStart; v <= rangeEnd; v++) verses.push(v);
        await sendPostRequest("bible", "add-favorite", {
          bookName: displayBook,
          chapter: displayChapter,
          verseNumbers: verses,
        });
      } else {
        await Promise.all(
          getSelectionGroups().map(({ book, chapter, verses }) =>
            sendPostRequest("bible", "add-favorite", {
              bookName: book,
              chapter,
              verseNumbers: verses,
            }),
          ),
        );
      }
      toast({ title: t.bibleReader.addedToFavorites });
      loadFavorites();
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToAddFavorite,
        variant: "destructive",
      });
    }
    clearSelection();
  };

  const highlightVerses = async (
    colorId: number,
    color: string,
    rangeStart?: number,
    rangeEnd?: number,
  ) => {
    if (!isAuthenticated) {
      toast({
        title: t.bibleReader.signInRequired,
        description: t.bibleReader.signInToHighlight,
        variant: "destructive",
      });
      return;
    }
    try {
      if (rangeStart && rangeEnd) {
        const verses = [];
        for (let v = rangeStart; v <= rangeEnd; v++) verses.push(v);
        await Promise.all(
          verses.map((vn) =>
            sendPostRequest("bible", "add-highlight", {
              bookName: displayBook,
              chapter: displayChapter,
              verseNumber: vn,
              colorId,
              note: "",
            }),
          ),
        );
        for (let v = rangeStart; v <= rangeEnd; v++) {
          const key = `${displayBook} ${displayChapter}:${v}`;
          setHighlights((prev) => ({
            ...prev,
            [key]: { verseKey: key, color, colorId },
          }));
        }
        loadHighlights(displayBook, displayChapter);
      } else {
        const groups = getSelectionGroups();
        if (groups.length === 0) return;
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
      }
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToHighlight,
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
    if (selectedVerses.length === 0) return;
    navigator.clipboard.writeText(versesToText(selectedVerses));
    toast({ title: t.bibleReader.copiedLabel, description: t.bibleReader.versesCopied });
    clearSelection();
  };

  const copyVersesRange = (rangeStart?: number, rangeEnd?: number) => {
    if (rangeStart !== undefined && rangeEnd !== undefined) {
      const verses: string[] = [];
      for (let v = rangeStart; v <= rangeEnd; v++)
        verses.push(`${displayBook} ${displayChapter}:${v}`);
      navigator.clipboard.writeText(versesToText(verses));
      toast({
        title: t.bibleReader.copiedLabel,
        description: `Verses ${rangeStart}-${rangeEnd} copied.`,
      });
    } else {
      navigator.clipboard.writeText(versesToText(selectedVerses));
      const groups = getSelectionGroups();
      if (groups.length === 1) {
        const g = groups[0];
        toast({
          title: t.bibleReader.copiedLabel,
          description: `${g.book} ${g.chapter}:${Math.min(...g.verses)}-${Math.max(...g.verses)}`,
        });
      } else {
        toast({
          title: t.bibleReader.copiedLabel,
          description: `${selectedVerses.length} verses copied.`,
        });
      }
    }
  };

  const shareVerses = async () => {
    if (selectedVerses.length === 0) return;
    try {
      await navigator.share({ text: versesToText(selectedVerses) });
    } catch (e) {
      console.error(e);
    }
    clearSelection();
  };

  const shareVersesRange = async (rangeStart?: number, rangeEnd?: number) => {
    if (rangeStart !== undefined && rangeEnd !== undefined) {
      const verses: string[] = [];
      for (let v = rangeStart; v <= rangeEnd; v++)
        verses.push(`${displayBook} ${displayChapter}:${v}`);
      try {
        await navigator.share({ text: versesToText(verses) });
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await navigator.share({ text: versesToText(selectedVerses) });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const saveNote = async (rangeStart?: number, rangeEnd?: number) => {
    if (!noteText.trim()) {
      toast({
        title: t.bibleReader.emptyNote,
        description: t.bibleReader.pleaseEnterNote,
        variant: "destructive",
      });
      return;
    }
    setNoteSaving(true);
    try {
      if (rangeStart && rangeEnd) {
        const verses = [];
        for (let v = rangeStart; v <= rangeEnd; v++) verses.push(v);
        await sendPostRequest("bible", "add-verse-note", {
          bookName: displayBook,
          chapter: displayChapter,
          verseNumbers: verses,
          note: noteText.trim(),
        });
      } else {
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
      }
      toast({ title: t.bibleReader.noteSaved });
      loadNotes(displayBook, displayChapter);
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToSaveNote,
        variant: "destructive",
      });
    }
    setNoteText("");
    setShowNoteModal(false);
    clearSelection();
    setNoteSaving(false);
  };

  // ── Search ──
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
        const translationId = mapTranslationId(versionId);
        const result = await bibleApi.search(translationId, query, 50);
        const results = result.data.map((r) => ({
          book: r.bookName,
          chapter: r.chapter,
          verse: r.verse,
        }));
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  // ── Auto-advance to next chapter when passage completes ──
  useEffect(() => {
    if (!audio.passageComplete) return;
    if (afterPlay === "continue" && voiceMode === "chapter") {
      advanceToNextChapter();
    }
  }, [audio.passageComplete]);

  // ── Player derived ──
  const currentItem = speechItems[audio.currentVerseIdx] ?? null;
  const progressPct =
    speechItems.length > 0
      ? ((audio.currentVerseIdx + 1) / speechItems.length) * 100
      : 0;
  const canSkipBack = audio.currentVerseIdx > 0;
  const canSkipForward = audio.currentVerseIdx < speechItems.length - 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ══════════════════ HEADER ══════════════════ */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        {/* ─── Desktop top bar (hidden on mobile) ─── */}
        <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1
                className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t.bibleReader.scripture}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                {t.bibleReader.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                  {t.bibleReader.stopReading}
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  {t.bibleReader.readChapter}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStudyTools(true)}
              className="h-8 px-2.5 text-xs gap-1.5 border-border/50 bg-muted/30"
              title="Study Tools"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">Tools</span>
            </Button>

            <Popover open={translationOpen} onOpenChange={setTranslationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] h-8 text-xs border-border/50 bg-muted/30 justify-between font-normal"
                >
                  <span className="truncate">
                    {effectiveTranslations.find((t2) => t2.id === versionId)
                      ?.name || t.bibleReader.selectVersion}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
                <PopoverContent
                className="w-[220px] max-h-[560px] p-0"
                align="start"
              >
                <div className="p-2 border-b border-border/40">
                  <Input
                    placeholder={t.bibleReader.searchTranslations}
                    value={translationSearch}
                    onChange={(e) => setTranslationSearch(e.target.value)}
                    className="h-7 text-xs"
                    autoFocus
                  />
                </div>
                <ScrollArea className="max-h-[500px]">
                  <div className="py-1">
                    {filteredTranslations.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        {t.bibleReader.noTranslations}
                      </div>
                    ) : (
                      filteredTranslations.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setVersionId(v.id);
                            setTranslationSearch("");
                            setTranslationOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors",
                            versionId === v.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground",
                          )}
                        >
                          {v.name}
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* ─── Desktop book + chapter row (hidden on mobile) ─── */}
        <div className="hidden sm:flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border/40">
          {/* <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={t.bibleReader.filterBooks}
              value={desktopBookFilter}
              onChange={(e) => setDesktopBookFilter(e.target.value)}
              className="pl-8 h-8 text-xs border-border/50 bg-muted/30"
            />
          </div> */}
          <Select
            value={selectedBook}
            onValueChange={handleBookChange}
            disabled={booksLoading || backendBooks.length === 0}
          >
            <SelectTrigger aria-label="Select book" className="w-[175px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue
                placeholder={booksLoading ? t.bibleReader.loadingBooks : t.bibleReader.selectBook}
              />
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
            disabled={booksLoading || backendBooks.length === 0}
          >
            <SelectTrigger aria-label="Select chapter" className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue
                placeholder={booksLoading ? t.bibleReader.loadingBooks : t.bibleReader.selectChapter}
              />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {backendBooks.length > 0 ? (
                  Array.from(
                    { length: maxChapterForDisplay },
                    (_, i) => i + 1,
                  ).map((ch) => (
                    <SelectItem
                      key={ch}
                      value={ch.toString()}
                      className="text-xs"
                    >
                      {t.bibleReader.chapterLabel.replace('{n}', String(ch))}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="1" disabled>
                    {t.bibleReader.loadingBooks}
                  </SelectItem>
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
          {/* Verse select */}
          <Select
            value={selectedVerse?.toString() || ""}
            onValueChange={handleVerseChange}
            disabled={currentChapterVerseCount === 0}
          >
            <SelectTrigger aria-label="Select verse" className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
              <SelectValue placeholder={t.bibleReader.selectVerse} />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {currentChapterVerseCount > 0 ? (
                  Array.from(
                    { length: currentChapterVerseCount },
                    (_, i) => i + 1,
                  ).map((v) => (
                    <SelectItem
                      key={v}
                      value={v.toString()}
                      className="text-xs"
                    >
                      {t.bibleReader.verseNum.replace("{n}", String(v))}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="-" disabled className="text-xs">
                    {t.bibleReader.loadingBooks}
                  </SelectItem>
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* ─── Mobile top bar ─── */}
        <div className="flex sm:hidden items-center gap-2 px-3 py-2.5 border-b border-border/40">
          {/* Logo */}
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>

          {/* Mobile nav drawer (book + chapter + version) */}
          <div className="flex-1 min-w-0">
            <MobileNavDrawer
              selectedBook={selectedBook}
              selectedChapter={displayChapter}
              selectedVerse={selectedVerse}
              versionId={versionId}
              maxChapter={maxChapterForDisplay}
              onBookChange={handleBookChange}
              onChapterChange={handleChapterChange}
              onVerseChange={handleVerseChange}
              onVersionChange={setVersionId}
               books={backendBooks.map((b) => b.bookName)}
               availableTranslations={effectiveTranslations}
              verseCount={currentChapterVerseCount}
              onOpenStudyTools={() => setShowStudyTools(true)}
            />
          </div>

          {/* Mobile study tools */}
          <button
            onClick={() => setShowStudyTools(true)}
            className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 active:scale-95 transition-all [touch-action:manipulation]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          </button>

          {/* Search button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 active:scale-95 transition-all [touch-action:manipulation]"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Read button — mobile */}
          <button
            onClick={readChapter}
            className={cn(
              "relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl flex items-center justify-center border transition-all active:scale-95 [touch-action:manipulation]",
              isSpeaking && voiceMode === "chapter"
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-muted/50 border-border/40 text-muted-foreground",
            )}
          >
            {isSpeaking && voiceMode === "chapter" ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* ─── Chapter nav (both mobile + desktop) ─── */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2">
          <button
            onClick={goToPrevChapter}
            disabled={isAtVeryStart}
            className="relative flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 before:absolute before:content-[''] before:-inset-2 before:rounded-lg rounded-lg text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-muted/50 transition-all active:scale-95 [touch-action:manipulation]"
          >
            <ChevronLeft className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
            <span className="hidden sm:inline">
              {(() => {
                const bookNames = backendBooks.map((b) => b.bookName);
                const idx = bookNames.indexOf(displayBook);
                return displayChapter > 1
                  ? `${t.bibleReader.chShort} ${displayChapter - 1}`
                  : idx > 0
                    ? bookNames[idx - 1]
                    : t.bibleReader.prevShort;
              })()}
            </span>
            <span className="sm:hidden text-[11px]">{t.bibleReader.prevShort}</span>
          </button>

          <div className="text-center">
            <p
              className="text-xs sm:text-sm font-medium text-foreground tracking-wide leading-none"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {displayBook}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              {t.bibleReader.chOf.replace('{n}', String(displayChapter)).replace('{total}', String(maxChapterForDisplay))}
              <span className="mx-1 opacity-40">·</span>
              <span className="text-primary/80">
                {currentVersion?.abbreviation || versionId}
              </span>
            </p>
          </div>

          <button
            onClick={goToNextChapter}
            disabled={isAtVeryEnd}
            className="relative flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 before:absolute before:content-[''] before:-inset-2 before:rounded-lg rounded-lg text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-muted/50 transition-all active:scale-95 [touch-action:manipulation]"
          >
            <span className="hidden sm:inline">
              {(() => {
                const bookNames = backendBooks.map((b) => b.bookName);
                const idx = bookNames.indexOf(displayBook);
                return displayChapter < maxChapterForDisplay
                  ? `${t.bibleReader.chShort} ${displayChapter + 1}`
                  : idx >= 0 && idx < bookNames.length - 1
                    ? bookNames[idx + 1]
                    : t.bibleReader.endLabel;
              })()}
            </span>
            <span className="sm:hidden text-[11px]">{t.bibleReader.nextShort}</span>
            <ChevronRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
          </button>
        </div>
      </header>

      <SelectionActionBar
        selectedVerses={selectedVerses}
        isSpeaking={audio.isPlaying}
        voiceMode={voiceMode}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        selectedVerse={selectedVerse}
        displayBook={displayBook}
        displayChapter={displayChapter}
        onClearSelection={clearSelection}
        onReadSelectedVerses={readSelectedVerses}
        onOpenHighlightPicker={() => setShowHighlightPicker(true)}
        onOpenNoteModal={() => setShowNoteModal(true)}
        onAddFavorite={addFavorite}
        onOpenFavoriteModal={() => setShowFavoriteModal(true)}
        onCopyVerses={copyVersesRange}
        onOpenCopyModal={() => setShowCopyModal(true)}
        onShareVerses={shareVersesRange}
        onOpenShareModal={() => setShowShareModal(true)}
        onNavigateToJournal={(verseNum) => window.open(`/journal/new?book=${selectedBook}&chapter=${selectedChapter}&verse=${verseNum}`, "_blank")}
        onNavigateToStudy={() => navigate(`/verse-resources?book=${encodeURIComponent(displayBook)}&chapter=${displayChapter}&verse=${selectedVerse || 1}`)}
        isConsecutiveSelection={isConsecutiveSelection}
      />

      {/* ══════════════════ READING AREA ══════════════════ */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div
            ref={contentRef}
            className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12"
            style={{ paddingBottom: isSpeaking ? "8rem" : "3rem" }}
          >
            {chapters.length === 0 && loading ? (
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-36 mx-auto" />
                    <Skeleton className="h-3 w-20 mx-auto mb-6" />
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
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
                      className="mb-16 sm:mb-20"
                    >
                      {/* Chapter heading */}
                      <div className="mb-8 sm:mb-10 text-center">
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                          <div className={cn("h-px flex-1", isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-transparent to-border/60")} />
                          <h2
                            className="text-xl sm:text-2xl font-medium tracking-widest text-foreground uppercase"
                            style={{
                              fontFamily: "'Cinzel', serif",
                              letterSpacing: "0.12em",
                            }}
                          >
                            {chapter.book}
                          </h2>
                          <div className={cn("h-px flex-1", isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l", "from-transparent to-border/60")} />
                        </div>
                        <p
                          className="text-xs sm:text-sm text-muted-foreground tracking-widest uppercase"
                          style={{
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: "0.2em",
                          }}
                        >
                          {t.bibleReader.chapterLabel.replace('{n}', String(chapter.chapter))}
                        </p>
                      </div>

                      {/* Verses */}
                      <div
                        className="text-[1.05rem] sm:text-[1.15rem] md:text-[1.2rem] leading-[2.0] sm:leading-[2.15] text-foreground/90"
                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                      >
                        {chapter.verses.map((verse) => {
                          const highlightColor = isHighlighted(verse.key);
                          const isSelected = selectedVerses.includes(verse.key);
                          const isFav = isFavorite(verse.key);
                          const vNote = getVerseNote(verse.key);
                          const vExplanation = getVerseExplanation(verse.key);
                          const vLearnMore = getVerseLearnMore(verse.key);
                          const vExplanationPrompts =
                            getVerseExplanationPrompts(verse.key);
                          const isExplanationExpanded =
                            expandedExplanation === verse.key;
                          const isCurrentlyReading =
                            isSpeaking && currentItem?.verseKey === verse.key;
                          const isVerseTargeted =
                            selectedVerse !== null &&
                            selectedVerse === verse.num &&
                            chapter.book === displayBook &&
                            chapter.chapter === displayChapter;

                          return (
                            <span key={verse.key}>
                              <span
                                ref={(el) => {
                                  verseRefs.current[verse.key] = el;
                                }}
                                onClick={() => toggleVerseSelection(verse.key)}
                                className={cn(
                                  "inline cursor-pointer rounded transition-all duration-200",
                                  isSelected
                                    ? "bg-primary/15 ring-1 ring-primary/30 -mx-0.5 px-0.5"
                                    : "",
                                  isCurrentlyReading && !isSelected
                                    ? "bg-primary/10 ring-1 ring-primary/20 -mx-0.5 px-0.5"
                                    : "",
                                  highlightColor &&
                                    !isSelected &&
                                    !isCurrentlyReading &&
                                    !isVerseTargeted
                                    ? "-mx-0.5 px-0.5"
                                    : "",
                                  isVerseTargeted &&
                                    !isSelected &&
                                    !isCurrentlyReading
                                    ? "ring-2 ring-primary/40 bg-primary/5 -mx-0.5 px-0.5"
                                    : "",
                                )}
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
                                    fontSize: "0.55rem",
                                    letterSpacing: "0.05em",
                                    verticalAlign: "super",
                                    lineHeight: 0,
                                  }}
                                >
                                  {verse.num}
                                </sup>
                                {renderVerseWithStrongs(verse.text, verse.key, getStrongsForVerse(verse.key), handleWordTap)}
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
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExplanation(verse.key);
                                      }}
                                      disabled={explanationLoading}
                                      className={cn(
                                        "inline-flex items-center gap-1 ml-1.5 text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all duration-150",
                                        isExplanationExpanded
                                          ? "bg-primary text-primary-foreground shadow-sm"
                                          : "bg-primary/10 text-primary/80 hover:bg-primary/20 hover:text-primary",
                                      )}
                                    >
                                      {explanationLoading &&
                                      expandedExplanation === verse.key ? (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      ) : isExplanationExpanded ? (
                                        <>
                                          <ChevronUp className="w-2.5 h-2.5" />
                                          {t.bibleReader.closeExplanation}
                                        </>
                                      ) : (
                                        <>
                                          <Lightbulb className="w-2.5 h-2.5" />
                                          {t.bibleReader.explain}
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/verse-resources?book=${encodeURIComponent(displayBook)}&chapter=${displayChapter}&verse=${verse.num}`);
                                      }}
                                      className="inline-flex items-center gap-1 ml-1.5 text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all duration-150 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                      <GraduationCap className="w-2.5 h-2.5" />
                                      Explore
                                    </button>
                                  </>
                                )}{" "}
                              </span>

                              <AnimatePresence>
                              {isExplanationExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="mt-2 mb-3 ml-2 sm:ml-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden"
                                >
                                  <div className="p-4 sm:p-5">
                                    {vExplanation ? (
                                      <div>
                                        {/* Explanation header */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                            {t.bibleReader.explanation}
                                          </span>
                                        </div>
                                        {/* Full explanation text */}
                                        <TextContent text={vExplanation} />
                                        {/* Read more — reveals Learn More */}
                                        {vLearnMore && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedFullExplanation((prev) => {
                                                const n = new Set(prev);
                                                n.has(verse.key)
                                                  ? n.delete(verse.key)
                                                  : n.add(verse.key);
                                                return n;
                                              });
                                            }}
                                            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200"
                                          >
                                            <ChevronDown
                                              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                                                expandedFullExplanation.has(verse.key) ? "rotate-180" : ""
                                              }`}
                                            />
                                            {expandedFullExplanation.has(verse.key)
                                              ? (t.verseExplanations?.learnMoreTitle || "Learn More")
                                              : t.bibleReader.readMore}
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground italic flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        {t.bibleReader.loadingExplanation}
                                      </span>
                                    )}
                                  </div>

                                  {/* Learn More — smooth accordion */}
                                  <div
                                    className="grid transition-all duration-300 ease-in-out"
                                    style={{
                                      gridTemplateRows: vLearnMore && expandedFullExplanation.has(verse.key) ? "1fr" : "0fr",
                                    }}
                                  >
                                    <div className="overflow-hidden">
                                      {vLearnMore && (
                                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-primary/10">
                                          <div className="pt-3">
                                            <div className="flex items-center gap-2 mb-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                              <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                                                {t.verseExplanations?.learnMoreTitle || "Learn More"}
                                              </span>
                                            </div>
                                            <TextContent text={vLearnMore} />
                                            {/* Close — collapses the entire panel */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExplanation(verse.key);
                                              }}
                                              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-destructive/70 hover:text-destructive transition-colors duration-200"
                                            >
                                              <ChevronUp className="w-4 h-4" />
                                              {t.bibleReader.closeExplanation}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Journal Prompts */}
                                  {vExplanationPrompts.length > 0 && (
                                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-amber-200/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                                          {t.bibleReader.journalPrompts}
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        {vExplanationPrompts.map((prompt) => (
                                          <div
                                            key={prompt.id}
                                            className="text-sm leading-relaxed text-foreground/70 bg-amber-50/70 dark:bg-amber-950/30 rounded-md p-3 border border-amber-100/40 dark:border-amber-900/40"
                                          >
                                            <span className="text-amber-600/80 mr-1">
                                              "
                                            </span>
                                            {prompt.prompt}
                                            <span className="text-amber-600/80 ml-1">
                                              "
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                              </AnimatePresence>
                            </span>
                          );
                        })}
                      </div>

                      {/* Bottom chapter nav — mobile only */}
                      <div className="flex sm:hidden items-center justify-between mt-10 pt-6 border-t border-border/30">
                        <button
                          onClick={goToPrevChapter}
                          disabled={
                            isAtVeryStart && chapter.chapter === displayChapter
                          }
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-3 py-2 rounded-xl bg-muted/50 active:scale-95 transition-all"
                        >
                          <ChevronLeft className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
                          {t.bibleReader.prevShort}
                        </button>
                        <span
                          className="text-xs text-muted-foreground"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {t.bibleReader.chShort} {chapter.chapter}
                        </span>
                        <button
                          onClick={goToNextChapter}
                          disabled={
                            isAtVeryEnd && chapter.chapter === displayChapter
                          }
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-3 py-2 rounded-xl bg-muted/50 active:scale-95 transition-all"
                        >
                          {t.bibleReader.nextShort}
                          <ChevronRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
                        </button>
                      </div>

                      {/* Chapter Prompts */}
                      {chapterPrompts[`${chapter.book}-${chapter.chapter}`]
                        ?.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border/20">
                          <div className="rounded-lg border border-amber-200/40 bg-amber-50/30 dark:bg-amber-950/20 p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span
                                className="text-sm font-semibold text-amber-600 uppercase tracking-wider"
                                style={{ fontFamily: "'Cinzel', serif" }}
                              >
                                {t.bibleReader.chapterReflections}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {chapterPrompts[
                                `${chapter.book}-${chapter.chapter}`
                              ].map((prompt, idx) => (
                                <div
                                  key={prompt.id}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  <div className="text-sm leading-relaxed text-foreground/80 bg-white/50 dark:bg-black/20 rounded-md p-2.5 flex-1 border border-amber-100/30 dark:border-amber-900/30">
                                    <span className="text-amber-500 mr-1">
                                      "
                                    </span>
                                    {prompt.prompt}
                                    <span className="text-amber-500 ml-1">
                                      "
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Infinite scroll sentinel */}
                <div
                  ref={loadMoreRef}
                  className="py-10 sm:py-12 flex justify-center"
                >
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

      {/* ══════════════════ MODALS ══════════════════ */}
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
        onSelectColor={(colorId, color, rangeStart, rangeEnd) => {
          setShowHighlightPicker(false);
          highlightVerses(colorId, color, rangeStart, rangeEnd);
        }}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        currentBook={displayBook}
        currentChapter={displayChapter}
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
      />
      <NoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={(rangeStart, rangeEnd) => saveNote(rangeStart, rangeEnd)}
        noteText={noteText}
        onNoteChange={setNoteText}
        saving={noteSaving}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        currentBook={displayBook}
        currentChapter={displayChapter}
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
      />
      <RangePickerModal
        visible={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        title="Add to Favorites"
        description={`${displayBook} ${displayChapter}`}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
        actionLabel="Add Favorite"
        onConfirm={(rangeStart, rangeEnd) => {
          setShowFavoriteModal(false);
          addFavorite(rangeStart, rangeEnd);
        }}
      />
      <RangePickerModal
        visible={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        title="Copy Verses"
        description={`${displayBook} ${displayChapter}`}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
        actionLabel="Copy"
        onConfirm={(rangeStart, rangeEnd) => {
          setShowCopyModal(false);
          copyVersesRange(rangeStart, rangeEnd);
        }}
      />
      <RangePickerModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Verses"
        description={`${displayBook} ${displayChapter}`}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
        actionLabel="Share"
        onConfirm={(rangeStart, rangeEnd) => {
          setShowShareModal(false);
          shareVersesRange(rangeStart, rangeEnd);
        }}
      />

      {/* ══════════════════ WORD STUDY ══════════════════ */}
      <WordDetailSheet
        open={strongsWordModalOpen}
        onOpenChange={setStrongsWordModalOpen}
        strongsId={selectedStrongsId}
        surfaceText={selectedStrongsWordText}
      />

      {/* ══════════════════ STUDY TOOLS ══════════════════ */}
      <StudyToolsSheet
        open={showStudyTools}
        onOpenChange={setShowStudyTools}
        bookName={displayBook}
        chapter={displayChapter}
        verseNumber={selectedVerse}
        onOpenHowToStudy={() => setShowHowToStudy(true)}
        onGoToVerse={(vk) => {
          // vk might be a range like "1-3" or "1,2,3" — take the first verse
          const firstVerse = vk.split(/[,\-]/)[0].trim();
          const verseKey = firstVerse.match(/^\d+$/)
            ? `${displayBook} ${displayChapter}:${firstVerse}`
            : vk;
          const p = parseVerseKey(verseKey);
          if (p) {
            if (isSpeaking) stopSpeaking();
            clearSelection();
            setSelectedVerse(p.verse);
            setSelectedBook(p.book);
            setSelectedChapter(p.chapter);
            setDisplayBook(p.book);
            setDisplayChapter(p.chapter);
            chapterRefs.current = {};
            verseRefs.current = {};
            setChapters([]);
            setHasMore(true);
            if (loadingRef.current) {
              pendingNavigationRef.current = {
                book: p.book,
                startChapter: Math.max(1, p.chapter - 2),
                count: 5,
              };
            } else {
              loadChapters(p.book, Math.max(1, p.chapter - 2), 5);
            }
          }
        }}
      />

      {/* ══════════════════ HOW TO STUDY ══════════════════ */}
      <HowToStudySheet
        open={showHowToStudy}
        onOpenChange={setShowHowToStudy}
        bookName={displayBook}
        chapter={displayChapter}
        onOpenJournal={() => {
          window.open(
            `/journal/new?book=${displayBook}&chapter=${displayChapter}&verse=1`,
            "_blank",
          );
        }}
      />

      <AudioPlayerControls
        isPlaying={audio.isPlaying}
        isPaused={audio.isPaused}
        currentItem={currentItem}
        currentIndex={audio.currentVerseIdx}
        total={speechItems.length}
        progress={progressPct}
        voiceMode={voiceMode}
        displayBook={displayBook}
        displayChapter={displayChapter}
        canSkipBack={canSkipBack}
        canSkipForward={canSkipForward}
        repeatMode={audio.repeatMode}
        speechRate={audio.speechRate}
        voices={audio.voices}
        selectedVoice={audio.selectedVoice}
        volume={audio.volume}
        afterPlay={afterPlay}
        onPauseResume={audio.togglePause}
        onStop={stopSpeaking}
        onSkipBack={audio.skipBackward}
        onSkipForward={audio.skipForward}
        onToggleRepeat={audio.cycleRepeatMode}
        onSpeechRateChange={audio.setSpeechRate}
        onToggleMute={() => {
          if (audio.volume > 0) {
            previousVolumeRef.current = audio.volume;
            audio.setVolume(0);
          } else {
            audio.setVolume(previousVolumeRef.current || 1);
          }
        }}
        onVoiceChange={audio.setVoice}
        onSetVolume={audio.setVolume}
        onAfterPlayChange={setAfterPlay}
      />
    </div>
  );
}
