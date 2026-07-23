import { useState, useCallback, useRef, useEffect } from "react";
import {
  searchApi,
  SearchResult,
  JournalSearchResult,
  TopicResult,
  LemmaResult,
  CrossTranslationResult,
  PopularSearchItem,
  SearchScope,
} from "@/services/searchApi";

const SEARCH_HISTORY_KEY = "exegesis_search_history";
const MAX_HISTORY_ITEMS = 10;

// ── Translations available for cross-translation search ──
export const CROSS_TRANSLATION_OPTIONS = [
  { id: "Berean", abbr: "BSB", name: "Berean Standard Bible" },
  { id: "KJV", abbr: "KJV", name: "King James Version" },
  { id: "WEB", abbr: "WEB", name: "World English Bible" },
  { id: "ASV", abbr: "ASV", name: "American Standard Version" },
  { id: "YLT", abbr: "YLT", name: "Young's Literal Translation" },
  { id: "Darby", abbr: "DBY", name: "Darby Translation" },
  { id: "Webster", abbr: "WBS", name: "Webster's Bible" },
  { id: "BBE", abbr: "BBE", name: "Bible in Basic English" },
];

export const SUGGESTIONS: Record<SearchScope, string[]> = {
  bible: ["love", "faith", "hope", "peace", "joy", "grace", "mercy", "truth"],
  journal: ["prayer", "thanksgiving", "healing", "wisdom", "faith", "peace"],
  topics: [
    "love",
    "faith",
    "salvation",
    "grace",
    "covenant",
    "redemption",
    "kingdom",
    "holiness",
  ],
  lemma: [
    "anthropos",
    "logos",
    "agape",
    "pistis",
    "charis",
    "doxa",
    "zoe",
    "soteria",
  ],
};

const BOOK_NAMES = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation",
];

export const SCOPE_LABELS: Record<SearchScope, string> = {
  bible: "Bible",
  journal: "Journal",
  topics: "Topics",
  lemma: "Lemma",
};

export type SearchResultItem = SearchResult | JournalSearchResult | TopicResult | LemmaResult | CrossTranslationResult;

