// useVerseResources — all state, effects, and logic for VerseResources page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getVerseResources,
  getTranslationComparison,
} from "@/services/verseResourcesApi";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type {
  VerseResourceData,
  TranslationComparisonEntry,
} from "@/services/verseResourcesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";

import type { TabKey } from "../types";
export function useVerseResources() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookName = searchParams.get("book") || "";
  const chapter = parseInt(searchParams.get("chapter") || "0", 10);
  const verseNumber = parseInt(searchParams.get("verse") || "1", 10);
  const requestedTab = searchParams.get("tab");
  const initialTab: TabKey =
    requestedTab === "crossReferences" || requestedTab === "translations"
      ? requestedTab
      : "commentaries";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [data, setData] = useState<VerseResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<
    TranslationComparisonEntry[] | null
  >(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState<string | null>(
    null,
  );
  const [prologue, setPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);
  const verseRef = `${bookName} ${chapter}:${verseNumber}`;
  const fetchAll = useCallback(async () => {
    if (!bookName || !chapter) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getVerseResources(bookName, chapter, verseNumber));
    } catch {
      setError("Failed to load verse resources.");
    } finally {
      setLoading(false);
    }
    setTranslationsLoading(true);
    try {
      setTranslations(
        await getTranslationComparison(bookName, chapter, verseNumber),
      );
    } catch {
      setTranslationsError("No translations available");
      setTranslations(null);
    } finally {
      setTranslationsLoading(false);
    }
    setPrologueLoading(true);
    try {
      setPrologue(await getBookPrologue(bookName));
    } catch {
      setPrologue(null);
    } finally {
      setPrologueLoading(false);
    }
  }, [bookName, chapter, verseNumber]);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const visibleTabs = useMemo(() => {
    const tabs: TabKey[] = [];
    if (!data) return tabs;
    if (data.commentaries.length > 0) tabs.push("commentaries");
    if (data.crossReferences.length > 0) tabs.push("crossReferences");
    if (data.wordStudies.length > 0) tabs.push("wordStudies");
    if (data.dictionaryTerms.length > 0) tabs.push("dictionary");
    if (translations && translations.length > 0) tabs.push("translations");
    if (data.interlinearWords.length > 0) tabs.push("interlinear");
    if (data.relatedTopics.length > 0) tabs.push("topics");
    return tabs;
  }, [data, translations]);
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab))
      setActiveTab(visibleTabs[0]);
  }, [visibleTabs, activeTab]);
  useEffect(() => {
    setActiveTab(initialTab);
  }, [bookName, chapter, verseNumber, initialTab]);
  const goToReader = useCallback(() => {
    navigate(
      `/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber}`,
    );
  }, [navigate, bookName, chapter, verseNumber]);
  return {
    bookName,
    chapter,
    verseNumber,
    verseRef,
    activeTab,
    setActiveTab,
    data,
    loading,
    error,
    translations,
    translationsLoading,
    translationsError,
    prologue,
    prologueLoading,
    visibleTabs,
    goToReader,
  };
}
