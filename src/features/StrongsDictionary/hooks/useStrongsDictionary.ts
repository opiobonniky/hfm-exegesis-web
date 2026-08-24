// useStrongsDictionary — all state for StrongsDictionary page
import { useState, useCallback } from "react";
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
  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await sendPostRequest("lab", "strongs/search", { query: q, language, limit: 20 });
      if (res?.returnCode === 200 && res?.returnData) {
        setResults(res.returnData.words || res.returnData || []);
        const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem("strongs-recent", JSON.stringify(updated));
      } else { setResults([]); toast({ title: "No results found" }); }
    } catch { toast({ title: "Search failed", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [language, recentSearches, toast]);
  const clearRecent = useCallback(() => { setRecentSearches([]); localStorage.removeItem("strongs-recent"); }, []);
  return { query, setQuery, results, loading, selectedWord, setSelectedWord, search, language, setLanguage, recentSearches, clearRecent };
}
