import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getRequestLanguage, sendPostRequest } from "@/services/api";
import { browseBookWords, searchStrongs, toStrongsWord } from "../services/strongsDictionaryService";
import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from "@/components/languages/languageProvider";

export interface ContextualStudy {
  surfaceText: string | null;
  surfaceTextGloss?: string | null;
  surfaceTextOriginal?: string | null;
  customDefinition: string | null;
  sortOrder: number;
  reference: {
    bookName: string;
    chapter: number;
    verseNumber: number | null;
    verseEnd?: number;
    bibleVersion: string | null;
  } | null;
  themes: string[];
}

export interface StrongsWord {
  strongsNumber: string;
  hasDictionaryEntry?: boolean;
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
  contextualStudyCount?: number;
  nextStudyOffset?: number | null;
  contentLanguage?: string;
  browseBook?: string;
}

const SEARCH_PAGE_SIZE = 2;

export function useStrongsDictionaryPage() {
  const { toast } = useToast();
  // Subscribe to UI-pack changes so the backend prose language is recomputed
  // when an offline pack takes over (until then Google owns English source).
  useLanguage();
  const lang = getRequestLanguage();
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
  const [browseFailed, setBrowseFailed] = useState(false);
  const [browseCount, setBrowseCount] = useState(0);
  const [browseOffset, setBrowseOffset] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<StrongsWord[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StrongsWord | null>(null);
  const searchRequestRef = useRef(0);
  const searchPageRef = useRef(0);
  const searchFilterRef = useRef("all");
  const submittedQueryRef = useRef("");
  const completedSearchKeyRef = useRef("");
  const browseRequestRef = useRef(0);
  const browseBusyRef = useRef(false);
  const browseAbortRef = useRef<AbortController | null>(null);

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
      const searchKey = `${query.toLowerCase()}|${language}|${lang}|${page}`;
      if (reset && completedSearchKeyRef.current === searchKey) return;
      const requestId = ++searchRequestRef.current;
      setSearchLoading(true);
      try {
        const res = await searchStrongs({
          query,
          language: language || undefined,
          lang,
          limit: SEARCH_PAGE_SIZE,
          offset: page * SEARCH_PAGE_SIZE,
        });
        if (requestId !== searchRequestRef.current) return;
        if (res.returnCode === 200) {
          const data = res.returnData;
          const words = (data?.data || []).map(word => toStrongsWord(word, lang));
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
            title: tt("Error"),
            description: tt("Search failed"),
            variant: "destructive",
          });
        }
      } finally {
        if (requestId === searchRequestRef.current) setSearchLoading(false);
      }
    },
    [lang, toast],
  );

  const browseByBook = useCallback(
    async (reset = true, bookOverride?: string) => {
      const book = bookOverride || selectedBook;
      if (!book || (!reset && (browseBusyRef.current || browseOffset == null))) return;
      browseAbortRef.current?.abort();
      const controller = new AbortController();
      browseAbortRef.current = controller;
      const requestId = ++browseRequestRef.current;
      browseBusyRef.current = true;
      const offset = reset ? 0 : browseOffset!;
      setBrowseLoading(true);
      setBrowseFailed(false);
      if (reset) {
        setBrowseWords([]);
        setBrowseCount(0);
        setBrowseOffset(null);
      }
      try {
        const data = await browseBookWords(book, langFilter, lang, offset, controller.signal);
        if (requestId !== browseRequestRef.current) return;
        const words = data.data.map(word => toStrongsWord(word, lang, book));
        setBrowseWords(previous => reset ? words : [...previous, ...words]);
        setBrowseCount(data.total);
        setBrowseOffset(data.hasNext && words.length ? data.nextOffset ?? offset + words.length : null);
      } catch {
        if (requestId !== browseRequestRef.current || controller.signal.aborted) return;
        setBrowseFailed(true);
      } finally {
        if (requestId === browseRequestRef.current) {
          browseBusyRef.current = false;
          setBrowseLoading(false);
        }
      }
    },
    [selectedBook, langFilter, lang, browseOffset],
  );

  const loadSelectedBook = useCallback(
    (book: string) => browseByBook(true, book),
    [browseByBook],
  );

  const refreshBrowse = useRef<() => void>(() => {});
  refreshBrowse.current = () => { if (mode === 'browse' && selectedBook) void browseByBook(true); };
  useEffect(() => { refreshBrowse.current(); }, [mode, langFilter, lang]);
  const refreshSearch = useRef(executeSearch);
  refreshSearch.current = executeSearch;
  useEffect(() => {
    setSelectedWord(null);
    setSearchResults([]);
    setSearchCount(0);
    if (mode === "search" && submittedQueryRef.current) {
      completedSearchKeyRef.current = "";
      void refreshSearch.current();
    } else {
      ++searchRequestRef.current;
      setSearchLoading(false);
    }
  }, [mode, langFilter, lang]);
  useEffect(() => {
    const refresh = () => refreshBrowse.current();
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('focus', refresh); ++browseRequestRef.current; browseAbortRef.current?.abort(); };
  }, []);

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
  const retryBrowse = () => {
    browseByBook(browseOffset == null);
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
    searchResults: searchResults.filter(word => word.contentLanguage === lang),
    searchLoading,
    searchCount,
    executeSearch,
    loadMoreSearch,
    selectedBook,
    setSelectedBook,
    loadSelectedBook,
    browseWords: browseWords.filter(word => word.contentLanguage === lang && word.browseBook === selectedBook),
    browseLoading,
    browseFailed,
    browseCount,
    loadMoreBrowse,
    retryBrowse,
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

export type StrongsDictionaryPageModel = ReturnType<typeof useStrongsDictionaryPage>;

/**
 * Flattened view model consumed by the presentation components: the page spreads
 * `data` and `actions` into a single object before passing it down.
 */
export type StrongsDictionaryPageData = StrongsDictionaryPageModel["data"];
