import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  BookOpen,
  BookmarkCheck,
  FileText,
  ChevronDown,
  Clock,
  Trash2,
  TrendingUp,
  Loader2,
  BookMarked,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSearch, SUGGESTIONS, SCOPE_LABELS, CROSS_TRANSLATION_OPTIONS } from "@/hooks/useSearch";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscription } from "@/hooks/useSubscription";
import LockedFeatureBadge from "@/components/LockedFeatureBadge";
import type {
  SearchResult,
  JournalSearchResult,
  TopicResult,
  LemmaResult,
  CrossTranslationResult,
  SearchScope,
  SearchResultItem,
} from "@/services/searchApi";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function splitHeadline(headline: string): { text: string; highlight: boolean }[] {
  const parts: { text: string; highlight: boolean }[] = [];
  const regex = /<mark>(.*?)<\/mark>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(headline)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: headline.slice(lastIndex, match.index), highlight: false });
    }
    parts.push({ text: match[1], highlight: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < headline.length) {
    parts.push({ text: headline.slice(lastIndex), highlight: false });
  }
  return parts;
}

const SCOPES: SearchScope[] = ["bible", "journal", "topics", "lemma"];

function ScopeIcon({ scope, className }: { scope: SearchScope; className?: string }) {
  switch (scope) {
    case "bible": return <BookOpen className={cn("w-3.5 h-3.5", className)} />;
    case "journal": return <FileText className={cn("w-3.5 h-3.5", className)} />;
    case "topics": return <BookmarkCheck className={cn("w-3.5 h-3.5", className)} />;
    case "lemma": return <Search className={cn("w-3.5 h-3.5", className)} />;
  }
}

function SearchSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="h-3 w-1/3 rounded bg-muted/50" />
          <div className={cn("h-14 rounded-lg bg-muted/30", i % 2 === 0 && "w-[92%]")} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    searchImmediate,
    scope,
    switchScope,
    bookName,
    setBookFilter,
    covenant,
    setCovenant,
    translation,
    setTranslation,
    results,
    loading,
    total,
    error: searchError,
    loadMore,
    clearQuery,
    searchedOnce,

    searchHistory,
    clearHistory,
    removeHistoryItem,
    popularSearches,
    filteredBooks,
    BOOK_NAMES,
  } = useSearch();

  const { isFree } = useSubscription();
  const isAdvancedScope = scope === "topics" || scope === "lemma";
  const scopeLocked = isFree && isAdvancedScope;

  const hasQuery = query.trim().length >= 3;
  const showSkeleton = loading && hasQuery && results.length === 0;
  const [showBookPicker, setShowBookPicker] = useState(false);

  const filteredBookList = useMemo(() => {
    if (covenant === "ot") return BOOK_NAMES.slice(0, 39);
    if (covenant === "nt") return BOOK_NAMES.slice(39);
    return BOOK_NAMES;
  }, [covenant, BOOK_NAMES]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleScopeSwitch = useCallback(
    (s: SearchScope) => {
      switchScope(s);
      setShowBookPicker(false);
      setCovenant("all");
      inputRef.current?.focus();
    },
    [switchScope],
  );

  const handleInputChange = useCallback(
    (text: string) => {
      setQuery(text, scope);
    },
    [setQuery, scope],
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setQuery(suggestion, scope);
      inputRef.current?.focus();
    },
    [setQuery, scope],
  );

  const handleHistoryTap = useCallback(
    (item: string) => {
      searchImmediate(item, scope);
    },
    [searchImmediate, scope],
  );

  const handlePopularTap = useCallback(
    (item: { query: string; scope: SearchScope }) => {
      searchImmediate(item.query, item.scope);
      if (item.scope !== scope) {
        switchScope(item.scope);
      }
    },
    [searchImmediate, scope, switchScope],
  );

  const handleSelect = useCallback(
    (item: SearchResult) => {
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(item.book_name)}&chapter=${item.chapter}&translation=${encodeURIComponent(translation)}`,
      );
    },
    [navigate, translation],
  );

  const handleStudy = useCallback(
    (item: SearchResult) => {
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(item.book_name)}&chapter=${item.chapter}&verse=${item.verse}&translation=${encodeURIComponent(translation)}`,
      );
    },
    [navigate, translation],
  );

  const handleSave = useCallback(
    (item: SearchResult) => {
      navigate(
        `${routes.journal.path}?book=${encodeURIComponent(item.book_name)}&chapter=${item.chapter}&verse=${item.verse}`,
      );
    },
    [navigate],
  );



  // ── Renderers ──

  const renderBibleResult = useCallback(
    (item: SearchResult | CrossTranslationResult, idx: number) => {
      const parts = (item as any).headline ? splitHeadline((item as any).headline) : null;
      const ref = `${item.book_name} ${item.chapter}:${(item as SearchResult).verse ?? (item as CrossTranslationResult).verse}`;
      const text = (item as SearchResult).verse_text || (item as CrossTranslationResult).verse_text;
      return (
        <div
          key={`bible-${idx}`}
          className="group rounded-xl border border-border/40 bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]"
          onClick={() => handleSelect(item as SearchResult)}
        >
          {/* Reference badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            <span className="text-xs font-bold text-accent tracking-wide">{ref}</span>
            {"translationAbbr" in item && (
              <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 border-primary/20 text-primary px-1.5 py-0">
                {(item as CrossTranslationResult).translationAbbr}
              </Badge>
            )}
          </div>

          {/* Verse text */}
          {parts ? (
            <p className="text-sm leading-relaxed text-foreground/80 font-serif">
              {parts.map((part, i) =>
                part.highlight ? (
                  <span key={i} className="text-accent font-semibold bg-accent/10 px-0.5 rounded">
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/80 font-serif line-clamp-3">
              {text}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20 opacity-75 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2.5 gap-1 hover:bg-accent/10 hover:text-accent"
              onClick={(e) => { e.stopPropagation(); handleSelect(item as SearchResult); }}
            >
              <BookOpen className="w-3 h-3" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2.5 gap-1 hover:bg-primary/10 hover:text-primary"
              onClick={(e) => { e.stopPropagation(); handleStudy(item as SearchResult); }}
            >
              <BookMarked className="w-3 h-3" />
              Study
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2.5 gap-1 hover:bg-emerald-500/10 hover:text-emerald-600"
              onClick={(e) => { e.stopPropagation(); handleSave(item as SearchResult); }}
            >
              <BookmarkCheck className="w-3 h-3" />
              Save
            </Button>
          </div>
        </div>
      );
    },
    [handleSelect, handleStudy, handleSave],
  );



  const renderJournalResult = useCallback(
    (item: JournalSearchResult, idx: number) => (
      <div
        key={`journal-${idx}`}
        className="rounded-xl border border-border/40 bg-card p-4 hover:border-emerald-200/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
        onClick={() => navigate(`${routes.journal.path}/view/${item.id}`)}
      >
        <p className="text-sm font-bold text-foreground">{item.title || "Untitled"}</p>
        <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{item.content}</p>
        {item.bookName && (
          <p className="text-xs text-muted-foreground mt-1">
            {item.bookName} {item.chapter}:{item.verseNumber} · {item.createdAt}
          </p>
        )}
      </div>
    ),
    [navigate],
  );

  const renderTopicResult = useCallback(
    (item: TopicResult, idx: number) => {
      const refCount = item.verseRefs ? item.verseRefs.split(",").length : 0;
      return (
        <div
          key={`topic-${idx}`}
          className="rounded-xl border border-border/40 bg-card p-4 hover:border-amber-200/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
          onClick={() => setQuery(item.topicName, "bible")}
        >
          <p className="text-sm font-bold text-primary capitalize">{item.topicName}</p>
          {item.description && (
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{item.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{refCount} related verses</p>
        </div>
      );
    },
    [setQuery],
  );

  const renderLemmaResult = useCallback(
    (item: LemmaResult, idx: number) => (
      <div
        key={`lemma-${idx}`}
        className="rounded-xl border border-border/40 bg-card p-4 hover:border-blue-200/50 hover:shadow-sm transition-all duration-200"
      >
        <p className="text-sm font-bold text-foreground">{item.originalWord || item.strongsId}</p>
        <p className="text-xs font-semibold text-primary mt-0.5">{item.strongsId} · {item.transliteration}</p>
        <p className="text-sm text-foreground/70 mt-1">{item.shortDefinition}</p>
      </div>
    ),
    [],
  );

  const renderItem = useCallback(
    (item: SearchResultItem, idx: number) => {
      if (scope === "journal") return renderJournalResult(item as JournalSearchResult, idx);
      if (scope === "topics") return renderTopicResult(item as TopicResult, idx);
      if (scope === "lemma") return renderLemmaResult(item as LemmaResult, idx);
      return renderBibleResult(item as SearchResult | CrossTranslationResult, idx);
    },
    [scope, renderBibleResult, renderJournalResult, renderTopicResult, renderLemmaResult],
  );

  // ── Empty/initial state ──

  const renderInitialState = () => (
    <div className="pb-8">
      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Recent Searches
              </p>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
          {searchHistory.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 px-4 sm:px-6 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors rounded-lg mx-2"
              onClick={() => handleHistoryTap(item)}
            >
              <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              <span className="text-sm text-foreground/80 flex-1 truncate">{item}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeHistoryItem(item); }}
                className="p-1 text-muted-foreground hover:text-foreground opacity-0 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="h-px bg-border/30 mx-4 sm:mx-6 my-3" />
        </div>
      )}

      {/* Popular Searches */}
      {popularSearches.filter((p) => p.scope === scope).length > 0 && (
        <div className="mb-6 px-4 sm:px-6">
          <div className="flex items-center gap-2 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Popular
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches
              .filter((p) => p.scope === scope)
              .slice(0, 8)
              .map((p) => (
                <button
                  key={p.query}
                  onClick={() => handlePopularTap(p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/50 border border-primary/20 hover:bg-primary/10 text-foreground transition-colors"
                >
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {p.query}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-col items-center py-10 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 ring-1 ring-primary/5">
          <Search className="w-7 h-7 text-primary/60" />
        </div>
        <p className="text-base font-bold text-foreground mb-1">
          {scope === "bible"              ? "Search the Bible"
            : scope === "journal"
                ? "Search Your Journal"
                : scope === "topics"
                  ? "Explore Bible topics and themes"
                  : "Search Greek/Hebrew lemmas"}
        </p>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          {scope === "bible"
            ? "Find verses across all books and chapters"
            : scope === "journal"
                ? "Find reflections, prayers, and notes"
                : scope === "topics"
                  ? "Explore Bible topics and themes"
                  : "Search by Greek/Hebrew root word"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {SUGGESTIONS[scope].map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/50 border border-border hover:bg-muted transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ══════════ HEADER ══════════ */}
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-accent" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Search
            </h1>
          </div>
        </div>

        {/* ── Scope Tabs ── */}
        <div className="px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {SCOPES.map((s) => {
              const active = scope === s;
              return (
                <button
                  key={s}
                  onClick={() => handleScopeSwitch(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 active:scale-[0.97]",
                    active
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <ScopeIcon scope={s} />
                  {SCOPE_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ══════════ HERO SEARCH AREA ══════════ */}
      <div className="px-4 sm:px-6 pt-4 pb-3">
        <div className="relative rounded-2xl bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] border border-border/50 p-4 sm:p-5">
          {/* Search Input */}
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
              isRtl ? "right-3.5" : "left-3.5",
            )} />
            <input
              ref={inputRef}
              type="text"
              aria-label={
                scope === "bible"
                  ? "Search the Bible"
                  : scope === "journal"
                    ? "Search your journal"
                    : scope === "topics"
                      ? "Search Bible topics"
                      : "Search Greek or Hebrew lemmas"
              }
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                scope === "bible"
                  ? "Search the Bible..."
                  : scope === "journal"
                    ? "Search your journal..."
                    : scope === "topics"
                      ? "Search Bible topics..."
                      : "Search Greek/Hebrew lemmas..."
              }
              className={cn(
                "w-full h-11 bg-background border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
                "transition-all duration-200",
                isRtl ? "pr-10 pl-10" : "pl-10 pr-10",
              )}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
            />
            {query.length > 0 && (
              <button
                onClick={clearQuery}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50",
                  isRtl ? "left-2.5" : "right-2.5",
                )}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters row — only for Bible scope */}
          {scope === "bible" && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Translation Select */}
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <Select value={translation} onValueChange={(v) => setTranslation(v)}>
                  <SelectTrigger aria-label="Select translation" className="h-8 text-xs w-[130px] sm:w-[160px] rounded-lg border-border/60 bg-background/80 gap-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CROSS_TRANSLATION_OPTIONS.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{t.abbr}</span>
                          <span className="text-muted-foreground/60 text-[10px]">{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-px h-5 bg-border/40 mx-1" />

              {/* Covenant chips */}
              <div className="flex items-center gap-1">
                {(["all", "ot", "nt"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCovenant(c);
                      setBookFilter(undefined);
                      // Re-trigger search with covenant when no book selected
                      setShowBookPicker(false);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-bold border transition-all shrink-0",
                      covenant === c
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-transparent text-muted-foreground border-border/50 hover:bg-muted/40",
                    )}
                  >
                    {c === "all" ? "All" : c === "ot" ? "OT" : "NT"}
                  </button>
                ))}
              </div>

              {/* Book picker */}
              <div className="relative">
                <button
                  onClick={() => setShowBookPicker((p) => !p)}
                  className={cn(
                    "inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-bold border transition-all shrink-0",
                    bookName
                      ? "bg-accent/10 text-accent border-accent/30"
                      : "bg-transparent text-muted-foreground border-border/50 hover:bg-muted/40",
                  )}
                >
                  <span className="truncate max-w-[80px]">{bookName || "Book"}</span>
                  <ChevronDown
                    className={cn("w-3 h-3 transition-transform shrink-0", showBookPicker && "rotate-180")}
                  />
                </button>

                {showBookPicker && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 max-h-52 overflow-y-auto rounded-xl border bg-popover shadow-lg">
                    <ScrollArea className="h-52">
                      {filteredBookList.map((b) => (
                        <button
                          key={b}
                          onClick={() => {
                            setBookFilter(b);
                            setShowBookPicker(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs transition-colors hover:bg-muted",
                            bookName === b ? "bg-accent/10 text-accent font-semibold" : "text-foreground",
                          )}
                        >
                          {b}
                        </button>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ RESULTS ══════════ */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Locked scope banner */}
          {scopeLocked && (
            <div className="px-4 sm:px-6 py-4">
              <LockedFeatureBadge
                featureName={{
                  topics: "Bible Topic Search",
                  lemma: "Greek/Hebrew Lemma Search",
                }[scope] || "Advanced Search"}
                featureDescription={{
                  topics: "Explore Bible topics, themes, and subjects with related verse references.",
                  lemma: "Search by Greek or Hebrew root word (lemma) to find every occurrence across Scripture.",
                }[scope] || "Upgrade to access advanced search tools."}
              />
            </div>
          )}

          {!scopeLocked && (
            <>
              {/* Results count */}
              {hasQuery && total > 0 && (
                <div className="px-4 sm:px-6 py-2 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {total} result{total !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* Results grid */}
              {showSkeleton ? (
                <SearchSkeleton />
              ) : hasQuery ? (
                <div className="px-4 sm:px-6 pb-6 space-y-3">
                  {results.map((item, idx) => renderItem(item, idx))}

                  {/* Load more */}
                  {results.length > 0 && total > results.length && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMore}
                        disabled={loading}
                        className="gap-2 rounded-xl"
                      >
                        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        {loading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}

                  {/* Loading footer */}
                  {loading && results.length > 0 && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Searching...</span>
                    </div>
                  )}
                </div>
              ) : (
                renderInitialState()
              )}

              {/* Mini results count — visible while typing */}
              {!hasQuery && query.trim().length > 0 && query.trim().length < 3 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Type at least 3 characters to search</p>
                </div>
              )}

              {/* Error state */}
              {hasQuery && !loading && results.length === 0 && searchedOnce && !searchError && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm font-semibold text-foreground/70 mb-1">No results found</p>
                  <p className="text-xs text-muted-foreground/60 max-w-xs">
                    {scope === "bible"
                      ? `No verses match "${query}". Try a different word or check your spelling.`
                      : scope === "journal"
                          ? `No journal entries found for "${query}"`
                          : scope === "topics"
                            ? `No topics found for "${query}"`
                            : `No lemmas found for "${query}"`}
                  </p>
                </div>
              )}

              {searchError && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <p className="text-sm text-destructive">{searchError}</p>
                </div>
              )}
            </>
          )}

          <div className="h-12" />
        </ScrollArea>
      </div>
    </div>
  );
}
