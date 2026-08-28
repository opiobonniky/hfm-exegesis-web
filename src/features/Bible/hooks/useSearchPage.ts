// useSearchPage — all state and callbacks for Search page
import { useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSearch, CROSS_TRANSLATION_OPTIONS } from "@/hooks/useSearch";
import { routes } from "@/components/Routes/routes";
import { useSubscription } from "@/hooks/useSubscription";
import type {
  PopularSearchItem,
  SearchResult,
  SearchScope,
} from "@/services/searchApi";

export function useSearchPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQueryRef = useRef(searchParams.get("query")?.trim() || "");
  const { isFree } = useSubscription();
  const search = useSearch();
  const {
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
    error: searchError,
    loadMore,
    clearQuery,
    searchedOnce,
    searchHistory,
    clearHistory,
    removeHistoryItem,
    popularSearches,
    filteredBooks,
    BOOK_NAMES,
  } = search;
  const scopeLocked = isFree && (scope === "topics" || scope === "lemma");
  const hasQuery = query.trim().length >= 3;
  const showSkeleton = loading && hasQuery && results.length === 0;
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);
  useEffect(() => {
    const initialQuery = initialQueryRef.current;
    if (initialQuery.length >= 3) searchImmediate(initialQuery, "bible");
  }, [searchImmediate]);
  const handleSelect = useCallback(
    (item: SearchResult) => {
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(item.book_name)}&chapter=${item.chapter}&verse=${item.verse}&translation=${encodeURIComponent(translation)}`,
      );
    },
    [navigate, translation],
  );
  const handleStudy = useCallback(
    (item: SearchResult) => {
      navigate(
        `${routes.labFlow.path}?book=${encodeURIComponent(item.book_name)}&chapter=${item.chapter}&verseStart=${item.verse}`,
      );
    },
    [navigate],
  );
  const handleSave = useCallback(
    (item: SearchResult) => {
      navigate(
        `${routes.journal.path}?book=${encodeURIComponent(item.book_name)}&chapter=${item.chapter}&verse=${item.verse}`,
      );
    },
    [navigate],
  );
  const handleScopeChange = useCallback(
    (s: SearchScope) => {
      switchScope(s);
      setCovenant("all");
      inputRef.current?.focus();
    },
    [switchScope, setCovenant],
  );
  const handleBookFilter = useCallback(
    (b: string | undefined) => setBookFilter(b || undefined),
    [setBookFilter],
  );
  const handleCovenantChange = useCallback(
    (c: "all" | "ot" | "nt") => {
      setCovenant(c);
      setBookFilter(undefined);
    },
    [setCovenant, setBookFilter],
  );
  const handleHistoryTap = useCallback(
    (item: string) => searchImmediate(item, scope),
    [searchImmediate, scope],
  );
  const handlePopularTap = useCallback(
    (item: PopularSearchItem) => {
      searchImmediate(item.query, item.scope);
      if (item.scope !== scope) switchScope(item.scope);
    },
    [searchImmediate, scope, switchScope],
  );
  const handleSuggestion = useCallback(
    (s: string) => {
      setQuery(s, scope);
      inputRef.current?.focus();
    },
    [setQuery, scope],
  );
  return {
    t,
    isRtl,
    inputRef,
    query,
    setQuery,
    scope,
    hasQuery,
    showSkeleton,
    total,
    loading,
    results,
    searchError,
    searchedOnce,
    scopeLocked,
    translation,
    searchHistory,
    popularSearches,
    filteredBooks,
    BOOK_NAMES,
    // Actions
    handleSelect,
    handleStudy,
    handleSave,
    handleScopeChange,
    handleBookFilter,
    handleCovenantChange,
    handleHistoryTap,
    handlePopularTap,
    handleSuggestion,
    clearQuery,
    clearHistory,
    removeHistoryItem,
    loadMore,
    CROSS_TRANSLATION_OPTIONS,
  };
}
