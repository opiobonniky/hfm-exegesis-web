import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";

export interface Highlight {
  id?: number;
  verseKey: string;
  color: string;
  colorId: number;
  note?: string;
}

export interface VerseItem {
  verseNum: string;
  text: string;
}

export interface ActionModalState {
  status: boolean;
  title: string;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const HIGHLIGHT_COLORS = [
  { id: 1, name: "Red", color: "#F87171" },
  { id: 3, name: "Yellow", color: "#FACC15" },
  { id: 4, name: "Orange", color: "#F97316" },
  { id: 13, name: "Pink", color: "#EC4899" },
  { id: 14, name: "Rose", color: "#FB7185" },
  { id: 15, name: "Amber", color: "#F59E0B" },
  { id: 2, name: "Blue", color: "#3B82F6" },
  { id: 7, name: "Cyan", color: "#06B6D4" },
  { id: 8, name: "Teal", color: "#0D9488" },
  { id: 9, name: "Sky", color: "#38BDF8" },
  { id: 10, name: "Indigo", color: "#6366F1" },
  { id: 5, name: "Green", color: "#22C55E" },
  { id: 6, name: "Purple", color: "#A855F7" },
  { id: 11, name: "Lime", color: "#84CC16" },
  { id: 12, name: "Mint", color: "#2DD4BF" },
];

export function useBible() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialBook = searchParams.get("book") || "Genesis";
  const initialChapter = parseInt(searchParams.get("chapter") || "1", 10);
  const initialVersion = searchParams.get("version") || "kjv";

  const [currentBook, setCurrentBook] = useState(initialBook);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [versionId, setVersionId] = useState(initialVersion);
  const [verses, setVerses] = useState<Record<number, string>>({});
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [verseExplanation, setVerseExplanation] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const [modal, setModal] = useState<ActionModalState>({
    status: false,
    title: "",
    message: "",
    severity: "info",
  });

  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

  const contentRef = useRef<HTMLDivElement>(null);

  const guard = (message: string, callback: () => void) => {
    if (!isAuthenticated) {
      setModal({
        status: true,
        title: "Sign In Required",
        message,
        severity: "warning",
      });
      return;
    }
    callback();
  };
  const flatListRef = useRef<HTMLDivElement>(null);

  const versesArray = useMemo(
    (): VerseItem[] =>
      Object.entries(verses).map(([verseNum, text]) => ({ verseNum, text })),
    [verses]
  );

  const maxChapters: Record<string, number> = useMemo(
    () => ({
      Genesis: 50,
      Exodus: 40,
      Leviticus: 27,
      Numbers: 36,
      Deuteronomy: 34,
      Joshua: 24,
      Judges: 21,
      Ruth: 4,
      "1 Samuel": 31,
      "2 Samuel": 24,
      "1 Kings": 22,
      "2 Kings": 25,
      "1 Chronicles": 29,
      "2 Chronicles": 36,
      Ezra: 10,
      Nehemiah: 13,
      Esther: 10,
      Job: 42,
      Psalms: 150,
      Proverbs: 31,
      Ecclesiastes: 12,
      "Song of Solomon": 8,
      Isaiah: 66,
      Jeremiah: 52,
      Lamentations: 5,
      Ezekiel: 48,
      Daniel: 12,
      Hosea: 14,
      Joel: 3,
      Amos: 9,
      Obadiah: 1,
      Jonah: 4,
      Micah: 7,
      Nahum: 3,
      Habakkuk: 3,
      Zephaniah: 3,
      Haggai: 2,
      Zechariah: 14,
      Malachi: 4,
      Matthew: 28,
      Mark: 16,
      Luke: 24,
      John: 21,
      Acts: 28,
      Romans: 16,
      "1 Corinthians": 16,
      "2 Corinthians": 13,
      Galatians: 6,
      Ephesians: 6,
      Philippians: 4,
      Colossians: 4,
      "1 Thessalonians": 5,
      "2 Thessalonians": 3,
      "1 Timothy": 6,
      "2 Timothy": 4,
      Titus: 3,
      Philemon: 1,
      Hebrews: 13,
      James: 5,
      "1 Peter": 5,
      "2 Peter": 3,
      "1 John": 5,
      "2 John": 1,
      "3 John": 1,
      Jude: 1,
      Revelation: 22,
    }),
    []
  );

