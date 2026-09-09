import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendGetRequest, sendPostRequest } from "@/services/api";
import { searchStrongs } from "../services";

export interface ContextualStudy {
  surfaceText: string | null;
  customDefinition: string | null;
  sortOrder: number;
  reference: {
    bookName: string;
    chapter: number;
    verseNumber: number;
    bibleVersion: string | null;
  } | null;
  themes: string[];
}

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
  contextualStudies?: ContextualStudy[];
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
  const searchRequestRef = useRef(0);
  const searchPageRef = useRef(0);
  const searchFilterRef = useRef("all");
  const submittedQueryRef = useRef("");
  const completedSearchKeyRef = useRef("");

  searchPageRef.current = searchPage;
  searchFilterRef.current = langFilter;

  const executeSearch = useCallback(
    async (queryOverride?: string, reset = true) => {
      const query = (queryOverride ?? submittedQueryRef.current).trim();
      if (!query) return;
      const page = reset ? 0 : searchPageRef.current + 1;
      submittedQueryRef.current = query;
      const language =
        searchFilterRef.current === "all"
          ? ""
          : searchFilterRef.current;
      const searchKey = `${query.toLowerCase()}|${language}|${page}`;
      if (reset && completedSearchKeyRef.current === searchKey) return;
      const requestId = ++searchRequestRef.current;
      setSearchLoading(true);
      try {
        const res = await searchStrongs({
          query,
          language: language || undefined,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });
        if (requestId !== searchRequestRef.current) return;
        if (res.returnCode === 200) {
          const data = res.returnData;
          const words = (data?.data || []).map((word: any) => ({
            strongsNumber: word.strongsId,
            hebrewWord: word.originalWord || "",
            transliteration: word.transliteration || "",
            pronunciation: word.pronunciation || "",
            meaning: word.shortDefinition || "",
            strongsDef: word.fullDefinition || word.shortDefinition || "",
            kjvOccurrences: word.usageCount || 0,
            language: word.language === "hebrew" ? "hebrew" : "greek",
            bdbEntry: word.adminExplanation || undefined,
            contextualStudies: word.contextualStudies || [],
          }));
          setSearchResults((previous) =>
            reset ? words : [...previous, ...words],
          );
          setSearchCount(data?.total || 0);
          setSearchPage(page);
          completedSearchKeyRef.current = searchKey;
        }
      } catch {
        if (requestId === searchRequestRef.current) {
          toast({
            title: "Error",
            description: "Search failed",
            variant: "destructive",
          });
        }
      } finally {
        if (requestId === searchRequestRef.current) setSearchLoading(false);
      }
    },
    [],
  );

  const browseByBook = useCallback(
    async (reset = true, bookOverride?: string) => {
      const book = bookOverride || selectedBook;
      if (!book) return;
      const page = reset ? 0 : browsePage + 1;
      setBrowseLoading(true);
      if (reset) setBrowseWords([]);
      try {
        const res = await sendGetRequest("strongs", `book-words/${encodeURIComponent(book)}`, {
          lang: langFilter === "all" ? undefined : langFilter,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });
        if (res.returnCode === 200) {
          const data = res.returnData;
          const words = (data?.data || []).map((word: any) => ({
            strongsNumber: word.strongsId,
            hebrewWord: word.originalWord || "",
            transliteration: word.transliteration || "",
            pronunciation: word.pronunciation || "",
            meaning: word.shortDefinition || "",
            strongsDef: word.fullDefinition || word.shortDefinition || "",
            kjvOccurrences: word.usageCount || 0,
            language: word.language === "hebrew" ? "hebrew" : "greek",
            bdbEntry: word.adminExplanation || undefined,
            contextualStudies: word.contextualStudies || [],
          }));
          setBrowseWords((previous) => reset ? words : [...previous, ...words]);
          setBrowseCount(data?.total || 0);
          setBrowsePage(page);
        }
      } catch {
        toast({
          title: "Error",
          description: "Browse failed",
          variant: "destructive",
        });
      } finally {
        setBrowseLoading(false);
      }
    },
    [selectedBook, langFilter, browsePage, toast],
  );

  const loadSelectedBook = useCallback(
    (book: string) => browseByBook(true, book),
    [browseByBook],
  );

  const loadFavorites = useCallback(async () => {
    setFavLoading(true);
    try {
      const res = await sendPostRequest("strongs", "get-favorites", {});
      if (res.data?.returnCode === 200) setFavorites(res.data.returnData || []);
    } catch {
      /* ignore */
    } finally {
      setFavLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === "favorites") loadFavorites();
  }, [mode, loadFavorites]);

  const toggleFavorite = useCallback(
    async (word: StrongsWord) => {
      try {
        await sendPostRequest("strongs", "toggle-favorite", {
          strongsNumber: word.strongsNumber,
        });
        if (favorites.some((f) => f.strongsNumber === word.strongsNumber)) {
          setFavorites((prev) =>
            prev.filter((f) => f.strongsNumber !== word.strongsNumber),
          );
        } else {
          setFavorites((prev) => [...prev, word]);
        }
      } catch {
        /* ignore */
      }
    },
    [favorites],
  );

  const isFavorited = useCallback(
    (num: string) => favorites.some((f) => f.strongsNumber === num),
    [favorites],
  );

  const loadMoreSearch = () => {
    executeSearch(undefined, false);
  };

  const loadMoreBrowse = () => {
    browseByBook(false);
  };

  const navigate = useNavigate();
  const goBack = useCallback(() => navigate(-1), [navigate]);

  return { data: {
    goBack,
    mode,
    setMode,
    langFilter,
    setLangFilter,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchCount,
    executeSearch,
    loadMoreSearch,
    selectedBook,
    setSelectedBook,
    loadSelectedBook,
    browseWords,
    browseLoading,
    browseCount,
    loadMoreBrowse,
    favorites,
    favLoading,
    selectedWord,
    setSelectedWord,
    toggleFavorite,
    isFavorited,
  }, actions: {
    setLangFilter, setSearchQuery, executeSearch, loadMoreSearch,
    setSelectedBook, loadSelectedBook, loadMoreBrowse, setSelectedWord, toggleFavorite,
  } };
}
