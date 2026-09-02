import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { StrongsEntry as StrongsWordEntry } from "@/services/strongsApi";
import { LAB_BROWSE_PAGE_SIZE } from "../constants";
import type { LabChartItem, LabChartMode, LabDictionaryMode } from "../types";
import { useLabDictionary } from "../services/use-lab-dictionary";

type WordEntry = StrongsWordEntry;
export function useLabDictionaryPage() {
  const navigate = useNavigate();
  const { searchWords, loadBookWords, loadVerseWords, getWordDetail } =
    useLabDictionary();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<LabDictionaryMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultTotal, setResultTotal] = useState(0);
  const [selectedBook, setSelectedBook] = useState("");
  const [browseWords, setBrowseWords] = useState<WordEntry[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseLoaded, setBrowseLoaded] = useState(false);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browsePage, setBrowsePage] = useState(0);
  const [browseHasNext, setBrowseHasNext] = useState(false);
  const browseLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [verseBook, setVerseBook] = useState("");
  const [verseChapter, setVerseChapter] = useState<number>(0);
  const [verseNum, setVerseNum] = useState<number>(0);
  const [verseWords, setVerseWords] = useState<WordEntry[]>([]);
  const [verseWordsLoading, setVerseWordsLoading] = useState(false);
  const [verseWordsLoaded, setVerseWordsLoaded] = useState(false);
  const [verseWordsTotal, setVerseWordsTotal] = useState(0);
  const [chartMode, setChartMode] = useState<LabChartMode>("frequency");
  const [langFilter, setLangFilter] = useState("all");
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStrongsId, setDialogStrongsId] = useState<string | null>(null);
  const [dialogSurfaceText, setDialogSurfaceText] = useState("");

  const executeSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) return;
      setLoading(true);
      setSearched(true);
      try {
        const { words, total } = await searchWords(query);
        setResults(words);
        setResultTotal(total);
      } catch {
        setResults([]);
        setResultTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [searchWords],
  );

  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => executeSearch(searchQuery), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, executeSearch]);

  const loadBookWordsAction = useCallback(
    async (book: string, page = 0, append = false) => {
      if (!book) return;
      setBrowseLoading(true);
      if (!append) setBrowseLoaded(false);
      try {
        const { words, total, hasNext } = await loadBookWords(book, page);
        setBrowseWords((prev) => (append ? [...prev, ...words] : words));
        setBrowseTotal(total);
        setBrowseHasNext(hasNext);
        setBrowsePage(page);
      } catch {
        if (!append) {
          setBrowseWords([]);
          setBrowseTotal(0);
        }
        setBrowseHasNext(false);
      } finally {
        setBrowseLoading(false);
        setBrowseLoaded(true);
      }
    },
    [loadBookWords],
  );

  const loadVerseWordsAction = useCallback(
    async (book: string, chapter: number, verse: number) => {
      if (!book || !chapter || !verse) return;
      setVerseWordsLoading(true);
      setVerseWordsLoaded(false);
      try {
        const { words, total } = await loadVerseWords(book, chapter, verse);
        setVerseWords(words);
        setVerseWordsTotal(total);
      } catch {
        setVerseWords([]);
        setVerseWordsTotal(0);
      } finally {
        setVerseWordsLoading(false);
        setVerseWordsLoaded(true);
      }
    },
    [loadVerseWords],
  );

  useEffect(() => {
    const book = searchParams.get("book");
    const chapter = searchParams.get("chapter");
    const verse = searchParams.get("verse");
    if (book && chapter && verse) {
      const ch = parseInt(chapter, 10);
      const vs = parseInt(verse, 10);
      if (!isNaN(ch) && !isNaN(vs)) {
        setVerseBook(book);
        setVerseChapter(ch);
        setVerseNum(vs);
        setMode("verse");
        loadVerseWordsAction(book, ch, vs);
      }
    }
  }, [searchParams, loadVerseWordsAction]);

  const handleBookChange = useCallback(
    (book: string) => {
      setSelectedBook(book);
      setBrowsePage(0);
      setBrowseHasNext(false);
      if (book) {
        if (browseLoadTimeoutRef.current)
          clearTimeout(browseLoadTimeoutRef.current);
        browseLoadTimeoutRef.current = setTimeout(() => {
          loadBookWordsAction(book, 0, false);
        }, 300);
      } else {
        setBrowseWords([]);
        setBrowseLoaded(false);
        setBrowseTotal(0);
      }
    },
    [loadBookWordsAction],
  );

  useEffect(() => {
    return () => {
      if (browseLoadTimeoutRef.current)
        clearTimeout(browseLoadTimeoutRef.current);
    };
  }, []);

  const langCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const w of browseWords) {
      const lang = w.language?.toLowerCase() || "other";
      counts[lang] = (counts[lang] || 0) + 1;
      counts.all++;
    }
    return counts;
  }, [browseWords]);

  const searchLangCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const w of results) {
      const lang = w.language?.toLowerCase() || "other";
      counts[lang] = (counts[lang] || 0) + 1;
      counts.all++;
    }
    return counts;
  }, [results]);

  const chartData = useMemo(() => {
    const filtered =
      langFilter === "all"
        ? [...browseWords]
        : browseWords.filter((w) => w.language?.toLowerCase() === langFilter);
    const validWords = filtered.filter(
      (w) => w.usageCount != null && w.usageCount > 0,
    );
    if (chartMode === "partOfSpeech") {
      const groups: Record<string, typeof validWords> = {};
      for (const w of validWords) {
        const pos = w.partOfSpeech || "other";
        if (!groups[pos]) groups[pos] = [];
        groups[pos].push(w);
      }
      const posOrder = [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "preposition",
        "conjunction",
        "pronoun",
        "particle",
        "article",
        "other",
      ];
      const result: LabChartItem[] = [];
      for (const pos of posOrder) {
        if (!groups[pos]) continue;
        result.push(
          ...groups[pos]
            .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
            .slice(0, 5)
            .map((w) => ({
              word: w.originalWord || w.transliteration || w.strongsId,
              count: w.usageCount ?? 0,
              strongsId: w.strongsId,
              language: w.language,
            })),
        );
      }
      return result;
    }
    return validWords
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, 20)
      .map((w) => ({
        word: w.originalWord || w.transliteration || w.strongsId,
        count: w.usageCount ?? 0,
        strongsId: w.strongsId,
        language: w.language,
      }));
  }, [browseWords, chartMode, langFilter]);

  const openWordDialog = useCallback(
    (strongsId: string, surfaceText?: string) => {
      setDialogStrongsId(strongsId);
      setDialogSurfaceText(surfaceText || "");
      setDialogOpen(true);
    },
    [],
  );
  const openWordDetail = useCallback(
    async (word: WordEntry) => {
      setDetailLoading(true);
      setDetailOpen(true);
      try {
        const detail = await getWordDetail(word.strongsId);
        setSelectedWord(detail);
      } catch {
        setSelectedWord(word);
      } finally {
        setDetailLoading(false);
      }
    },
    [getWordDetail],
  );
  const openWordDetailById = useCallback(
    (strongsId: string) => {
      const word = browseWords.find((w) => w.strongsId === strongsId);
      if (word) openWordDetail(word);
    },
    [browseWords, openWordDetail],
  );
  const goBack = useCallback(() => navigate(-1), [navigate]);
  const loadSelectedVerse = useCallback(() => {
    if (verseBook && verseChapter && verseNum)
      loadVerseWordsAction(verseBook, verseChapter, verseNum);
  }, [verseBook, verseChapter, verseNum, loadVerseWordsAction]);
  const loadMoreBookWords = useCallback(() => {
    loadBookWordsAction(selectedBook, browsePage + 1, true);
  }, [selectedBook, browsePage, loadBookWordsAction]);

  return {
    data: {
      mode,
      searchQuery,
      results,
      loading,
      searched,
      resultTotal,
      selectedBook,
      browseWords,
      browseLoading,
      browseLoaded,
      browseTotal,
      browsePage,
      browseHasNext,
      verseBook,
      verseChapter,
      verseNum,
      verseWords,
      verseWordsLoading,
      verseWordsLoaded,
      verseWordsTotal,
      chartMode,
      langFilter,
      langCounts,
      searchLangCounts,
      chartData,
      selectedWord,
      detailLoading,
      detailOpen,
      dialogOpen,
      dialogStrongsId,
      dialogSurfaceText,
    },
    actions: {
      setMode,
      setSearchQuery,
      setSelectedBook,
      handleBookChange,
      setBrowsePage,
      setVerseBook,
      setVerseChapter,
      setVerseNum,
      setChartMode,
      setLangFilter,
      setDetailOpen,
      setDialogOpen,
      setDialogStrongsId,
      setDialogSurfaceText,
      openWordDialog,
      openWordDetail,
      openWordDetailById,
      goBack,
      loadSelectedVerse,
      loadMoreBookWords,
    },
  };
}

export type LabDictionaryPageModel = ReturnType<typeof useLabDictionaryPage>;