export function useSearch() {
  const [query, setQueryState] = useState("");
  const [scope, setScopeState] = useState<SearchScope>("bible");
  const [bookName, setBookNameState] = useState<string | undefined>(undefined);
  const [covenant, setCovenantState] = useState<"all" | "ot" | "nt">("all");
  const [translation, setTranslationState] = useState<string>("Berean");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearchItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const historyLoadedRef = useRef(false);

  // ── Load search history from localStorage on mount ──
  useEffect(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed.slice(0, MAX_HISTORY_ITEMS));
        }
      }
    } catch {}
  }, []);

  // ── Fetch popular searches from backend ──
  useEffect(() => {
    searchApi.getPopularSearches({ scope, limit: 8, days: 7 }).then((items) => {
      if (items.length > 0) {
        setPopularSearches(items);
      }
    }).catch(() => {});
  }, [scope]);

  // ── Save query to history after a successful search ──
  const saveToHistory = useCallback((q: string) => {
    if (q.trim().length < 3) return;
    setSearchHistory((prev) => {
      const cleaned = q.trim();
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== cleaned.toLowerCase(),
      );
      const updated = [cleaned, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  }, []);

  const removeHistoryItem = useCallback((item: string) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((i) => i !== item);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // ── Debounced search effect ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      if (results.length > 0) {
        setResults([]);
        setTotal(0);
        setPage(1);
        setLoading(false);
      }
      return;
    }

    const requestId = ++requestIdRef.current;

    setError(null);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        let data: SearchResultItem[] = [];
        let totalCount = 0;

        if (scope === "journal") {
          const res = await searchApi.searchJournal(trimmed, { limit: 50 });
          if (requestId !== requestIdRef.current) return;
          data = res.data;
          totalCount = res.total;
        } else if (scope === "topics") {
          const res = await searchApi.searchTopics(trimmed, { limit: 50 });
          if (requestId !== requestIdRef.current) return;
          data = res.data;
          totalCount = res.total;
        } else if (scope === "lemma") {
          const res = await searchApi.searchLemma(trimmed);
          if (requestId !== requestIdRef.current) return;
          data = res.data;
          totalCount = res.total;
        } else {
          // Bible search — single translation
          const res = await searchApi.search(trimmed, {
            translation,
            bookName,
            covenant,
            limit: 50,
          });
          if (requestId !== requestIdRef.current) return;
          if (res.success) {
            data = res.data as any;
            totalCount = res.total;
          }
        }

        if (requestId !== requestIdRef.current) return;
        setResults(data);
        setTotal(totalCount);
        setPage(1);
      } catch (e: any) {
        if (requestId !== requestIdRef.current) return;
        setError(e?.message || "Search failed");
        setResults([]);
        setTotal(0);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
        setSearchedOnce(true);
        if (!error) {
          saveToHistory(query);
          searchApi.logSearch(query.trim(), scope).catch(() => {});
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, scope, bookName, translation, covenant]);

  const setQuery = useCallback(
    (q: string, currentScope?: SearchScope) => {
      const activeScope = currentScope ?? scope;
      setQueryState(q);
      if (currentScope) setScopeState(currentScope);
    },
    [scope],
  );

  const switchScope = useCallback((newScope: SearchScope) => {
    setScopeState(newScope);
    setBookNameState(undefined);
    setCovenantState("all");
    setResults([]);
    setTotal(0);
    setError(null);
    setSearchedOnce(false);
  }, []);

  const setBookFilter = useCallback((book: string | undefined) => {
    setBookNameState(book);
  }, []);

  const setCovenant = useCallback((c: "all" | "ot" | "nt") => {
    setCovenantState(c);
  }, []);

  const setTranslation = useCallback((t: string) => {
    setTranslationState(t);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || query.trim().length < 3) return;
    const nextPage = page + 1;
    setLoading(true);

    try {
      let newData: SearchResultItem[] = [];
      if (scope === "journal") {
        const res = await searchApi.searchJournal(query.trim(), {
          limit: 50,
          offset: (nextPage - 1) * 50,
        });
        newData = res.data;
      } else if (scope === "topics") {
        const res = await searchApi.searchTopics(query.trim(), { limit: 50 });
        newData = res.data;
      } else {
        const res = await searchApi.search(query.trim(), {
          translation,
          covenant,
          limit: 50,
          offset: (nextPage - 1) * 50,
          bookName,
        });
        if (res.success) newData = res.data as any;
      }
      setResults((prev) => [...prev, ...newData]);
      setPage(nextPage);
    } catch (e: any) {
      setError(e?.message || "Load more failed");
    } finally {
      setLoading(false);
    }
  }, [loading, query, scope, page, bookName, translation, covenant]);

  const clearQuery = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQueryState("");
    setResults([]);
    setTotal(0);
    setPage(1);
    setError(null);
  }, []);

  const searchImmediate = useCallback(
    (q: string, currentScope?: SearchScope) => {
      const activeScope = currentScope ?? scope;
      setQueryState(q);
      setScopeState(activeScope);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = q.trim();
      if (trimmed.length < 3) return;

      const requestId = ++requestIdRef.current;
      setError(null);
      setLoading(true);

      const doSearch = async () => {
        try {
          let data: SearchResultItem[] = [];
          let totalCount = 0;

          if (activeScope === "journal") {
            const res = await searchApi.searchJournal(trimmed, { limit: 50 });
            if (requestId !== requestIdRef.current) return;
            data = res.data;
            totalCount = res.total;
          } else if (activeScope === "topics") {
            const res = await searchApi.searchTopics(trimmed, { limit: 50 });
            if (requestId !== requestIdRef.current) return;
            data = res.data;
            totalCount = res.total;
          } else if (activeScope === "lemma") {
            const res = await searchApi.searchLemma(trimmed);
            if (requestId !== requestIdRef.current) return;
            data = res.data;
            totalCount = res.total;
          } else {
            const res = await searchApi.search(trimmed, {
              translation,
              covenant,
              limit: 50,
            });
            if (requestId !== requestIdRef.current) return;
            if (res.success) {
              data = res.data as any;
              totalCount = res.total;
            }
          }

          if (requestId !== requestIdRef.current) return;
          setResults(data);
          setTotal(totalCount);
          setPage(1);
        } catch (e: any) {
          if (requestId !== requestIdRef.current) return;
          setError(e?.message || "Search failed");
          setResults([]);
          setTotal(0);
        } finally {
          if (requestId !== requestIdRef.current) return;
          setLoading(false);
          setSearchedOnce(true);
          saveToHistory(q);
          searchApi.logSearch(q.trim(), activeScope).catch(() => {});
        }
      };
      doSearch();
    },
    [scope, translation, covenant, saveToHistory],
  );

  const filteredBooks = useCallback(
    (covenant: "all" | "ot" | "nt") => {
      if (covenant === "ot") return BOOK_NAMES.slice(0, 39);
      if (covenant === "nt") return BOOK_NAMES.slice(39);
      return BOOK_NAMES;
    },
    [],
  );

  return {
    query,
    setQuery,
    searchImmediate,
    scope,
    switchScope,
    bookName,
    setBookFilter,
    covenant,
    setCovenant,
    translation,
    setTranslation,
    results,
    loading,
    total,
    error,
    loadMore,
    clearQuery,
    searchedOnce,
    searchHistory,
    clearHistory,
    removeHistoryItem,
    popularSearches,
    CROSS_TRANSLATION_OPTIONS,
    filteredBooks,
    BOOK_NAMES,
  };
}
