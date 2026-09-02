import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useLabDictionary as useLabDictService } from "../services/use-lab-dictionary";

import type { WordResult } from "../types";

export function useLabDictionary() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const { searchWords } = useLabDictService();

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
      const { words } = await searchWords(q);
      setResults(words);
      const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem("lab-dict-recent", JSON.stringify(updated));
    } catch { 
      setResults([]); 
      toast({ title: "Search failed", variant: "destructive" }); 
    } finally { 
      setLoading(false); 
    }
  }, [recentSearches, toast, searchWords]);

  const clearRecent = useCallback(() => { 
    setRecentSearches([]); 
    localStorage.removeItem("lab-dict-recent"); 
  }, []);

  return {
    data: { t, isRtl, query, results, loading, selectedWord, recentSearches },
    actions: { setQuery, setSelectedWord, search, clearRecent },
  };
}
