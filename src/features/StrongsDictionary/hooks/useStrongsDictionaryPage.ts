import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface StrongsWord {
  strongsNumber: string;
  hebrewWord: string;
  transliteration: string;
  pronunciation: string;
  meaning: string;
  strongsDef: string;
  kjvOccurrences: number;
  language: "hebrew" | "greek";
  bdbEntry?: string;
  relatedWords?: string[];
}
const PAGE_SIZE = 20;
export function useStrongsDictionaryPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"search" | "browse" | "favorites">("search");
  const [langFilter, setLangFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StrongsWord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [selectedBook, setSelectedBook] = useState("");
  const [browseWords, setBrowseWords] = useState<StrongsWord[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseCount, setBrowseCount] = useState(0);
  const [browsePage, setBrowsePage] = useState(0);
  const [favorites, setFavorites] = useState<StrongsWord[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StrongsWord | null>(null);
  const executeSearch = useCallback(
    async (reset = true) => {
      if (!searchQuery.trim()) return;
      const page = reset ? 0 : searchPage;
      setSearchLoading(true);
      try {
        const res = await sendPostRequest("strongs", "search", {
          query: searchQuery.trim(),
          language: langFilter,
          page,
          size: PAGE_SIZE,
        });
        if (res.data?.returnCode === 200) {
          const data = res.data.returnData;
          setSearchResults(reset ? data.words : [...searchResults, ...data.words]);
          setSearchCount(data.total || 0);
          if (reset) setSearchPage(0);
        }
      } catch {
        toast({ title: "Error", description: "Search failed", variant: "destructive" });
      } finally {
        setSearchLoading(false);
      }
    },
    [searchQuery, langFilter, searchPage, searchResults, toast]
  );
  const browseByBook = useCallback(
      if (!selectedBook) return;
      const page = reset ? 0 : browsePage;
      setBrowseLoading(true);
        const res = await sendPostRequest("strongs", "browse", {
          book: selectedBook,
          setBrowseWords(reset ? data.words : [...browseWords, ...data.words]);
          setBrowseCount(data.total || 0);
          if (reset) setBrowsePage(0);
        toast({ title: "Error", description: "Browse failed", variant: "destructive" });
        setBrowseLoading(false);
    [selectedBook, langFilter, browsePage, browseWords, toast]
  useEffect(() => {
    if (mode === "browse" && selectedBook) browseByBook(true);
  }, [mode, selectedBook, langFilter]);
  const loadFavorites = useCallback(async () => {
    setFavLoading(true);
    try {
      const res = await sendPostRequest("strongs", "get-favorites", {});
      if (res.data?.returnCode === 200) setFavorites(res.data.returnData || []);
    } catch { /* ignore */ } finally {
      setFavLoading(false);
    }
  }, []);
    if (mode === "favorites") loadFavorites();
  }, [mode, loadFavorites]);
  const toggleFavorite = useCallback(
    async (word: StrongsWord) => {
        await sendPostRequest("strongs", "toggle-favorite", {
          strongsNumber: word.strongsNumber,
        if (favorites.some((f) => f.strongsNumber === word.strongsNumber)) {
          setFavorites((prev) => prev.filter((f) => f.strongsNumber !== word.strongsNumber));
        } else {
          setFavorites((prev) => [...prev, word]);
      } catch { /* ignore */ }
    [favorites]
  const isFavorited = (num: string) => favorites.some((f) => f.strongsNumber === num);
  const loadMoreSearch = () => {
    setSearchPage((p) => p + 1);
    executeSearch(false);
  };
  const loadMoreBrowse = () => {
    setBrowsePage((p) => p + 1);
    browseByBook(false);
  return {
    mode, setMode, langFilter, setLangFilter,
    searchQuery, setSearchQuery, searchResults, searchLoading, searchCount, executeSearch, loadMoreSearch,
    selectedBook, setSelectedBook, browseWords, browseLoading, browseCount, loadMoreBrowse,
    favorites, favLoading,
    selectedWord, setSelectedWord,
    toggleFavorite, isFavorited,
