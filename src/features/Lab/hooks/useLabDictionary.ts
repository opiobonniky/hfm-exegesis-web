// useLabDictionary — all state for LabDictionary page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

import type { WordResult } from "../types";
export function useLabDictionary() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WordResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("lab-dict-recent") || "[]"); } catch { return []; }
  });
  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await sendPostRequest("lab", "dictionary/search", { query: q, limit: 20 });
      if (res?.returnCode === 200 && res?.returnData) {
        setResults(res.returnData.words || res.returnData || []);
        // Save to recent
        const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem("lab-dict-recent", JSON.stringify(updated));
      } else { setResults([]); toast({ title: "No results found" }); }
    } catch { toast({ title: "Search failed", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [recentSearches, toast]);
  const clearRecent = useCallback(() => { setRecentSearches([]); localStorage.removeItem("lab-dict-recent"); }, []);
  return { t, isRtl, query, setQuery, results, loading, selectedWord, setSelectedWord, search, recentSearches, clearRecent };
}