  const maxChapter = maxChapters[currentBook] || 1;
  const VERSION_FILES: Record<string, () => Promise<{ default: Record<string, string> }>> = {
    kjv: () => import("@/assets/bibleVersion/json/verses-kjv.json"),
    bsb: () => import("@/assets/bibleVersion/json/verses-bsb.json"),
    web: () => import("@/assets/bibleVersion/json/verses-web.json"),
    asv: () => import("@/assets/bibleVersion/json/verses-asv.json"),
    ylt: () => import("@/assets/bibleVersion/json/verses-ylt.json"),
    darby: () => import("@/assets/bibleVersion/json/verses-darby.json"),
    webster: () => import("@/assets/bibleVersion/json/verses-webster.json"),
    bbe: () => import("@/assets/bibleVersion/json/verses-bbe.json"),
  };

  const updateUrlParams = useCallback(() => {
    setSearchParams({
      book: currentBook,
      chapter: currentChapter.toString(),
      version: versionId,
    });
  }, [currentBook, currentChapter, versionId, setSearchParams]);

  useEffect(() => {
    updateUrlParams();
  }, [currentBook, currentChapter, versionId]);

  const loadChapter = useCallback(async () => {
    setLoading(true);
    setVerses({});
    setSelectedVerses([]);

    try {
      const module = await VERSION_FILES[versionId]();
      const allVerses = module.default;
      const chapterVerses: Record<number, string> = {};

      Object.entries(allVerses)
        .filter(([key]) => key.startsWith(`${currentBook} ${currentChapter}:`))
        .forEach(([key, text]) => {
          const verseNum = parseInt(key.split(":")[1], 10);
          chapterVerses[verseNum] = text;
        });

      setVerses(chapterVerses);
      await Promise.all([loadHighlights(), loadFavorites()]);
    } catch (error) {
      console.error("Failed to load chapter:", error);
    } finally {
      setLoading(false);
    }
  }, [currentBook, currentChapter, versionId]);

  useEffect(() => {
    loadChapter();
  }, [currentBook, currentChapter, versionId]);

  const loadHighlights = async () => {
    try {
      const res = await sendPostRequest("bible", "get-highlights", {
        bookName: currentBook,
        chapter: currentChapter,
      });
      if (res.returnCode === 200 && res.returnData) {
        const map: Record<string, Highlight> = {};
        res.returnData.forEach((h: any) => {
          const key = `${h.bookName} ${h.chapter}:${h.verseNumber}`;
          const col = HIGHLIGHT_COLORS.find((c) => c.id === h.colorId);
          if (col)
            map[key] = {
              id: h.id,
              verseKey: key,
              color: col.color,
              colorId: h.colorId,
              note: h.note,
            };
        });
        setHighlights(map);
      }
    } catch (e) {
      console.error("Error loading highlights:", e);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await sendPostRequest("bible", "get-favorites", {});
      if (res.returnCode === 200 && res.returnData) {
        setFavorites(
          new Set(
            res.returnData.map(
              (i: any) => `${i.bookName} ${i.chapter}:${i.verseNumber}`
            )
          )
        );
      }
    } catch (e) {
      console.error("Error loading favorites:", e);
    }
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses((prev) =>
      prev.includes(verseNum)
        ? prev.filter((v) => v !== verseNum)
        : [...prev, verseNum]
    );
    addReadHistory(verseNum);
  };

  const clearSelection = () => setSelectedVerses([]);

  const addReadHistory = async (verseNumber = 1) => {
    try {
      await sendPostRequest("bible", "add-read-history", {
        bookName: currentBook,
        chapter: currentChapter,
        verseNumber,
      });
    } catch (e) {
      console.error("Error adding read history:", e);
    }
  };

