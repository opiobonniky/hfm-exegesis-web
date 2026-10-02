import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest, API_BASE_URL } from "@/services/api";
import { bibleApi, mapTranslationId } from "@/services/bibleApi";
import { getChapterHeadingsCached } from "@/services/chapterHeadings";
import type {
  ChapterData,
  HeadingsByChapter,
  ReaderHighlight,
  TranslationOption,
} from "../types";
import {
  BIBLE_BOOK_CHAPTERS,
  BIBLE_BOOKS,
  clampChapter,
  isBibleBook,
  type BibleBookName,
} from "../constants";
import {
  getBibleCatalogLanguage,
  getPreferredBibleId,
} from "../services/freeBibleTranslations";


const INITIAL_CHAPTER_COUNT = 3;
const INITIAL_PREVIOUS_CHAPTERS = 2;
const parsePositiveInteger = (value: string | null) => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function useBibleReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang: language } = useLanguage();
  const requestedTranslationRef = useRef(searchParams.get("translation") || "");
  requestedTranslationRef.current = searchParams.get("translation") || "";
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
  const [versionId, setVersionId] = useState(() =>
    mapTranslationId(
      searchParams.get("translation") || getPreferredBibleId(language),
    ),
  );
  const [resolvedLanguage, setResolvedLanguage] = useState<string | null>(null);
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
  const [highlights, setHighlights] = useState<Record<string, ReaderHighlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});
  // Section headings per "Book-Chapter", matching the mobile app's reader.
  const [headingsByChapter, setHeadingsByChapter] = useState<HeadingsByChapter>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const chapterRequestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const preferred = getPreferredBibleId(language);

    chapterRequestRef.current += 1;
    setResolvedLanguage(null);
    setLoading(true);
    setLoadError(null);
    setChapters([]);

    bibleApi
      .getTranslations(getBibleCatalogLanguage(language))
      .then((data) => {
        if (cancelled) return;

        const list = data || [];
        let stored = "";
        try {
          stored = localStorage.getItem("preferred_translation") || "";
        } catch {
          // Storage can be unavailable in restricted browser contexts.
        }
        const candidates = [requestedTranslationRef.current, stored, preferred]
          .filter(Boolean)
          .map(mapTranslationId);
        const nextVersion =
          candidates.find((candidate) =>
            list.some((translation) => translation.id === candidate),
          ) ||
          list[0]?.id ||
          preferred;

        setAvailableTranslations(list);
        setVersionId(nextVersion);
        try {
          localStorage.setItem("preferred_translation", nextVersion);
        } catch {
          // The reader still works when storage is unavailable.
        }
        setSearchParams(
          (current) => {
            if (current.get("translation") === nextVersion) return current;
            const next = new URLSearchParams(current);
            next.set("translation", nextVersion);
            return next;
          },
          { replace: true },
        );
        setResolvedLanguage(language);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load Bible translations:", error);
        setAvailableTranslations([]);
        setVersionId(preferred);
        setResolvedLanguage(language);
      });

    return () => {
      cancelled = true;
    };
  }, [language, setSearchParams]);

  const fetchChapters = useCallback(
    async (
      book: BibleBookName,
      start: number,
      count: number,
      translation: string,
      append: boolean,
      requestId: number,
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
      if (requestId !== chapterRequestRef.current) return;
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

      // Fetch section headings for the freshly loaded chapters via the
      // shared cache — back-navigation to a previously read chapter renders
      // them instantly from cache, and language changes fetch fresh data.
      const lang = language || "en";
      await Promise.all(
        numbers.map((chapter) =>
          getChapterHeadingsCached(translation, book, chapter, lang).then(
            (headings) => ({ chapter, headings }),
          ),
        ),
      ).then((results) => {
        if (requestId !== chapterRequestRef.current) return;
        setHeadingsByChapter((current) => {
          const next = { ...current };
          for (const { chapter, headings } of results) {
            next[`${book}-${chapter}`] = headings;
          }
          return next;
        });
      });
    },
    [language],
  );
  useEffect(() => {
    if (resolvedLanguage !== language) return;

    const requestId = ++chapterRequestRef.current;
    setLoading(true);
    setLoadError(null);
    setChapters([]);
    fetchChapters(
      selectedBook,
      loadStartChapter,
      INITIAL_CHAPTER_COUNT,
      versionId,
      false,
      requestId,
    )
      .catch((error) => {
        if (requestId !== chapterRequestRef.current) return;
        console.error(error);
        setLoadError(
          `Unable to load this passage. ${error?.message || "Network error"}. Backend: ${API_BASE_URL}`,
        );
      })
      .finally(() => {
        if (requestId === chapterRequestRef.current) setLoading(false);
      });
  }, [
    fetchChapters,
    language,
    loadStartChapter,
    reloadToken,
    resolvedLanguage,
    selectedBook,
    versionId,
  ]);

  /**
   * Hydrate the user's saved highlights, favorites, and notes once on mount
   * so the reader shows the same marks the mobile app created (same backend
   * rows, same colorId palette).
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hlRes, favRes, noteRes] = await Promise.all([
          sendPostRequest("bible", "get-highlights", { pageSize: 50 }),
          sendPostRequest("bible", "get-favorites", { pageSize: 50 }),
          sendPostRequest("bible", "get-verse-note", {}),
        ]);
        if (cancelled) return;
        const hlMap: Record<string, ReaderHighlight> = {};
        for (const h of hlRes.returnData?.highlights || []) {
          hlMap[`${h.bookName}-${h.chapter}-${h.verseNumber}`] = {
            colorId: Number(h.colorId) || 0,
          };
        }
        setHighlights(hlMap);
        const favSet = new Set<string>();
        for (const f of favRes.returnData?.favorites || []) {
          favSet.add(`${f.bookName}-${f.chapter}-${f.verseNumber}`);
        }
        setFavorites(favSet);
        const noteMap: Record<string, string> = {};
        for (const n of noteRes.returnData || []) {
          if (n?.note) {
            noteMap[`${n.bookName}-${n.chapter}-${n.verseNumber}`] = n.note;
          }
        }
        setVerseNotes(noteMap);
      } catch (error) {
        console.error("Failed to load reader highlights/favorites/notes:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
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
      const nextVersion = mapTranslationId(translation);
      setVersionId(nextVersion);
      setLoadStartChapter(selectedChapter);
      try {
        localStorage.setItem("preferred_translation", nextVersion);
      } catch {
        // The in-memory selection remains usable without storage.
      }
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("translation", nextVersion);
        return next;
      });
    },
    [selectedChapter, setSearchParams],
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
        chapterRequestRef.current,
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
  /**
   * Apply a highlight color to a verse (colorId 0 removes it). Uses the same
   * backend endpoints as the mobile app: add-highlight upserts the row and
   * delete-highlight removes it, so colors stay in sync across platforms.
   */
  const toggleHighlight = useCallback(
    async (book: string, chapter: number, verse: number, colorId: number) => {
      const key = `${book}-${chapter}-${verse}`;
      if (colorId === 0) {
        // Remove: fetch the row id(s) then delete (same flow as the app).
        const res = await sendPostRequest("bible", "get-highlights", {
          bookName: book,
          chapter,
          verseNumber: verse,
        });
        const rows: Array<{ id: number }> =
          res.returnCode === 200 ? res.returnData?.highlights || [] : [];
        await Promise.all(
          rows.map((row) =>
            sendPostRequest("bible", "delete-highlight", {
              highlightId: row.id,
            }),
          ),
        );
        setHighlights((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
        return;
      }
      await sendPostRequest("bible", "add-highlight", {
        bookName: book,
        chapter,
        verseNumbers: [verse],
        colorId,
      });
      setHighlights((current) => ({
        ...current,
        [key]: { colorId },
      }));
    },
    [],
  );
  const toggleFavorite = useCallback(
    async (book: string, chapter: number, verse: number) => {
      const key = `${book}-${chapter}-${verse}`;
      await sendPostRequest("bible", "add-favorite", {
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
  return { data: {
    selectedBook,
    selectedChapter,
    selectedVerse,
    versionId,
    chapters,
    headingsByChapter,
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
  }, actions: {
    navigateTo, setVisibleChapter, selectTranslation, loadMore,
    retryLoad: () => setReloadToken((v) => v + 1), toggleVerse, clearSelectedVerses,
    toggleHighlight, toggleFavorite, saveNote,
  } };
}
