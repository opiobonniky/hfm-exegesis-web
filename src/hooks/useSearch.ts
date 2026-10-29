import { useState, useCallback, useRef, useEffect } from "react";
import { searchApi, type SearchResult, type PopularSearchItem } from "@/services/searchApi";

const HISTORY_KEY = "exegesis_bible_search_history";
const POPULAR_HIDDEN_KEY = "exegesis_bible_search_popular_hidden";
export const MIN_QUERY_LENGTH = 3;
export const SEARCH_PAGE_SIZE = 5;
export const SUGGESTIONS = ["love", "faith", "hope", "peace", "joy", "grace", "mercy", "truth"];
export type Covenant = "all" | "ot" | "nt";

function readHistory(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length >= MIN_QUERY_LENGTH).slice(0, 10) : [];
  } catch { return []; }
}
function store(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ }
}

/** Bible content only, in one active edition. Requests are invalidated on every input change. */
export function useSearch(translation: string | null) {
  const [query, setQueryState] = useState("");
  const [bookName, setBookNameState] = useState<string>();
  const [covenant, setCovenantState] = useState<Covenant>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [searchHistory, setSearchHistory] = useState(readHistory);
  const [popularSearches, setPopularSearches] = useState<PopularSearchItem[]>([]);
  const [popularHidden, setPopularHidden] = useState(() => {
    try { return localStorage.getItem(POPULAR_HIDDEN_KEY) === "1"; } catch { return false; }
  });
  const requestRef = useRef(0);
  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const skipRef = useRef<string | null>(null);
  const signature = JSON.stringify([query.trim(), translation, bookName, covenant]);
  const activeSignatureRef = useRef(signature);
  activeSignatureRef.current = signature;

  const invalidate = useCallback(() => {
    requestRef.current += 1;
    inFlightRef.current = false;
    clearTimeout(timerRef.current);
    setLoading(false);
    setError(null);
    setResults([]);
    setTotal(0);
    setSearchedOnce(false);
  }, []);

  const saveHistory = useCallback((text: string) => {
    setSearchHistory(previous => {
      const next = [text, ...previous.filter(item => item.toLowerCase() !== text.toLowerCase())].slice(0, 10);
      store(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (popularHidden) return;
    let cancelled = false;
    searchApi.getPopularSearches({ scope: "bible", limit: 8, days: 7 })
      .then(items => { if (!cancelled) setPopularSearches(items.filter(item => item.scope === "bible")); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [popularHidden]);

  const runSearch = useCallback(async (raw: string, append = false, offset = 0) => {
    const trimmed = raw.trim();
    if (!translation || trimmed.length < MIN_QUERY_LENGTH) return;
    const request = ++requestRef.current;
    const requestedSignature = JSON.stringify([trimmed, translation, bookName, covenant]);
    const current = () => request === requestRef.current && requestedSignature === activeSignatureRef.current;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await searchApi.search(trimmed, { translation, bookName, covenant, limit: SEARCH_PAGE_SIZE, offset });
      if (!current()) return;
      if (!response.success) throw new Error("Search is temporarily unavailable. Please try again.");
      setResults(previous => append ? [...previous, ...response.data] : response.data);
      setTotal(response.total);
      setSearchedOnce(true);
      if (!append) {
        saveHistory(trimmed);
        void searchApi.logSearch(trimmed, "bible").catch(() => {});
      }
    } catch (cause) {
      if (!current()) return;
      setError(cause instanceof Error ? cause.message : "Search unavailable. Check your connection and try again.");
      if (!append) { setResults([]); setTotal(0); setSearchedOnce(true); }
    } finally {
      if (current()) { inFlightRef.current = false; setLoading(false); }
    }
  }, [translation, bookName, covenant, saveHistory]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (skipRef.current === signature) { skipRef.current = null; return; }
    skipRef.current = null;
    invalidate();
    if (!translation || query.trim().length < MIN_QUERY_LENGTH) return;
    setLoading(true);
    timerRef.current = setTimeout(() => { void runSearch(query); }, 300);
    return () => { clearTimeout(timerRef.current); };
  }, [signature, query, translation, runSearch, invalidate]);

  useEffect(() => () => { clearTimeout(timerRef.current); requestRef.current += 1; }, []);

  const setQuery = useCallback((text: string) => {
    invalidate();
    skipRef.current = null;
    setQueryState(text);
  }, [invalidate]);
  const searchImmediate = useCallback((text: string) => {
    invalidate();
    const nextSignature = JSON.stringify([text.trim(), translation, bookName, covenant]);
    skipRef.current = nextSignature;
    activeSignatureRef.current = nextSignature;
    setQueryState(text);
    void runSearch(text);
  }, [translation, bookName, covenant, invalidate, runSearch]);
  const setBookFilter = useCallback((book?: string) => {
    if (book === bookName) return;
    invalidate(); setBookNameState(book);
  }, [invalidate, bookName]);
  const setCovenant = useCallback((next: Covenant) => {
    if (next === covenant && !bookName) return;
    invalidate(); setCovenantState(next); setBookNameState(undefined);
  }, [invalidate, covenant, bookName]);
  const loadMore = useCallback(() => {
    if (inFlightRef.current || loading || results.length >= total) return;
    void runSearch(query, true, results.length);
  }, [loading, results.length, total, runSearch, query]);
  const clearHistory = useCallback(() => { setSearchHistory([]); store(HISTORY_KEY, "[]"); }, []);
  const removeHistoryItem = useCallback((item: string) => {
    setSearchHistory(previous => {
      const next = previous.filter(entry => entry !== item);
      store(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const clearPopularSearches = useCallback(() => {
    setPopularHidden(true); setPopularSearches([]); store(POPULAR_HIDDEN_KEY, "1");
  }, []);
  return {
    query, setQuery, searchImmediate, clearQuery: useCallback(() => setQuery(""), [setQuery]),
    bookName, setBookFilter, covenant, setCovenant, results, total, loading, error,
    searchedOnce, loadMore, hasMore: results.length > 0 && results.length < total,
    searchHistory, clearHistory, removeHistoryItem, popularSearches, clearPopularSearches,
  };
}