  const getVerseExplanation = async () => {
    if (selectedVerses.length > 1) return;
    try {
      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: currentBook,
        chapter: currentChapter,
        verseNumber: selectedVerses[0],
      });
      if (res?.returnCode === 200) {
        if (!res.returnData?.explanation) {
          setModal({
            status: true,
            title: "No Explanation",
            message: "No explanation found for this verse.",
            severity: "info",
          });
          return;
        }
        setVerseExplanation(res.returnData.explanation as string);
        setShowExplanation(true);
      }
    } catch (e: any) {
      setModal({
        status: true,
        title: "Error",
        message: e.message || "Failed to load verse explanation",
        severity: "error",
      });
    }
  };

  const addFavorite = async () => {
    if (!isAuthenticated) {
      setModal({
        status: true,
        title: "Sign In Required",
        message: "Sign in to save favorites to your account.",
        severity: "warning",
      });
      return;
    }
    try {
      const res = await sendPostRequest("bible", "add-favorite", {
        bookName: currentBook,
        chapter: currentChapter,
        verseNumbers: selectedVerses,
      });
      if (res.returnCode === 200) {
        loadFavorites();
        setModal({
          status: true,
          title: "Added to Favorites",
          message: res.returnMessage || "Verse(s) added to favorites",
          severity: "success",
        });
      }
    } catch (e: any) {
      setModal({
        status: true,
        title: "Error",
        message: e.message || "Failed to add to favorites",
        severity: "error",
      });
    } finally {
      clearSelection();
    }
  };

  const highlightVerses = async (colorId: number, color: string) => {
    try {
      for (const verseNum of selectedVerses) {
        const res = await sendPostRequest("bible", "add-highlight", {
          bookName: currentBook,
          chapter: currentChapter,
          verseNumber: verseNum,
          colorId,
          note: "",
        });
        if (res.returnCode === 200) {
          const key = `${currentBook} ${currentChapter}:${verseNum}`;
          setHighlights((prev) => ({
            ...prev,
            [key]: { verseKey: key, color, colorId },
          }));
        }
      }
      setSelectedVerses([]);
      setShowHighlightPicker(false);
      await loadHighlights();
    } catch (e: any) {
      setModal({
        status: true,
        title: "Error",
        message: e.message || "Failed to highlight verses",
        severity: "error",
      });
    }
  };

  const removeHighlight = async (verseNum: number) => {
    const key = `${currentBook} ${currentChapter}:${verseNum}`;
    const h = highlights[key];
    if (!h || !h.id) {
      setHighlights((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
      return;
    }
    try {
      const res = await sendPostRequest("bible", "delete-highlight", {
        highlightId: h.id,
      });
      if (res.returnCode === 200) {
        setHighlights((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }
    } catch (e: any) {
      setModal({
        status: true,
        title: "Error",
        message: e.message || "Failed to remove highlight",
        severity: "error",
      });
    }
  };

  const shareVerses = async () => {
    const text = selectedVerses
      .sort((a, b) => a - b)
      .map((v) => `${currentBook} ${currentChapter}:${v}\n${verses[v]}`)
      .join("\n\n");
    try {
      await navigator.share({ text });
    } catch (e) {
      console.error(e);
    } finally {
      clearSelection();
    }
  };

  const copyVerses = () => {
    const text = selectedVerses
      .sort((a, b) => a - b)
      .map((v) => `${currentBook} ${currentChapter}:${v}\n${verses[v]}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    clearSelection();
  };

  const goToChapter = (direction: "prev" | "next") => {
    if (direction === "prev" && currentChapter > 1) {
      setCurrentChapter((prev) => Math.max(1, prev - 1));
    } else if (direction === "next" && currentChapter < maxChapter) {
      setCurrentChapter((prev) => Math.min(maxChapter, prev + 1));
    }
  };

  const handleVersionChange = async (newVersionId: string) => {
    if (newVersionId === versionId) return;
    setLoading(true);
    setVersionId(newVersionId);
  };

  const goToVerse = (book: string, chapterNum: number, verse?: number) => {
    setLoading(true);
    setVerses({});
    setSelectedVerses([]);
    setCurrentBook(book);
    setCurrentChapter(chapterNum);
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const closeSearch = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (query.trim().length > 2) {
      setSearchLoading(true);
      searchDebounceRef.current = setTimeout(async () => {
        try {
          const results: any[] = [];
          const module = await VERSION_FILES[versionId]();
          const allVerses = module.default;
          const searchTerm = query.toLowerCase();

          Object.entries(allVerses)
            .filter(([, text]) => text.toLowerCase().includes(searchTerm))
            .slice(0, 50)
            .forEach(([key, text]) => {
              const match = key.match(/^(.+?)\s+(\d+):(\d+)$/);
              if (match) {
                results.push({
                  book: match[1],
                  chapter: parseInt(match[2], 10),
                  verse: parseInt(match[3], 10),
                  text: text.substring(0, 100) + "...",
                });
              }
            });

          setSearchResults(results);
        } catch (e) {
          console.error("Search error:", e);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  const openNoteModal = () => {
    if (selectedVerses.length === 0) {
      setModal({
        status: true,
        title: "Select Verse",
        message: "Please select at least one verse to add a note.",
        severity: "warning",
      });
      return;
    }
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNoteText("");
  };

  const saveNote = async () => {
    if (!noteText.trim()) {
      setModal({
        status: true,
        title: "Empty Note",
        message: "Please enter some text for your note.",
        severity: "warning",
      });
      return;
    }
    try {
      setNoteSaving(true);
      const res = await sendPostRequest("bible", "add-verse-note", {
        bookName: currentBook,
        chapter: currentChapter,
        verseNumbers: selectedVerses,
        note: noteText.trim(),
      });
      if (res.returnCode !== 200) {
        setModal({
          status: true,
          title: "Error",
          message: res.returnMessage || "Failed to add note",
          severity: "error",
        });
        return;
      }
      setModal({
        status: true,
        title: "Note Added",
        message: res.returnMessage || "Note added successfully",
        severity: "success",
      });
      closeNoteModal();
    } catch (e) {
      setModal({
        status: true,
        title: "Error",
        message: "Failed to save note",
        severity: "error",
      });
    } finally {
      setNoteSaving(false);
    }
  };

  const selectBookFromModal = (book: string) => {
    setLoading(true);
    setVerses({});
    setSelectedVerses([]);
    setCurrentBook(book);
    setCurrentChapter(1);
    setShowBookSelector(false);
  };

  const selectChapterFromModal = (ch: number) => {
    setLoading(true);
    setVerses({});
    setSelectedVerses([]);
    setCurrentChapter(ch);
    setShowChapterSelector(false);
  };

  const dismissModal = () => setModal({ ...modal, status: false });

  return {
    currentBook,
    setCurrentBook,
    currentChapter,
    setCurrentChapter,
    versionId,
    setVersionId: handleVersionChange,
    verses,
    versesArray,
    highlights,
    favorites,
    selectedVerses,
    loading,
    fontSize,
    setFontSize,
    maxChapter,
    maxChapters,

    showBookSelector,
    setShowBookSelector,
    showChapterSelector,
    setShowChapterSelector,
    showSearchModal,
    setShowSearchModal,
    showHighlightPicker,
    setShowHighlightPicker,
    showDrawer,
    setShowDrawer,
    showExplanation,
    setShowExplanation,
    showNoteModal,

    searchQuery,
    setSearchQuery: handleSearch,
    searchResults,
    searchLoading,

    verseExplanation,

    noteText,
    setNoteText,
    noteSaving,
    openNoteModal,
    closeNoteModal,
    saveNote,

    modal,
    dismissModal,
    guard,
    isAuthenticated,

    toggleVerseSelection,
    clearSelection,
    addReadHistory,
    addFavorite,
    highlightVerses,
    removeHighlight,
    shareVerses,
    copyVerses,
    goToChapter,
    getVerseExplanation,

    goToVerse,
    closeSearch,

    selectBookFromModal,
    selectChapterFromModal,

    loadHighlights,
    loadFavorites,

    flatListRef,
    contentRef,
  };
}