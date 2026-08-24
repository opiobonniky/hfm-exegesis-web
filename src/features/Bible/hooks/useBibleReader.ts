import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
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
export interface Highlight {
  colorId: number;
  note?: string;
const INITIAL_CHAPTER_COUNT = 3;
function parsePositiveInteger(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
export function useBibleReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlBook = searchParams.get("book");
  const initialBook: BibleBookName = isBibleBook(urlBook) ? urlBook : "Genesis";
  const initialChapter = clampChapter(initialBook, parsePositiveInteger(searchParams.get("chapter")) ?? 1);
  const [selectedBook, setSelectedBook] = useState<BibleBookName>(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [loadStartChapter, setLoadStartChapter] = useState(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(parsePositiveInteger(searchParams.get("verse")));
  const [versionId, setVersionId] = useState(searchParams.get("translation") || "Berean");
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [availableTranslations, setAvailableTranslations] = useState<TranslationOption[]>([]);
  const [booksLoading] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const requestGenerationRef = useRef(0);
  const loadingMoreRef = useRef(false);
  useEffect(() => {
    let active = true;
    sendPostRequest("bible", "get-translations", {})
      .then((res) => {
        if (active && res.returnCode === 200) setAvailableTranslations(res.returnData || []);
      })
      .catch((error) => console.error("Failed to load Bible translations:", error));
    return () => { active = false; };
  }, []);
    const bookParam = searchParams.get("book");
    const book: BibleBookName = isBibleBook(bookParam) ? bookParam : "Genesis";
    const chapter = clampChapter(book, parsePositiveInteger(searchParams.get("chapter")) ?? 1);
    const verse = parsePositiveInteger(searchParams.get("verse"));
    const translation = searchParams.get("translation") || "Berean";
    setSelectedBook((current) => current === book ? current : book);
    setSelectedChapter((current) => current === chapter ? current : chapter);
    setLoadStartChapter((current) => current === chapter ? current : chapter);
    setSelectedVerse((current) => current === verse ? current : verse);
    setVersionId((current) => current === translation ? current : translation);
  }, [searchParams]);
  const fetchChapters = useCallback(async (
    book: BibleBookName,
    startChapter: number,
    count: number,
    translation: string,
    mode: "replace" | "append",
    generation: number,
  ) => {
    const maxChapter = BIBLE_BOOK_CHAPTERS[book];
    const chapterNumbers = Array.from(
      { length: Math.min(count, maxChapter - startChapter + 1) },
      (_, index) => startChapter + index,
    );
    if (chapterNumbers.length === 0) {
      setHasMore(false);
      return;
    }
    const data = await bibleApi.getVersesBatch(translation, book, chapterNumbers);
    if (generation !== requestGenerationRef.current) return;
    const byChapter = new Map(data.map((chapter) => [chapter.chapterNumber, chapter]));
    if (chapterNumbers.some((chapterNumber) => !byChapter.get(chapterNumber)?.verses.length)) {
      throw new Error("The Bible API returned incomplete chapter data");
    const loaded = chapterNumbers.map((chapterNumber): ChapterData => {
      const chapter = byChapter.get(chapterNumber);
      return {
        book,
        chapter: chapterNumber,
        testament: BIBLE_BOOKS.findIndex((item) => item.bookName === book) < 39 ? "OT" : "NT",
        verses: (chapter?.verses || []).map((verse) => ({
          verse: verse.verseNumber,
          text: verse.text || "",
        })),
      };
    });
    setChapters((current) => mode === "replace" ? loaded : [...current, ...loaded]);
    setHasMore(chapterNumbers.at(-1)! < maxChapter);
    const generation = ++requestGenerationRef.current;
    loadingMoreRef.current = false;
    setLoading(true);
    setLoadingMore(false);
    setLoadError(null);
    setChapters([]);
    setSelectedVerses([]);
    fetchChapters(
      selectedBook,
      loadStartChapter,
      INITIAL_CHAPTER_COUNT,
      versionId,
      "replace",
      generation,
    )
      .catch((error) => {
        if (generation !== requestGenerationRef.current) return;
        console.error(`Failed to load ${selectedBook} ${loadStartChapter}:`, error);
        setLoadError("Unable to load this passage. Please try again.");
      .finally(() => {
        if (generation === requestGenerationRef.current) setLoading(false);
      });
  }, [fetchChapters, loadStartChapter, reloadToken, selectedBook, versionId]);
  const updateLocation = useCallback((book: BibleBookName, chapter: number, verse: number | null, translation: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("book", book);
      next.set("chapter", String(chapter));
      next.set("translation", translation);
      if (verse) next.set("verse", String(verse));
      else next.delete("verse");
      return next;
  }, [setSearchParams]);
    if (!selectedVerse) return;
    const selectedChapterData = chapters.find((chapter) =>
      chapter.book === selectedBook && chapter.chapter === selectedChapter,
    if (!selectedChapterData?.verses.length) return;
    const maxVerse = selectedChapterData.verses.at(-1)!.verse;
    if (selectedVerse <= maxVerse) return;
    setSelectedVerse(maxVerse);
    updateLocation(selectedBook, selectedChapter, maxVerse, versionId);
  }, [chapters, selectedBook, selectedChapter, selectedVerse, updateLocation, versionId]);
  const navigateTo = useCallback((book: string, chapter: number, verse?: number) => {
    if (!isBibleBook(book)) return;
    const nextChapter = clampChapter(book, chapter);
    const nextVerse = verse && verse > 0 ? Math.trunc(verse) : null;
    setSelectedBook(book);
    setSelectedChapter(nextChapter);
    setLoadStartChapter(nextChapter);
    setSelectedVerse(nextVerse);
    updateLocation(book, nextChapter, nextVerse, versionId);
  }, [updateLocation, versionId]);
  const setVisibleChapter = useCallback((chapter: number) => {
    const nextChapter = clampChapter(selectedBook, chapter);
    setSelectedChapter((current) => current === nextChapter ? current : nextChapter);
    setSelectedVerse(null);
  }, [selectedBook]);
  const selectTranslation = useCallback((translation: string) => {
    if (!translation || translation === versionId) return;
    setLoadStartChapter(selectedChapter);
    setVersionId(translation);
    updateLocation(selectedBook, selectedChapter, selectedVerse, translation);
  }, [selectedBook, selectedChapter, selectedVerse, updateLocation, versionId]);
  const loadMore = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMore || chapters.length === 0) return;
    const lastChapter = chapters.at(-1)?.chapter ?? loadStartChapter;
    const generation = requestGenerationRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await fetchChapters(selectedBook, lastChapter + 1, INITIAL_CHAPTER_COUNT, versionId, "append", generation);
    } catch (error) {
      if (generation !== requestGenerationRef.current) return;
      console.error(`Failed to load more chapters for ${selectedBook}:`, error);
      setLoadError("Unable to load more chapters. Please try again.");
    } finally {
      if (generation === requestGenerationRef.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
  }, [chapters, fetchChapters, hasMore, loadStartChapter, loading, selectedBook, versionId]);
  const retryLoad = useCallback(() => setReloadToken((value) => value + 1), []);
  const toggleVerse = useCallback((key: string) => {
    setSelectedVerses((current) => current.includes(key)
      ? current.filter((verse) => verse !== key)
      : [...current, key]);
  const clearSelectedVerses = useCallback(() => setSelectedVerses([]), []);
  const toggleHighlight = useCallback(async (book: string, chapter: number, verse: number, colorId: number) => {
    const key = `${book}-${chapter}-${verse}`;
    await sendPostRequest("bible", "toggle-highlight", { bookName: book, chapter, verseNumber: verse, colorId });
    setHighlights((current) => {
      const next = { ...current };
      if (next[key]?.colorId === colorId) delete next[key];
      else next[key] = { colorId };
  const toggleFavorite = useCallback(async (book: string, chapter: number, verse: number) => {
    await sendPostRequest("bible", "toggle-favorite", { bookName: book, chapter, verseNumber: verse });
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
  const saveNote = useCallback(async (book: string, chapter: number, verse: number, note: string) => {
    await sendPostRequest("bible", "save-note", { bookName: book, chapter, verseNumber: verse, note });
    setVerseNotes((current) => ({ ...current, [key]: note }));
  return {
    selectedBook, selectedChapter, selectedVerse, versionId,
    chapters, loading, loadingMore, loadError, hasMore,
    availableTranslations, backendBooks: BIBLE_BOOKS, booksLoading,
    selectedVerses, highlights, favorites, verseNotes,
    loadMoreRef, chapterRefs, verseRefs,
    navigateTo, setVisibleChapter, selectTranslation, loadMore, retryLoad,
    toggleVerse, clearSelectedVerses, toggleHighlight, toggleFavorite, saveNote,
  };
