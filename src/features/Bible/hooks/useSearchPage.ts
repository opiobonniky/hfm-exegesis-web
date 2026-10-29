import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSearch, MIN_QUERY_LENGTH } from "@/hooks/useSearch";
import { routes } from "@/components/Routes/routes";
import { useSubscription } from "@/hooks/useSubscription";
import { tt } from "@/components/languages/hardcodedTranslate";
import { BIBLE_BOOKS } from "../constants";
import { useSearchSectionHeadings } from "./useSearchSectionHeadings";
import { useSearchTranslation } from "./useSearchTranslation";
import type { SearchResult } from "@/services/searchApi";

export function useSearchPage() {
  const { lang, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasAccess } = useSubscription();
  const version = useSearchTranslation(lang, params.get("translation"));
  const search = useSearch(version.translation);
  const { searchImmediate, setQuery } = search;
  const inputRef = useRef<HTMLInputElement>(null);
  const lastRouteQuery = useRef<string | null>(null);
  const [searchContext, setSearchContext] = useState<string | null>(null);
  const incoming = params.get("query") || params.get("word") || params.get("strongsId") || "";
  const fromWord = !params.get("query") && !!params.get("word");
  useEffect(() => {
    const text = incoming.trim();
    if (!version.translation || !text || lastRouteQuery.current === text) return;
    lastRouteQuery.current = text;
    setSearchContext(fromWord ? `${tt("All uses of")} “${text}”` : null);
    searchImmediate(text);
    inputRef.current?.blur();
  }, [incoming, fromWord, version.translation, searchImmediate]);
  useEffect(() => {
    if (incoming) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [incoming]);
  const sectionHeadings = useSearchSectionHeadings(search.results, version.translation || "", lang);
  const passageUrl = useCallback((item: SearchResult, extra: Record<string, string> = {}) => {
    const query = new URLSearchParams({ book: item.book_name, chapter: String(item.chapter), verse: String(item.verse), translation: version.translation || "", ...extra });
    return `${routes.bibleReader.path}?${query}`;
  }, [version.translation]);
  const handleSelect = useCallback((item: SearchResult) => navigate(passageUrl(item)), [navigate, passageUrl]);
  const handleSave = useCallback((item: SearchResult) => navigate(passageUrl(item, { action: "highlight" })), [navigate, passageUrl]);
  const handleAddNote = useCallback((item: SearchResult) => navigate(passageUrl(item, { action: "note" })), [navigate, passageUrl]);
  const handleStudy = useCallback((item: SearchResult) => {
    if (!hasAccess("legacy_sower")) { navigate(routes.sower.path); return; }
    const query = new URLSearchParams({ book: item.book_name, chapter: String(item.chapter), verseStart: String(item.verse), verseEnd: String(item.verse), requestedStage: "look", translation: version.translation || "" });
    navigate(`${routes.labFlow.path}?${query}`);
  }, [navigate, hasAccess, version.translation]);
  const handleInputChange = useCallback((text: string) => { setSearchContext(null); setQuery(text); }, [setQuery]);
  const handleHistoryTap = useCallback((text: string) => { setSearchContext(null); searchImmediate(text); }, [searchImmediate]);
  return {
    data: {
      ...search, ...version, isRtl, inputRef, searchContext, sectionHeadings,
      searchError: search.error || version.error, versionLoading: version.loading,
      loading: search.loading, hasQuery: search.query.trim().length > 0,
      canSearch: search.query.trim().length >= MIN_QUERY_LENGTH,
      showSkeleton: search.loading && search.query.trim().length >= MIN_QUERY_LENGTH && search.results.length === 0,
      books: BIBLE_BOOKS.filter(book => search.covenant === "all" || (search.covenant === "ot" ? book.bookNumber <= 39 : book.bookNumber > 39)).map(book => book.bookName),
    },
    actions: {
      handleInputChange, handleHistoryTap, handleSuggestion: handleHistoryTap,
      handlePopularTap: (item: { query: string }) => handleHistoryTap(item.query),
      handleSelect, handleSave, handleAddNote, handleStudy,
      handleBack: () => window.history.state?.idx > 0 ? navigate(-1) : navigate(routes.bibleReader.path),
    },
  };
}
