// useStrongsDictionary — all state for StrongsDictionary page
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

import type { StrongWord } from "../types";
export function useStrongsDictionary() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StrongWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StrongWord | null>(null);
  const [language, setLanguage] = useState<"hebrew" | "greek">("greek");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("strongs-recent") || "[]"); } catch { return []; }
  });
  const languageRef = useRef(language);
  const recentSearchesRef = useRef(recentSearches);
  const activeRequestRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  languageRef.current = language;
  recentSearchesRef.current = recentSearches;

  const search = useCallback(async (q: string) => {
    const normalizedQuery = q.trim();
    if (!normalizedQuery) return;

    const requestKey = `${languageRef.current}:${normalizedQuery.toLowerCase()}`;
    if (activeRequestRef.current === requestKey) return;

    const requestId = ++requestIdRef.current;
    activeRequestRef.current = requestKey;
    setLoading(true);
    try {
      const res = await sendPostRequest("lab", "strongs/search", {
        query: normalizedQuery,
        language: languageRef.current,
        limit: 20,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        if (requestId !== requestIdRef.current) return;
        setResults(res.returnData.words || res.returnData || []);
        const updated = [
          normalizedQuery,
          ...recentSearchesRef.current.filter((s) => s !== normalizedQuery),
        ].slice(0, 10);
        setRecentSearches(updated);
        recentSearchesRef.current = updated;
        localStorage.setItem("strongs-recent", JSON.stringify(updated));
      } else if (requestId === requestIdRef.current) {
        setResults([]);
        toast({ title: "No results found" });
      }
    } catch {
      if (requestId === requestIdRef.current) {
        toast({ title: "Search failed", variant: "destructive" });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        activeRequestRef.current = null;
        setLoading(false);
      }
    }
  }, [toast]);
  const clearRecent = useCallback(() => { setRecentSearches([]); localStorage.removeItem("strongs-recent"); }, []);
  return { query, setQuery, results, loading, selectedWord, setSelectedWord, search, language, setLanguage, recentSearches, clearRecent };
}
