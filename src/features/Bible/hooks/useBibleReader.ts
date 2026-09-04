import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest, API_BASE_URL } from "@/services/api";
import { bibleApi } from "@/services/bibleApi";
import {
  BIBLE_BOOK_CHAPTERS,
  BIBLE_BOOKS,
  clampChapter,
  isBibleBook,
  type BibleBookName,
} from "../constants";


export interface TranslationOption {
  id: string;
  name: string;
  language?: string;
  copyright?: string;
  isFree?: boolean;
}
export interface ChapterData {
  book: string;
  chapter: number;
  verses: { verse: number; text: string }[];
  testament: string;
}
export interface Highlight {
  colorId: number;
  note?: string;
}
const INITIAL_CHAPTER_COUNT = 3;
const INITIAL_PREVIOUS_CHAPTERS = 2;
const parsePositiveInteger = (value: string | null) => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function useBibleReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBook: BibleBookName = isBibleBook(searchParams.get("book"))
    ? (searchParams.get("book") as BibleBookName)
    : "Genesis";
  const initialChapter = clampChapter(
    initialBook,
    parsePositiveInteger(searchParams.get("chapter")) ?? 1,
  );
  const [selectedBook, setSelectedBook] = useState<BibleBookName>(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [loadStartChapter, setLoadStartChapter] = useState(
    Math.max(1, initialChapter - INITIAL_PREVIOUS_CHAPTERS),
  );
  const [selectedVerse, setSelectedVerse] = useState<number | null>(
    parsePositiveInteger(searchParams.get("verse")),
  );
  const [versionId, setVersionId] = useState(
    searchParams.get("translation") || "Berean",
  );
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [availableTranslations, setAvailableTranslations] = useState<
    TranslationOption[]
  >([]);
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const { lang: language } = useLanguage();

  useEffect(() => {
    import("@/services/bibleApi").then(({ bibleApi }) => {
      bibleApi.getTranslations(language)
        .then((data) => {
          // Always include the currently selected translation even if not in the list
          const list = data || [];
          const currentInList = list.some((t: TranslationOption) => t.id === versionId);
          if (!currentInList && versionId) {
            const current = list.find((t: TranslationOption) => t.id === versionId);
            if (current) list.unshift(current);
          }
          setAvailableTranslations(list.length > 0 ? list : data || []);
        })
        .catch((error) =>
          console.error("Failed to load Bible translations:", error),
        );
    });
  }, [language, versionId]);
  const fetchChapters = useCallback(
    async (
      book: BibleBookName,
      start: number,
      count: number,
      translation: string,
      append: boolean,
    ) => {
      const max = BIBLE_BOOK_CHAPTERS[book];
      const numbers = Array.from(
        { length: Math.min(count, max - start + 1) },
        (_, i) => start + i,
      );
      if (!numbers.length) {
        setHasMore(false);
        return;
      }
      const data = await bibleApi.getVersesBatch(translation, book, numbers);
      const loaded = numbers.map((chapter): ChapterData => {
        const item = data.find((entry) => entry.chapterNumber === chapter);
        return {
          book,
          chapter,
          testament:
            BIBLE_BOOKS.findIndex((entry) => entry.bookName === book) < 39
              ? "OT"
              : "NT",
          verses: (item?.verses || []).map((v) => ({
            verse: v.verseNumber,
            text: v.text || "",
          })),
        };
      });
      setChapters((current) => (append ? [...current, ...loaded] : loaded));
      setHasMore(numbers.at(-1)! < max);
    },
    [],
  );
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    setChapters([]);
    fetchChapters(
      selectedBook,
      loadStartChapter,
      INITIAL_CHAPTER_COUNT,
      versionId,
      false,
    )
      .catch((error) => {
        console.error(error);
        setLoadError(
          `Unable to load this passage. ${error?.message || "Network error"}. Backend: ${API_BASE_URL}`,
        );
      })
      .finally(() => setLoading(false));
  }, [fetchChapters, loadStartChapter, reloadToken, selectedBook, versionId]);
  const navigateTo = useCallback(
    (book: string, chapter: number, verse?: number) => {
      if (!isBibleBook(book)) return;
      const nextChapter = clampChapter(book, chapter);
      setSelectedBook(book);
      setSelectedChapter(nextChapter);
      setLoadStartChapter(nextChapter);
      setSelectedVerse(verse || null);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("book", book);
        next.set("chapter", String(nextChapter));
        if (verse) next.set("verse", String(verse));
        else next.delete("verse");
        return next;
      });
    },
    [setSearchParams],
  );
  const setVisibleChapter = useCallback(
    (chapter: number) => {
      const nextChapter = clampChapter(selectedBook, chapter);
      setSelectedChapter((current) =>
        current === nextChapter ? current : nextChapter,
      );
      setSearchParams(
        (current) => {
          if (current.get("chapter") === String(nextChapter)) return current;
          const next = new URLSearchParams(current);
          next.set("book", selectedBook);
          next.set("chapter", String(nextChapter));
          next.delete("verse");
          return next;
        },
        { replace: true },
      );
    },
    [selectedBook, setSearchParams],
  );
  const selectTranslation = useCallback(
    (translation: string) => {
      setVersionId(translation);
      setLoadStartChapter(selectedChapter);
    },
    [selectedChapter],
  );
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !chapters.length) return;
    setLoadingMore(true);
    try {
      await fetchChapters(
        selectedBook,
        chapters.at(-1)!.chapter + 1,
        INITIAL_CHAPTER_COUNT,
        versionId,
        true,
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    chapters,
    fetchChapters,
    hasMore,
    loading,
    loadingMore,
    selectedBook,
    versionId,
  ]);
  const toggleVerse = useCallback(
    (key: string) =>
      setSelectedVerses((current) =>
        current.includes(key)
          ? current.filter((v) => v !== key)
          : [...current, key],
      ),
    [],
  );
  const clearSelectedVerses = useCallback(() => setSelectedVerses([]), []);
  const toggleHighlight = useCallback(
    async (book: string, chapter: number, verse: number, colorId: number) => {
      const key = `${book}-${chapter}-${verse}`;
      await sendPostRequest("bible", "toggle-highlight", {
        bookName: book,
        chapter,
        verseNumber: verse,
        colorId,
      });
      setHighlights((current) => {
        const next = { ...current };
        if (next[key]?.colorId === colorId) delete next[key];
        else next[key] = { colorId };
        return next;
      });
    },
    [],
  );
  const toggleFavorite = useCallback(
    async (book: string, chapter: number, verse: number) => {
      const key = `${book}-${chapter}-${verse}`;
      await sendPostRequest("bible", "toggle-favorite", {
        bookName: book,
        chapter,
        verseNumber: verse,
      });
      setFavorites((current) => {
        const next = new Set(current);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [],
  );
  const saveNote = useCallback(
    async (book: string, chapter: number, verse: number, note: string) => {
      const key = `${book}-${chapter}-${verse}`;
      await sendPostRequest("bible", "save-note", {
        bookName: book,
        chapter,
        verseNumber: verse,
        note,
      });
      setVerseNotes((current) => ({ ...current, [key]: note }));
    },
    [],
  );
  return {
    selectedBook,
    selectedChapter,
    selectedVerse,
    versionId,
    chapters,
    loading,
    loadingMore,
    loadError,
    hasMore,
    apiBaseUrl: API_BASE_URL,
    availableTranslations,
    backendBooks: BIBLE_BOOKS,
    booksLoading: false,
    selectedVerses,
    highlights,
    favorites,
    verseNotes,
    loadMoreRef,
    chapterRefs,
    verseRefs,
    navigateTo,
    setVisibleChapter,
    selectTranslation,
    loadMore,
    retryLoad: () => setReloadToken((v) => v + 1),
    toggleVerse,
    clearSelectedVerses,
    toggleHighlight,
    toggleFavorite,
    saveNote,
  };
}
