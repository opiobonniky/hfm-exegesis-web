import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { toast } from "@/components/ui/sonner";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { BIBLE_BOOKS } from "../constants";
import { useBibleReader } from "./useBibleReader";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 40;
const DEFAULT_FONT_SIZE = 20;
function getInitialFontSize(): number {
  try {
    const stored = Number.parseInt(localStorage.getItem("bible-font-size") || String(DEFAULT_FONT_SIZE), 10);
    return Number.isFinite(stored)
      ? Math.min(Math.max(stored, MIN_FONT_SIZE), MAX_FONT_SIZE)
      : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

export function useBibleReaderPage() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const reader = useBibleReader();
  const audio = useAudioPlayer();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastFocusedVerseRef = useRef<string | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const pendingChapterRef = useRef<string | null>(null);
  const loadedPassageRef = useRef<string | null>(null);
  const { chapters, chapterRefs, setVisibleChapter } = reader;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVerse, setDrawerVerse] = useState({ book: "", chapter: 0, verse: 0 });
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [fontSize, setFontSize] = useState(getInitialFontSize);

  const updateFontSize = useCallback((size: number) => {
    const validSize = Number.isFinite(size)
      ? Math.min(Math.max(Math.trunc(size), MIN_FONT_SIZE), MAX_FONT_SIZE)
      : getInitialFontSize();
    setFontSize(validSize);
    try {
      localStorage.setItem("bible-font-size", String(validSize));
    } catch {
      /* unavailable */
    }
  }, []);

  useLayoutEffect(() => {
    if (chapters.length === 0) {
      loadedPassageRef.current = null;
      return;
    }
    const firstChapter = chapters[0];
    const passageKey = `${firstChapter.book}-${firstChapter.chapter}`;
    if (loadedPassageRef.current === passageKey) return;
    loadedPassageRef.current = passageKey;
    lastFocusedVerseRef.current = null;
    if (!reader.selectedVerse && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chapters, reader.selectedVerse]);

  const stopScrollAnimation = useCallback(() => {
    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  const animateScrollTo = useCallback((targetTop: number, duration = 850) => {
    const scrollRoot = scrollRef.current;
    if (!scrollRoot) return;
    stopScrollAnimation();
    const maxScroll = Math.max(scrollRoot.scrollHeight - scrollRoot.clientHeight, 0);
    const target = Math.min(Math.max(targetTop, 0), maxScroll);
    const start = scrollRoot.scrollTop;
    const distance = target - start;
    if (Math.abs(distance) < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollRoot.scrollTop = target;
      return;
    }
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      scrollRoot.scrollTop = start + distance * eased;
      if (progress < 1) scrollAnimationRef.current = requestAnimationFrame(step);
      else scrollAnimationRef.current = null;
    };
    scrollAnimationRef.current = requestAnimationFrame(step);
  }, [stopScrollAnimation]);

  const scrollToChapter = useCallback((book: string, chapter: number) => {
    const scrollRoot = scrollRef.current;
    const chapterElement = chapterRefs.current[`${book}-${chapter}`];
    if (!scrollRoot || !chapterElement) return false;
    const rootTop = scrollRoot.getBoundingClientRect().top;
    const chapterTop = chapterElement.getBoundingClientRect().top;
    animateScrollTo(scrollRoot.scrollTop + chapterTop - rootTop, 950);
    return true;
  }, [animateScrollTo, chapterRefs]);

  // Stop scroll animation on user interaction
  useEffect(() => {
    const scrollRoot = scrollRef.current;
    if (!scrollRoot) return;
    const stop = () => stopScrollAnimation();
    scrollRoot.addEventListener("wheel", stop, { passive: true });
    scrollRoot.addEventListener("touchstart", stop, { passive: true });
    return () => {
      scrollRoot.removeEventListener("wheel", stop);
      scrollRoot.removeEventListener("touchstart", stop);
      stopScrollAnimation();
    };
  }, [stopScrollAnimation]);

  // Track visible chapter on scroll
  useEffect(() => {
    const scrollRoot = scrollRef.current;
    if (!scrollRoot || chapters.length === 0) return;
    let frame: number | null = null;
    const updateVisibleChapter = () => {
      frame = null;
      const readingLine = scrollRoot.getBoundingClientRect().top + 12;
      let visibleChapter = chapters[0];
      for (const chapter of chapters) {
        const element = chapterRefs.current[`${chapter.book}-${chapter.chapter}`];
        if (!element || element.getBoundingClientRect().top > readingLine) break;
        visibleChapter = chapter;
      }
      if (visibleChapter.chapter !== reader.selectedChapter) {
        setVisibleChapter(visibleChapter.chapter);
      }
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(updateVisibleChapter);
    };
    scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    updateVisibleChapter();
    return () => {
      scrollRoot.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [chapterRefs, chapters, reader.selectedChapter, setVisibleChapter]);

  // Scroll to pending chapter after navigation
  useEffect(() => {
    const pendingChapter = pendingChapterRef.current;
    if (!pendingChapter) return;
    const chapter = chapters.find((item) => `${item.book}-${item.chapter}` === pendingChapter);
    if (!chapter || !scrollToChapter(chapter.book, chapter.chapter)) return;
    pendingChapterRef.current = null;
  }, [chapters, scrollToChapter]);

  // Infinite scroll observer for loadMore
  useEffect(() => {
    const scrollRoot = scrollRef.current;
    const sentinel = reader.loadMoreRef.current;
    if (!sentinel || !scrollRoot || !reader.hasMore || reader.loadError) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void reader.loadMore();
      },
      { root: scrollRoot, rootMargin: "300px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [reader, reader.hasMore, reader.loadError, reader.loadMore, reader.loadMoreRef]);

  // Auto-scroll to selected verse
  useEffect(() => {
    if (!reader.selectedVerse || reader.loading) return;
    const key = `${reader.selectedBook}-${reader.selectedChapter}-${reader.selectedVerse}`;
    if (lastFocusedVerseRef.current === key) return;
    const element = reader.verseRefs.current[key];
    if (!element) return;
    lastFocusedVerseRef.current = key;
    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus({ preventScroll: true });
    });
  }, [reader.chapters, reader.loading, reader.selectedBook, reader.selectedChapter, reader.selectedVerse, reader.verseRefs]);

  const handleReadChapter = useCallback(() => {
    if (audio.isPlaying || audio.isPaused) {
      audio.stopPlayback();
      return;
    }
    const verses = reader.chapters
      .filter((chapter) => chapter.book === reader.selectedBook && chapter.chapter === reader.selectedChapter)
      .flatMap((chapter) => chapter.verses)
      .filter((verse) => verse.text);
    if (verses.length > 0) audio.startPlayback(verses);
  }, [audio, reader.chapters, reader.selectedBook, reader.selectedChapter]);

  const handleExplainVerse = useCallback((book: string, chapter: number, verse: number) => {
    setDrawerVerse({ book, chapter, verse });
    setDrawerOpen(true);
  }, []);

  const handleToggleHighlight = useCallback(async (book: string, chapter: number, verse: number, colorId: number) => {
    try {
      await reader.toggleHighlight(book, chapter, verse, colorId);
    } catch {
      toast.error("Unable to update the highlight");
    }
  }, [reader]);

  const handleToggleFavorite = useCallback(async (book: string, chapter: number, verse: number) => {
    try {
      await reader.toggleFavorite(book, chapter, verse);
    } catch {
      toast.error("Unable to update the favorite");
    }
  }, [reader]);

  const selectedVerseData = reader.chapters.flatMap((chapter) =>
    chapter.verses
      .filter((verse) => reader.selectedVerses.includes(`${chapter.book}-${chapter.chapter}-${verse.verse}`))
      .map((verse) => ({ ...verse, book: chapter.book, chapter: chapter.chapter })),
  );

  const clearSelection = useCallback(() => reader.clearSelectedVerses(), [reader]);

  const handleCopySelected = useCallback(async () => {
    const text = selectedVerseData
      .map((verse) => `${verse.book} ${verse.chapter}:${verse.verse} ${verse.text}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Selected verses copied");
      clearSelection();
    } catch {
      toast.error("Unable to copy the selected verses");
    }
  }, [clearSelection, selectedVerseData]);

  const handleShareSelected = useCallback(async () => {
    const text = selectedVerseData
      .map((verse) => `${verse.book} ${verse.chapter}:${verse.verse} ${verse.text}`)
      .join("\n");
    try {
      if (navigator.share) await navigator.share({ title: "Selected Bible verses", text });
      else await navigator.clipboard.writeText(text);
      toast.success(navigator.share ? "Verses shared" : "Verses copied for sharing");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("Unable to share the selected verses");
    }
  }, [selectedVerseData]);

  const handleListenSelected = useCallback(() => {
    if (selectedVerseData.length === 0) return;
    audio.startPlayback(selectedVerseData);
    clearSelection();
  }, [audio, clearSelection, selectedVerseData]);

  const handleMultiHighlight = useCallback(async () => {
    try {
      await Promise.all(selectedVerseData.map((verse) =>
        reader.toggleHighlight(verse.book, verse.chapter, verse.verse, 0),
      ));
      toast.success("Selected verses highlighted");
    } catch {
      toast.error("Unable to highlight the selected verses");
    }
    clearSelection();
  }, [clearSelection, reader, selectedVerseData]);

  const handleMultiFavorite = useCallback(async () => {
    try {
      await Promise.all(selectedVerseData.map((verse) =>
        reader.toggleFavorite(verse.book, verse.chapter, verse.verse),
      ));
      toast.success("Favorites updated");
    } catch {
      toast.error("Unable to update favorites");
    }
    clearSelection();
  }, [clearSelection, reader, selectedVerseData]);

  const handleOpenNote = useCallback(() => {
    const existingNote = selectedVerseData.length === 1
      ? reader.verseNotes[`${selectedVerseData[0].book}-${selectedVerseData[0].chapter}-${selectedVerseData[0].verse}`] || ""
      : "";
    setNoteText(existingNote);
    setNoteDialogOpen(true);
  }, [reader, selectedVerseData]);

  const handleSaveNote = useCallback(async () => {
    const note = noteText.trim();
    if (!note) return;
    try {
      await Promise.all(selectedVerseData.map((verse) =>
        reader.saveNote(verse.book, verse.chapter, verse.verse, note),
      ));
      setNoteDialogOpen(false);
      setNoteText("");
      toast.success(selectedVerseData.length === 1 ? "Note saved" : "Note saved to selected verses");
    } catch {
      toast.error("Unable to save the note");
    }
    clearSelection();
  }, [clearSelection, noteText, reader, selectedVerseData]);

  const currentBookIndex = BIBLE_BOOKS.findIndex((book) => book.bookName === reader.selectedBook);
  const currentBook = BIBLE_BOOKS[currentBookIndex];
  const canGoPrev = currentBookIndex > 0 || reader.selectedChapter > 1;
  const canGoNext = currentBookIndex < BIBLE_BOOKS.length - 1 || reader.selectedChapter < (currentBook?.maxChapter ?? 0);

  const handlePrevChapter = useCallback(() => {
    if (reader.selectedChapter > 1) {
      const chapter = reader.selectedChapter - 1;
      if (!scrollToChapter(reader.selectedBook, chapter)) {
        pendingChapterRef.current = `${reader.selectedBook}-${chapter}`;
        reader.navigateTo(reader.selectedBook, chapter);
      }
    } else {
      const previousBook = BIBLE_BOOKS[currentBookIndex - 1];
      if (previousBook) {
        pendingChapterRef.current = `${previousBook.bookName}-${previousBook.maxChapter}`;
        reader.navigateTo(previousBook.bookName, previousBook.maxChapter);
      }
    }
  }, [currentBookIndex, reader, scrollToChapter]);

  const handleNextChapter = useCallback(() => {
    if (reader.selectedChapter < (currentBook?.maxChapter ?? 0)) {
      const chapter = reader.selectedChapter + 1;
      if (scrollToChapter(reader.selectedBook, chapter)) return;
      if (reader.hasMore && !reader.loadingMore) {
        void reader.loadMore();
      } else {
        pendingChapterRef.current = `${reader.selectedBook}-${chapter}`;
        reader.navigateTo(reader.selectedBook, chapter);
      }
    } else {
      const nextBook = BIBLE_BOOKS[currentBookIndex + 1];
      if (nextBook) {
        pendingChapterRef.current = `${nextBook.bookName}-1`;
        reader.navigateTo(nextBook.bookName, 1);
      }
    }
  }, [currentBook, currentBookIndex, reader, scrollToChapter]);

  const scrollToTop = useCallback(() => {
    const element = scrollRef.current;
    if (element) animateScrollTo(element.scrollTop - element.clientHeight * 0.75, 650);
  }, [animateScrollTo]);

  const scrollToBottom = useCallback(() => {
    const element = scrollRef.current;
    if (element) animateScrollTo(element.scrollTop + element.clientHeight * 0.75, 650);
  }, [animateScrollTo]);

  const handleBookmark = useCallback(async () => {
    const firstVerse = reader.chapters
      .find((chapter) => chapter.book === reader.selectedBook && chapter.chapter === reader.selectedChapter)
      ?.verses.at(0);
    if (!firstVerse) return;
    try {
      await reader.toggleFavorite(reader.selectedBook, reader.selectedChapter, firstVerse.verse);
      toast.success("Chapter bookmark updated");
    } catch {
      toast.error("Unable to update the bookmark");
    }
  }, [reader]);

  return {
    navigate,
    dir: isRtl ? ("rtl" as const) : ("ltr" as const),
    isRtl,
    reader,
    audio,
    scrollRef,
    sidebarOpen,
    setSidebarOpen,
    translationOpen,
    setTranslationOpen,
    translationSearch,
    setTranslationSearch,
    drawerOpen,
    setDrawerOpen,
    drawerVerse,
    noteDialogOpen,
    setNoteDialogOpen,
    noteText,
    setNoteText,
    fontSize,
    updateFontSize,
    audioActive: audio.isPlaying || audio.isPaused,
    hasSelection: reader.selectedVerses.length > 0,
    canGoPrev,
    canGoNext,
    handleReadChapter,
    handleExplainVerse,
    handleToggleHighlight,
    handleToggleFavorite,
    handleMultiHighlight,
    handleMultiFavorite,
    handleOpenNote,
    handleSaveNote,
    handleCopySelected,
    handleShareSelected,
    handleListenSelected,
    handleMultiClear: clearSelection,
    handlePrevChapter,
    handleNextChapter,
    handleSearch: () => navigate("/search"),
    handleBookOverview: () => navigate(`/book-overview?book=${encodeURIComponent(reader.selectedBook)}`),
    scrollToTop,
    scrollToBottom,
    handleBookmark,
  };
}
