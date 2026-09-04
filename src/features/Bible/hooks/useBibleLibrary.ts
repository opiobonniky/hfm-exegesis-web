// useBibleLibrary — all state, effects, and logic for BibleLibrary page
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { bibleApi, mapTranslationId } from "@/services/bibleApi";
import { API_BASE_URL } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { BIBLE_BOOKS } from "../constants";

import type { LibraryBookInfo, CovenantFilter } from "../types";

// Local 66-book fallback so the Library never renders empty if the backend is
// unreachable / misconfigured (e.g. wrong base URL pointing at production).
const LOCAL_BOOKS: LibraryBookInfo[] = BIBLE_BOOKS.map((entry) => ({
  bookNumber: entry.bookNumber,
  bookName: entry.bookName,
  testament: entry.bookNumber <= 39 ? "Old" : "New",
  chaptersCount: entry.maxChapter,
  totalVerses: 0,
}));
const OT_ORDER = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"];
const NT_ORDER = ["Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
export function useBibleLibrary() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const searchRef = useRef<HTMLInputElement>(null);
  const [books, setBooks] = useState<LibraryBookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [covenant, setCovenant] = useState<CovenantFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const data = await bibleApi.getBooksWithMaxChapters(mapTranslationId("Berean"));
        setBooks(data.sort((a, b) => {
          const ai = OT_ORDER.indexOf(a.bookName), bi = OT_ORDER.indexOf(b.bookName);
          if (ai !== -1 && bi !== -1) return ai - bi;
          const ani = NT_ORDER.indexOf(a.bookName), bni = NT_ORDER.indexOf(b.bookName);
          if (ani !== -1 && bni !== -1) return ani - bni;
          return ai !== -1 ? -1 : bni !== -1 ? 1 : a.bookName.localeCompare(b.bookName);
        }));
        setLoadError(null);
      } catch (e) {
        console.error(e);
        // Backend unreachable — fall back to the canonical 66-book list so the
        // Library stays usable and the OT/NT tabs still work.
        setBooks(LOCAL_BOOKS);
        setLoadError(
          `Unable to reach the Bible server. Showing the standard 66-book list (${API_BASE_URL}).`,
        );
      } finally { setLoading(false); }
    })();
  }, []);
  const filteredBooks = useMemo(() => {
    let f = books;
    if (covenant === "ot") f = f.filter((b) => b.testament === "Old");
    else if (covenant === "nt") f = f.filter((b) => b.testament === "New");
    if (searchQuery.trim()) f = f.filter((b) => b.bookName.toLowerCase().includes(searchQuery.toLowerCase()));
    return f;
  }, [books, covenant, searchQuery]);
  const stats = useMemo(() => ({
    ot: books.filter((b) => b.testament === "Old").length,
    nt: books.filter((b) => b.testament === "New").length,
    chapters: books.reduce((s, b) => s + b.chaptersCount, 0),
    verses: books.reduce((s, b) => s + (b.totalVerses || 0), 0),
  }), [books]);
  const tabs = useMemo(() => [
    { value: "all" as CovenantFilter, label: "All Books", count: books.length },
    { value: "ot" as CovenantFilter, label: "Old Testament", count: stats.ot },
    { value: "nt" as CovenantFilter, label: "New Testament", count: stats.nt },
  ], [books.length, stats]);
  const goToChapter = useCallback((book: string, ch: number) => {
    navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(book)}&chapter=${ch}`);
  }, [navigate]);
  const goToBookOverview = useCallback((book: string) => {
    navigate(`/book-overview?book=${encodeURIComponent(book)}`);
  }, [navigate]);
  const clearSearch = useCallback(() => { setSearchQuery(""); searchRef.current?.focus(); }, []);
  const selectCovenant = useCallback((v: CovenantFilter) => { setCovenant(v); setExpandedBook(null); }, []);
  const toggleExpand = useCallback((name: string) => setExpandedBook((prev) => prev === name ? null : name), []);
  return {
    isRtl, searchRef,
    books, filteredBooks, loading, stats, tabs,
    loadError, apiBaseUrl: API_BASE_URL,
    covenant, selectCovenant,
    searchQuery, setSearchQuery, clearSearch,
    expandedBook, toggleExpand, goToChapter, goToBookOverview,
  };
}
