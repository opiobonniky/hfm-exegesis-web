import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BookText,
  Search,
  Loader2,
  BookOpen,
  Languages,
  Hash,
  ChevronRight,
  Info,
  ArrowLeft,
  LibraryBig,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import WordDetailSheet from "@/components/WordDetailSheet";
import { sendGetRequest, sendPostRequest } from "@/services/api";
import { cn } from "@/lib/utils";
import TierBadge from "@/components/TierBadge";
import Gate from "@/components/Gate";
import { BIBLE_BOOKS, getLangColor, getLangLetter } from "@/data/staticData";
import type { StrongsWordEntry } from "@/data/staticData";
import WordCard from "@/components/WordCard";

// ── Types ──

type WordEntry = StrongsWordEntry;

type Mode = "search" | "browse" | "verse";
type ChartMode = "frequency" | "partOfSpeech";

// ── Component ──

export default function LabDictionary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode toggle
  const [mode, setMode] = useState<Mode>("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultTotal, setResultTotal] = useState(0);

  // Browse by Book state
  const [selectedBook, setSelectedBook] = useState("");
  const [browseWords, setBrowseWords] = useState<WordEntry[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseLoaded, setBrowseLoaded] = useState(false);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browsePage, setBrowsePage] = useState(0);
  const [browseHasNext, setBrowseHasNext] = useState(false);
  const BROWSE_PAGE_SIZE = 100;
  const browseLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Verse mode state (from URL params or manual entry)
  const [verseBook, setVerseBook] = useState("");
  const [verseChapter, setVerseChapter] = useState<number>(0);
  const [verseNum, setVerseNum] = useState<number>(0);
  const [verseWords, setVerseWords] = useState<WordEntry[]>([]);
  const [verseWordsLoading, setVerseWordsLoading] = useState(false);
  const [verseWordsLoaded, setVerseWordsLoaded] = useState(false);
  const [verseWordsTotal, setVerseWordsTotal] = useState(0);

  // Chart mode & language filter
  const [chartMode, setChartMode] = useState<ChartMode>("frequency");
  const [langFilter, setLangFilter] = useState("all");

  // Word detail dialog
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Search ──

  const executeSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await sendGetRequest("strongs", "search", {
        q: query.trim(),
        limit: 50,
        offset: 0,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        setResults(rd.data || []);
        setResultTotal(rd.total ?? rd.data?.length ?? 0);
      } else {
        setResults([]);
        setResultTotal(0);
      }
    } catch {
      setResults([]);
      setResultTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    executeSearch(searchQuery);
  }, [executeSearch, searchQuery]);

  // Trigger search on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ── Browse by Book ──

  const loadBookWords = useCallback(async (book: string, page = 0, append = false) => {
    if (!book) return;
    setBrowseLoading(true);
    if (!append) setBrowseLoaded(false);
    try {
      const res = await sendGetRequest("strongs", `book-words/${encodeURIComponent(book)}`, {
        limit: BROWSE_PAGE_SIZE,
        offset: page * BROWSE_PAGE_SIZE,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        const newData = rd.data || [];
        setBrowseWords((prev) => (append ? [...prev, ...newData] : newData));
        setBrowseTotal(rd.total ?? newData.length);
        setBrowseHasNext(!!rd.hasNext);
        setBrowsePage(page);
      } else {
        if (!append) {
          setBrowseWords([]);
          setBrowseTotal(0);
        }
        setBrowseHasNext(false);
      }
    } catch {
      if (!append) {
        setBrowseWords([]);
        setBrowseTotal(0);
      }
      setBrowseHasNext(false);
    } finally {
      setBrowseLoading(false);
      setBrowseLoaded(true);
    }
  }, []);

  // ── Verse mode ──

  const loadVerseWords = useCallback(async (book: string, chapter: number, verse: number) => {
    if (!book || !chapter || !verse) return;
    setVerseWordsLoading(true);
    setVerseWordsLoaded(false);
    try {
      const res = await sendPostRequest("strongs", "verse-unique-words", {
        bookName: book,
        chapter,
        verse,
        translation: "BSB",
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        setVerseWords(rd.data || []);
        setVerseWordsTotal(rd.total ?? rd.data?.length ?? 0);
      } else {
        setVerseWords([]);
        setVerseWordsTotal(0);
      }
    } catch {
      setVerseWords([]);
      setVerseWordsTotal(0);
    } finally {
      setVerseWordsLoading(false);
      setVerseWordsLoaded(true);
    }
  }, []);

  // ── Detect URL params for verse mode on mount ──
  useEffect(() => {
    const book = searchParams.get("book");
    const chapter = searchParams.get("chapter");
    const verse = searchParams.get("verse");
    if (book && chapter && verse) {
      const ch = parseInt(chapter, 10);
      const vs = parseInt(verse, 10);
      if (!isNaN(ch) && !isNaN(vs)) {
        setVerseBook(book);
        setVerseChapter(ch);
        setVerseNum(vs);
        setMode("verse");
        loadVerseWords(book, ch, vs);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setBrowsePage(0);
    setBrowseHasNext(false);
    if (book) {
      // Debounce to prevent race conditions on rapid book changes
      if (browseLoadTimeoutRef.current) {
        clearTimeout(browseLoadTimeoutRef.current);
      }
      browseLoadTimeoutRef.current = setTimeout(() => {
        loadBookWords(book, 0, false);
      }, 300);
    } else {
      setBrowseWords([]);
      setBrowseLoaded(false);
      setBrowseTotal(0);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (browseLoadTimeoutRef.current) {
        clearTimeout(browseLoadTimeoutRef.current);
      }
    };
  }, []);

  // ── Language counts for filter chips ──
  const langCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const w of browseWords) {
      const lang = w.language?.toLowerCase() || "other";
      counts[lang] = (counts[lang] || 0) + 1;
      counts.all++;
    }
    return counts;
  }, [browseWords]);

  // ── Language counts for Search results ──
  const searchLangCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const w of results) {
      const lang = w.language?.toLowerCase() || "other";
      counts[lang] = (counts[lang] || 0) + 1;
      counts.all++;
    }
    return counts;
  }, [results]);

  // ── Chart data: top words by frequency or by part of speech ──
  const chartData = useMemo(() => {
    const filtered =
      langFilter === "all"
        ? [...browseWords]
        : browseWords.filter(
            (w) => w.language?.toLowerCase() === langFilter,
          );

    const validWords = filtered.filter(
      (w) => w.usageCount != null && w.usageCount > 0,
    );

    if (chartMode === "partOfSpeech") {
      // Group valid words by part of speech, take top 5 per group
      const groups: Record<string, typeof validWords> = {};
      for (const w of validWords) {
        const pos = w.partOfSpeech || "other";
        if (!groups[pos]) groups[pos] = [];
        groups[pos].push(w);
      }
      const result: Array<{
        word: string;
        transliteration: string | null;
        definition: string;
        usageCount: number;
        strongsId: string;
        language: string;
        partOfSpeech: string;
      }> = [];
      // Preferred order for display
      const posOrder = [
        "noun", "verb", "adjective", "adverb", "preposition",
        "conjunction", "pronoun", "particle", "article", "other",
      ];
      for (const pos of posOrder) {
        if (!groups[pos]) continue;
        const top = groups[pos]
          .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
          .slice(0, 5)
          .map((w) => ({
            word: w.originalWord || w.transliteration || w.strongsId,
            transliteration: w.transliteration,
            definition: w.shortDefinition,
            usageCount: w.usageCount ?? 0,
            strongsId: w.strongsId,
            language: w.language,
            partOfSpeech: pos,
          }));
        result.push(...top);
      }
      return result;
    }

    // Frequency mode: top 20
    return validWords
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, 20)
      .map((w) => ({
        word: w.originalWord || w.transliteration || w.strongsId,
        transliteration: w.transliteration,
        definition: w.shortDefinition,
        usageCount: w.usageCount ?? 0,
        strongsId: w.strongsId,
        language: w.language,
        partOfSpeech: w.partOfSpeech || "",
      }));
  }, [browseWords, chartMode, langFilter]);

  // ── Word Detail ──

  const openWordDetailById = (strongsId: string) => {
    const word = browseWords.find((w) => w.strongsId === strongsId);
    if (word) openWordDetail(word);
  };

  const openWordDetail = async (word: WordEntry) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await sendGetRequest("strongs", word.strongsId, {});
      if (res.returnCode === 200 && res.returnData) {
        setSelectedWord(res.returnData as WordEntry);
      } else {
        setSelectedWord(word);
      }
    } catch {
      setSelectedWord(word);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Word Frequency Bar Chart ──

  const WordFrequencyChart = ({
    data,
    onWordClick,
    mode,
    onModeChange,
    langFilter: lf,
    onLangFilterChange,
    langCounts: lc,
  }: {
    data: Array<{
      word: string;
      transliteration: string | null;
      definition: string;
      usageCount: number;
      strongsId: string;
      language: string;
      partOfSpeech: string;
    }>;
    onWordClick: (strongsId: string) => void;
    mode: ChartMode;
    onModeChange: (m: ChartMode) => void;
    langFilter: string;
    onLangFilterChange: (l: string) => void;
    langCounts: Record<string, number>;
  }) => {
    if (data.length === 0) return null;

    const maxCount = data.reduce((m, d) => Math.max(m, d.usageCount), 0) || 1;

    // Track which POS sections have been rendered to show headers
    const renderedPos = new Set<string>();

    // Get hex color from CSS variable for a POS
    const getPosColor = (pos: string) => {
      const vars: Record<string, string> = {
        noun: "#3b82f6", verb: "#22c55e", adjective: "#ec4899",
        adverb: "#f97316", preposition: "#06b6d4", conjunction: "#8b5cf6",
        pronoun: "#f43f5e", particle: "#eab308", article: "#94a3b8",
        other: "#a1a1aa",
      };
      return vars[pos?.toLowerCase()] || vars.other;
    };

    return (
      <div className="rounded-xl border border-border/50 bg-card p-4">
        {/* Header + toggle */}
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {mode === "frequency" ? "Most Frequent Words" : "Words by Part of Speech"}
          </p>
          <div className="ml-auto flex items-center gap-0.5 bg-muted/60 rounded-md p-0.5">
            <button
              onClick={() => onModeChange("frequency")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                mode === "frequency"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Frequency
            </button>
            <button
              onClick={() => onModeChange("partOfSpeech")}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                mode === "partOfSpeech"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Part of Speech
            </button>
          </div>
        </div>

        {/* Language filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
            Language:
          </span>
          {[
            { key: "all", label: "All" },
            { key: "greek", label: "Greek" },
            { key: "hebrew", label: "Hebrew" },
            { key: "aramaic", label: "Aramaic" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onLangFilterChange(key)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all",
                lf === key
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {key === "greek" && <span className="text-[9px]">α</span>}
              {key === "hebrew" && <span className="text-[9px]">א</span>}
              {key === "aramaic" && <span className="text-[9px]">𐡀</span>}
              {label}
              <span className="text-[9px] tabular-nums opacity-60">
                ({lc[key] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Legend for POS mode */}
        {mode === "partOfSpeech" && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.from(new Set(data.map((d) => d.partOfSpeech))).filter(Boolean).map((pos) => (
              <span key={pos} className="inline-flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: getPosColor(pos) }}
                />
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-0.5">
          {data.map((item, idx) => {
            const pct = (item.usageCount / maxCount) * 100;
            const isNewPos =
              mode === "partOfSpeech" &&
              item.partOfSpeech &&
              !renderedPos.has(item.partOfSpeech);
            if (isNewPos) renderedPos.add(item.partOfSpeech);
            const barColor = mode === "partOfSpeech" ? getPosColor(item.partOfSpeech) : undefined;

            return (
              <div key={item.strongsId}>
                {/* POS group header */}
                {isNewPos && (
                  <div className="flex items-center gap-1.5 pt-3 pb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: getPosColor(item.partOfSpeech) }}
                    />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {item.partOfSpeech === "other" ? "Other" : `${item.partOfSpeech.charAt(0).toUpperCase() + item.partOfSpeech.slice(1)}s`}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onWordClick(item.strongsId)}
                  className="w-full group flex items-center gap-3 py-1 px-1 rounded-md hover:bg-muted/40 transition-all active:scale-[0.99] text-left"
                >
                  {/* Rank (frequency mode only) */}
                  {mode === "frequency" && (
                    <span className="w-5 text-[10px] font-bold text-muted-foreground/40 tabular-nums text-right shrink-0">
                      {idx + 1}
                    </span>
                  )}

                  {/* POS badge (POS mode) */}
                  {mode === "partOfSpeech" && (
                    <span className="w-5 text-[9px] font-bold text-muted-foreground/30 tabular-nums text-right shrink-0">
                      {(() => {
                        const posItems = data.filter((d) => d.partOfSpeech === item.partOfSpeech);
                        return posItems.indexOf(item) + 1;
                      })()}
                    </span>
                  )}

                  {/* Bar + label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.word}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums ml-2 shrink-0">
                        {item.usageCount}×
                      </span>
                    </div>
                    <div className="relative h-4 w-full rounded-sm bg-muted/50 overflow-hidden">
                      {/* Back bar (lighter) */}
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-sm transition-all",
                          !barColor && "bg-primary/20 group-hover:bg-primary/30",
                        )}
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: barColor ? `${barColor}33` : undefined,
                        }}
                      />
                      {/* Front bar (darker) */}
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-sm transition-all",
                          !barColor && "bg-primary opacity-60 group-hover:opacity-80",
                        )}
                        style={{
                          width: `${Math.max(pct * 0.6, 1.5)}%`,
                          backgroundColor: barColor || undefined,
                          opacity: barColor ? 0.7 : undefined,
                        }}
                      />
                    </div>
                  </div>

                  {/* Definition tooltip on hover */}
                  <span className="hidden sm:block text-[10px] text-muted-foreground/60 truncate max-w-[120px] group-hover:text-muted-foreground/90 transition-colors">
                    {item.definition}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground/40 mt-2 text-center">
          {mode === "frequency"
            ? `Top ${data.length} words by occurrence count · Click a bar to study`
            : `${data.length} words shown across ${new Set(data.map((d) => d.partOfSpeech)).size} parts of speech · Click a bar to study`}
        </p>
      </div>
    );
  };

  // ── Word Result Item (shared) ──

  const WordResultItem = ({ word }: { word: WordEntry }) => (
    <WordCard
      word={word}
      onClick={() => openWordDetail(word)}
      showGrammarCase={false}
      showFullDefinition={false}
    />
  );

  // ── Render ──

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1
                className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Dictionary
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Original Language Word Study
              </p>
            </div>
          </div>
          <TierBadge />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-16">
          <Gate
            featureName="Dictionary"
            featureDescription="The full word study dictionary with original language analysis is available for Legacy Sower and Covenant Sower subscribers."
          >
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 mb-6 bg-muted/50 rounded-lg p-1 max-w-sm mx-auto">
              <button
                onClick={() => setMode("search")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  mode === "search"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
              <button
                onClick={() => setMode("browse")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  mode === "browse"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LibraryBig className="w-3.5 h-3.5" />
                Browse by Book
              </button>
              <button
                onClick={() => setMode("verse")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  mode === "verse"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <BookText className="w-3.5 h-3.5" />
                By Verse
              </button>
            </div>

            {mode === "search" ? (
              /* ══════ SEARCH MODE ══════ */
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2 pb-1">
                  <h2 className="text-lg font-black text-foreground text-center">
                    Study the Original Words
                  </h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
                    Search for Greek and Hebrew words to see their meaning,
                    usage, and grammar explained in plain English.
                  </p>
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by word, transliteration, or meaning..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 pr-4 h-11 text-sm rounded-xl border-border/60"
                  />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    disabled={loading || searchQuery.trim().length < 2}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 text-xs gap-1"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                    Search
                  </Button>
                </div>

                {/* Quick tips */}
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="font-semibold">Try:</span>
                  {["love", "faith", "grace", "word", "light", "logos", "agape"].map(
                    (hint) => (
                      <button
                        key={hint}
                        onClick={() => {
                          setSearchQuery(hint);
                          executeSearch(hint);
                        }}
                        className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {hint}
                      </button>
                    ),
                  )}
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Empty results */}
                {!loading && searched && results.length === 0 && (
                  <div className="flex flex-col items-center py-16 text-center">
                    <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No words found
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                      Try a different search term, or switch to{" "}
                      <button
                        onClick={() => setMode("browse")}
                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        Browse by Book
                      </button>
                    </p>
                  </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {resultTotal} word{resultTotal !== 1 ? "s" : ""} found
                    </p>

                    {/* Language distribution stats bar */}
                    <div className="flex items-center gap-2 flex-wrap rounded-lg bg-muted/20 border border-border/40 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Language Breakdown
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {(() => {
                          const greekCount = searchLangCounts["greek"] || 0;
                          const hebrewCount = searchLangCounts["hebrew"] || 0;
                          const aramaicCount = searchLangCounts["aramaic"] || 0;
                          return (
                            <>
                              {greekCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{greekCount}</span>
                                  <span className="text-muted-foreground/60">Greek</span>
                                </span>
                              )}
                              {hebrewCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{hebrewCount}</span>
                                  <span className="text-muted-foreground/60">Hebrew</span>
                                </span>
                              )}
                              {aramaicCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#e11d48" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{aramaicCount}</span>
                                  <span className="text-muted-foreground/60">Aramaic</span>
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <ScrollArea className="max-h-[55vh] pr-1">
                      <div className="space-y-1.5">
                        {results.map((word) => (
                          <WordResultItem key={word.strongsId} word={word} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Initial empty */}
                {!loading && !searched && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Search className="w-14 h-14 text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Enter a word above to discover its original Greek or Hebrew
                      meaning, usage across Scripture, and grammatical details.
                    </p>
                  </div>
                )}
              </div>
            ) : mode === "verse" ? (
              /* ══════ VERSE MODE ══════ */
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2 pb-1">
                  <h2 className="text-lg font-black text-foreground text-center">
                    Words in This Verse
                  </h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
                    Explore every original language word used in a specific
                    verse, with definitions and grammar.
                  </p>
                </div>

                {/* Verse selector */}
                <div className="flex flex-wrap items-end gap-2 justify-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Book</label>
                    <Select value={verseBook} onValueChange={(v) => { setVerseBook(v); }}>
                      <SelectTrigger className="h-10 text-sm w-32 rounded-xl border-border/60">
                        <SelectValue placeholder="Book" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {BIBLE_BOOKS.map((book) => (
                          <SelectItem key={book} value={book}>{book}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapter</label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Ch."
                      value={verseChapter || ""}
                      onChange={(e) => setVerseChapter(parseInt(e.target.value) || 0)}
                      className="h-10 text-sm w-20 rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verse</label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="V."
                      value={verseNum || ""}
                      onChange={(e) => setVerseNum(parseInt(e.target.value) || 0)}
                      className="h-10 text-sm w-20 rounded-xl border-border/60"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (verseBook && verseChapter && verseNum) {
                        loadVerseWords(verseBook, verseChapter, verseNum);
                      }
                    }}
                    disabled={verseWordsLoading || !verseBook || !verseChapter || !verseNum}
                    className="h-10 mt-4 gap-1"
                  >
                    {verseWordsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    Load Words
                  </Button>
                </div>

                {/* Verse reference badge */}
                {verseWordsLoaded && verseBook && verseChapter && verseNum && (
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-sm font-bold px-3 py-1.5 bg-primary/10 border-primary/30 text-primary"
                    >
                      <BookText className="w-3.5 h-3.5 mr-1.5" />
                      {verseBook} {verseChapter}:{verseNum}
                    </Badge>
                  </div>
                )}

                {/* Loading */}
                {verseWordsLoading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Results */}
                {!verseWordsLoading && verseWordsLoaded && verseWords.length > 0 && (
                  <div className="space-y-3 mt-2">
                    {/* Stats bar */}
                    <div className="flex items-center gap-2 flex-wrap rounded-lg bg-muted/20 border border-border/40 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <BookText className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-foreground">
                          {verseNum > 0
                            ? `${verseBook} ${verseChapter}:${verseNum}`
                            : verseChapter > 0
                              ? `${verseBook} ${verseChapter}`
                              : verseBook} — {verseWordsTotal} unique {verseNum > 0 ? 'verse' : verseChapter > 0 ? 'chapter' : 'book'} word{verseWordsTotal !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {(() => {
                          const greekCount = verseWords.filter(w => w.language?.toLowerCase() === "greek").length;
                          const hebrewCount = verseWords.filter(w => w.language?.toLowerCase() === "hebrew").length;
                          const aramaicCount = verseWords.filter(w => w.language?.toLowerCase() === "aramaic").length;
                          return (
                            <>
                              {greekCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{greekCount}</span>
                                  <span className="text-muted-foreground/60">Greek</span>
                                </span>
                              )}
                              {hebrewCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{hebrewCount}</span>
                                  <span className="text-muted-foreground/60">Hebrew</span>
                                </span>
                              )}
                              {aramaicCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#e11d48" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{aramaicCount}</span>
                                  <span className="text-muted-foreground/60">Aramaic</span>
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <ScrollArea className="max-h-[55vh] pr-1">
                      <div className="space-y-1.5">
                        {verseWords.map((word) => (
                          <WordResultItem key={word.strongsId} word={word} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* No results */}
                {!verseWordsLoading && verseWordsLoaded && verseWords.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No word data for this verse
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                      Select a different verse or check that the BSB translation
                      has original language data for this verse.
                    </p>
                  </div>
                )}

                {/* Initial empty */}
                {!verseWordsLoading && !verseWordsLoaded && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <BookText className="w-14 h-14 text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Enter a book, chapter, and verse above to see all the
                      original language words used in that verse.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* ══════ BROWSE BY BOOK MODE ══════ */
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2 pb-1">
                  <h2 className="text-lg font-black text-foreground text-center">
                    Browse Words by Book
                  </h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
                    Select a book of the Bible to see all the original language
                    words used in it, with definitions and explanations.
                  </p>
                </div>

                {/* Book selector */}
                <div className="max-w-xs mx-auto w-full">
                  <Select value={selectedBook} onValueChange={handleBookChange}>
                    <SelectTrigger className="h-11 text-sm rounded-xl border-border/60">
                      <SelectValue placeholder="Choose a book..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {BIBLE_BOOKS.map((book) => (
                        <SelectItem key={book} value={book} className="text-sm">
                          {book}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Browse loading */}
                {browseLoading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Browse results */}
                {!browseLoading && browseLoaded && browseWords.length > 0 && (
                  <div className="space-y-4 mt-2">
                    {/* Word frequency chart */}
                    {chartData.length > 0 && (
                      <WordFrequencyChart
                        data={chartData as any}
                        onWordClick={openWordDetailById}
                        mode={chartMode}
                        onModeChange={setChartMode}
                        langFilter={langFilter}
                        onLangFilterChange={setLangFilter}
                        langCounts={langCounts}
                      />
                    )}

                    {/* Language distribution stats bar */}
                    <div className="flex items-center gap-2 flex-wrap rounded-lg bg-muted/20 border border-border/40 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <LibraryBig className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-foreground">
                          {selectedBook} — {browseTotal} unique book words
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {(() => {
                          const greekCount = langCounts["greek"] || 0;
                          const hebrewCount = langCounts["hebrew"] || 0;
                          const aramaicCount = langCounts["aramaic"] || 0;
                          return (
                            <>
                              {greekCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{greekCount}</span>
                                  <span className="text-muted-foreground/60">Greek</span>
                                </span>
                              )}
                              {hebrewCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{hebrewCount}</span>
                                  <span className="text-muted-foreground/60">Hebrew</span>
                                </span>
                              )}
                              {aramaicCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px]">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#e11d48" }} />
                                  <span className="tabular-nums font-semibold text-foreground">{aramaicCount}</span>
                                  <span className="text-muted-foreground/60">Aramaic</span>
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Word list header */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        All Words ({browseWords.length} of {browseTotal})
                      </p>
                    </div>

                    <ScrollArea className="max-h-[45vh] pr-1">
                      <div className="space-y-1.5">
                        {browseWords.map((word) => (
                          <WordResultItem key={word.strongsId} word={word} />
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Load More button */}
                    {browseHasNext && (
                      <div className="flex items-center justify-center pt-1 pb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const nextPage = browsePage + 1;
                            loadBookWords(selectedBook, nextPage, true);
                          }}
                          disabled={browseLoading}
                          className="gap-1.5 text-xs h-8"
                        >
                          {browseLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <BookOpen className="w-3 h-3" />
                          )}
                          {browseLoading
                            ? "Loading..."
                            : `Show more (${browseWords.length} of ${browseTotal} words)`}
                        </Button>
                      </div>
                    )}

                    {/* Back to top — shown after loading at least 2 pages */}
                    {browsePage > 0 && (
                      <div className="flex items-center justify-center pb-1">
                        <button
                          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 hover:border-border/80 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0"
                          >
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                          Back to top
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Browse empty / no results */}
                {!browseLoading && browseLoaded && browseWords.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No words found
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                      No original language word data is available for{" "}
                      {selectedBook} in the current translation.
                    </p>
                  </div>
                )}

                {/* Browse initial empty */}
                {!browseLoading && !browseLoaded && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <LibraryBig className="w-14 h-14 text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Select a book from the dropdown to explore all the original
                      Greek and Hebrew words used in that book.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Gate>
        </div>
      </div>

      {/* ── Word Detail Sheet ── */}
      <WordDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        wordEntry={selectedWord as any || null}
        strongsId={selectedWord?.strongsId || null}
        verseText={undefined}
        translations={undefined}
      />
    </div>
  );
}
