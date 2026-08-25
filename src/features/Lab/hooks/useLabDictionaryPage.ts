import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendGetRequest, sendPostRequest } from "@/services/api";
import type { StrongsWordEntry } from "@/services/strongsApi";

type WordEntry = StrongsWordEntry;
type Mode = "search" | "browse" | "verse";
type ChartMode = "frequency" | "partOfSpeech";
const BROWSE_PAGE_SIZE = 100;
export function useLabDictionaryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("search");
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
  const browseLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [verseBook, setVerseBook] = useState("");
  const [verseChapter, setVerseChapter] = useState<number>(0);
  const [verseNum, setVerseNum] = useState<number>(0);
  const [verseWords, setVerseWords] = useState<WordEntry[]>([]);
  const [verseWordsLoading, setVerseWordsLoading] = useState(false);
  const [verseWordsLoaded, setVerseWordsLoaded] = useState(false);
  const [verseWordsTotal, setVerseWordsTotal] = useState(0);
  const [chartMode, setChartMode] = useState<ChartMode>("frequency");
  const [langFilter, setLangFilter] = useState("all");
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStrongsId, setDialogStrongsId] = useState<string | null>(null);
  const [dialogSurfaceText, setDialogSurfaceText] = useState("");
  const executeSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) return;
    setLoading(true); setSearched(true);
    try {
      const res = await sendGetRequest("strongs", "search", { q: query.trim(), limit: 50, offset: 0 });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        setResults(rd.data || []); setResultTotal(rd.total ?? rd.data?.length ?? 0);
      } else { setResults([]); setResultTotal(0); }
    } catch { setResults([]); setResultTotal(0); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => executeSearch(searchQuery), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, executeSearch]);
  const loadBookWords = useCallback(async (book: string, page = 0, append = false) => {
    if (!book) return;
    setBrowseLoading(true); if (!append) setBrowseLoaded(false);
      const res = await sendGetRequest("strongs", `book-words/${encodeURIComponent(book)}`, { limit: BROWSE_PAGE_SIZE, offset: page * BROWSE_PAGE_SIZE });
        const rd = res.returnData as any; const newData = rd.data || [];
        setBrowseWords((prev) => (append ? [...prev, ...newData] : newData));
        setBrowseTotal(rd.total ?? newData.length); setBrowseHasNext(!!rd.hasNext); setBrowsePage(page);
      } else { if (!append) { setBrowseWords([]); setBrowseTotal(0); } setBrowseHasNext(false); }
    } catch { if (!append) { setBrowseWords([]); setBrowseTotal(0); } setBrowseHasNext(false); }
    finally { setBrowseLoading(false); setBrowseLoaded(true); }
  }, [book]);
  const loadVerseWords = useCallback(async (book: string, chapter: number, verse: number) => {
    if (!book || !chapter || !verse) return;
    setVerseWordsLoading(true); setVerseWordsLoaded(false);
      const res = await sendPostRequest("strongs", "verse-unique-words", { bookName: book, chapter, verse, translation: "BSB" });
        const rd = res.returnData as any; setVerseWords(rd.data || []); setVerseWordsTotal(rd.total ?? rd.data?.length ?? 0);
      } else { setVerseWords([]); setVerseWordsTotal(0); }
    } catch { setVerseWords([]); setVerseWordsTotal(0); }
    finally { setVerseWordsLoading(false); setVerseWordsLoaded(true); }
    const book = searchParams.get("book"); const chapter = searchParams.get("chapter"); const verse = searchParams.get("verse");
    if (book && chapter && verse) {
      const ch = parseInt(chapter, 10); const vs = parseInt(verse, 10);
      if (!isNaN(ch) && !isNaN(vs)) { setVerseBook(book); setVerseChapter(ch); setVerseNum(vs); setMode("verse"); loadVerseWords(book, ch, vs); }
  const handleBookChange = useCallback((book: string) => {
    setSelectedBook(book); setBrowsePage(0); setBrowseHasNext(false);
    if (book) {
      if (browseLoadTimeoutRef.current) clearTimeout(browseLoadTimeoutRef.current);
      browseLoadTimeoutRef.current = setTimeout(() => { loadBookWords(book, 0, false); }, 300);
    } else { setBrowseWords([]); setBrowseLoaded(false); setBrowseTotal(0); }
  }, [loadBookWords]);
  useEffect(() => { return () => { if (browseLoadTimeoutRef.current) clearTimeout(browseLoadTimeoutRef.current); }; }, []);
  const langCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const w of browseWords) { const lang = w.language?.toLowerCase() || "other"; counts[lang] = (counts[lang] || 0) + 1; counts.all++; }
    return counts;
  }, [browseWords]);
  const searchLangCounts = useMemo(() => {
    for (const w of results) { const lang = w.language?.toLowerCase() || "other"; counts[lang] = (counts[lang] || 0) + 1; counts.all++; }
  }, [results]);
  const chartData = useMemo(() => {
    const filtered = langFilter === "all" ? [...browseWords] : browseWords.filter((w) => w.language?.toLowerCase() === langFilter);
    const validWords = filtered.filter((w) => w.usageCount != null && w.usageCount > 0);
    if (chartMode === "partOfSpeech") {
      const groups: Record<string, typeof validWords> = {};
      for (const w of validWords) { const pos = w.partOfSpeech || "other"; if (!groups[pos]) groups[pos] = []; groups[pos].push(w); }
      const posOrder = ["noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "particle", "article", "other"];
      const result: Array<any> = [];
      for (const pos of posOrder) { if (!groups[pos]) continue; result.push(...groups[pos].sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0)).slice(0, 5).map((w) => ({ word: w.originalWord || w.transliteration || w.strongsId, transliteration: w.transliteration, definition: w.shortDefinition, usageCount: w.usageCount ?? 0, strongsId: w.strongsId, language: w.language, partOfSpeech: pos }))); }
      return result;
    return validWords.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0)).slice(0, 20).map((w) => ({ word: w.originalWord || w.transliteration || w.strongsId, transliteration: w.transliteration, definition: w.shortDefinition, usageCount: w.usageCount ?? 0, strongsId: w.strongsId, language: w.language, partOfSpeech: w.partOfSpeech || "" }));
  }, [browseWords, chartMode, langFilter]);
  const openWordDialog = useCallback((strongsId: string, surfaceText?: string) => { setDialogStrongsId(strongsId); setDialogSurfaceText(surfaceText || ""); setDialogOpen(true); }, []);
  const openWordDetail = useCallback(async (word: WordEntry) => {
    setDetailLoading(true); setDetailOpen(true);
    try { const res = await sendGetRequest("strongs", word.strongsId, {}); if (res.returnCode === 200 && res.returnData) setSelectedWord(res.returnData as WordEntry); else setSelectedWord(word); }
    catch { setSelectedWord(word); } finally { setDetailLoading(false); }
  const openWordDetailById = useCallback((strongsId: string) => { const word = browseWords.find((w) => w.strongsId === strongsId); if (word) openWordDetail(word); }, [browseWords, openWordDetail]);
  return {
    navigate, mode, setMode, searchQuery, setSearchQuery, results, loading, searched, resultTotal,
    selectedBook, handleBookChange, browseWords, browseLoading, browseLoaded, browseTotal, browsePage, browseHasNext,
    setBrowsePage, loadBookWords,
    verseBook, setVerseBook, verseChapter, setVerseChapter, verseNum, setVerseNum,
    verseWords, verseWordsLoading, verseWordsLoaded, verseWordsTotal, loadVerseWords,
    chartMode, setChartMode, langFilter, setLangFilter, langCounts, searchLangCounts, chartData,
    selectedWord, setSelectedWord, detailLoading, detailOpen, setDetailOpen, openWordDetail, openWordDetailById,
    dialogOpen, setDialogOpen, dialogStrongsId, dialogSurfaceText, openWordDialog,
  };
}
