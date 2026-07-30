import { useState, useEffect, useCallback } from "react";
import {
  BookText,
  Languages,
  Hash,
  Info,
  Loader2,
  Search,
  ArrowRight,
  X,
  BookOpen,
  Shuffle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStrongsEntry } from "@/services/strongsApi";
import { sendGetRequest } from "@/services/api";
import type { StrongsEntry } from "@/services/strongsApi";
import { cn } from "@/lib/utils";
import { getLangColor, getLangLetter, getLangScript } from "@/data/staticData";

// ── Types ──

interface WordComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryStrongsId: string | null;
  primaryLabel?: string;
}

interface SearchResult {
  strongsId: string;
  originalWord: string | null;
  transliteration: string | null;
  shortDefinition: string;
  language: string;
}

// ── Helpers ──

const languageLabel = (lang: string) => {
  switch (lang?.toLowerCase()) {
    case "greek": return "Greek";
    case "hebrew": return "Hebrew";
    case "aramaic": return "Aramaic";
    default: return lang || "Greek";
  }
};

const ComparisonRow = ({
  label,
  left,
  right,
  highlightDiff = true,
  renderLeft,
  renderRight,
}: {
  label: string;
  left?: string | number | null;
  right?: string | number | null;
  highlightDiff?: boolean;
  renderLeft?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;
}) => {
  const diff =
    highlightDiff &&
    left !== right &&
    !(left == null && right == null) &&
    String(left ?? "") !== String(right ?? "");

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <div className="grid grid-cols-[80px_1fr_1fr] sm:grid-cols-[100px_1fr_1fr] gap-2 px-2 py-2 text-xs">
        <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] self-center">
          {label}
        </span>
        <div
          className={cn(
            "rounded-md px-2 py-1.5",
            diff && "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30",
          )}
        >
          {renderLeft ? renderLeft() : (
            <span className={diff ? "text-amber-900 dark:text-amber-200 font-semibold" : "text-foreground/80"}>
              {left ?? "—"}
            </span>
          )}
        </div>
        <div
          className={cn(
            "rounded-md px-2 py-1.5",
            diff && "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30",
          )}
        >
          {renderRight ? renderRight() : (
            <span className={diff ? "text-amber-900 dark:text-amber-200 font-semibold" : "text-foreground/80"}>
              {right ?? "—"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Component ──

export default function WordComparisonDialog({
  open,
  onOpenChange,
  primaryStrongsId,
  primaryLabel,
}: WordComparisonDialogProps) {
  // Primary entry
  const [primary, setPrimary] = useState<StrongsEntry | null>(null);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primaryError, setPrimaryError] = useState(false);

  // Comparison entry
  const [comparison, setComparison] = useState<StrongsEntry | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(false);
  const [comparisonId, setComparisonId] = useState("");

  // Search for comparison word
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Reset comparison state when dialog opens with a new word
  useEffect(() => {
    if (open) {
      setComparisonId("");
      setComparison(null);
      setComparisonError(false);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [open]);

  // Fetch primary entry
  useEffect(() => {
    if (!open || !primaryStrongsId) return;
    let cancelled = false;
    setPrimaryLoading(true);
    setPrimaryError(false);
    setPrimary(null);

    getStrongsEntry(primaryStrongsId)
      .then((result) => {
        if (cancelled) return;
        if (result) setPrimary(result);
        else setPrimaryError(true);
        setPrimaryLoading(false);
      })
      .catch(() => {
        if (!cancelled) setPrimaryError(true);
        setPrimaryLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, primaryStrongsId]);

  // Fetch comparison entry
  useEffect(() => {
    if (!open || !comparisonId) return;
    let cancelled = false;
    setComparisonLoading(true);
    setComparisonError(false);
    setComparison(null);

    getStrongsEntry(comparisonId)
      .then((result) => {
        if (cancelled) return;
        if (result) setComparison(result);
        else setComparisonError(true);
        setComparisonLoading(false);
      })
      .catch(() => {
        if (!cancelled) setComparisonError(true);
        setComparisonLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, comparisonId]);

  // Search for words
  const executeSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) return;
    setSearchLoading(true);
    try {
      const res = await sendGetRequest("strongs", "search", {
        q: query.trim(),
        limit: 15,
        offset: 0,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        // Filter out the primary word from results
        const filtered = (rd.data || []).filter(
          (r: SearchResult) => r.strongsId !== primaryStrongsId,
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [primaryStrongsId]);

  // Auto-search on query change (debounced)
  useEffect(() => {
    if (!showSearch || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => executeSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showSearch, executeSearch]);

  const resetComparison = () => {
    setComparisonId("");
    setComparison(null);
    setComparisonError(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleSelectComparison = (id: string) => {
    setComparisonId(id);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Determine what fields to compare
  const crossRefsA = primary?.crossReferences
    ? primary.crossReferences.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const crossRefsB = comparison?.crossReferences
    ? comparison.crossReferences.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground">
              Word Comparison
            </span>
          </DialogTitle>
          <DialogDescription>
            Compare two original language words side by side to see their
            meanings, grammar, and usage differences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── Comparison word selector ── */}
          <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookText className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Compare With
              </span>
              {comparisonId && (
                <button
                  onClick={resetComparison}
                  className="ml-auto text-[10px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Change
                </button>
              )}
            </div>

            {!showSearch && !comparisonId && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search for a word to compare..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  className="h-9 text-sm rounded-lg"
                />
                <Search className="w-4 h-4 text-muted-foreground shrink-0 -ml-9 pointer-events-none" />
              </div>
            )}

            {showSearch && (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search by word, transliteration, or meaning..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="h-9 text-sm rounded-lg pl-9"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  {searchQuery && (
                    <button
                      onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {searchLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-0.5 rounded-lg border border-border/50">
                    {searchResults.map((r) => (
                      <button
                        key={r.strongsId}
                        onClick={() => handleSelectComparison(r.strongsId)}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-sm"
                      >
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                          style={{
                            backgroundColor: `${getLangColor(r.language)}15`,
                            color: getLangColor(r.language),
                          }}
                        >
                          {getLangLetter(r.language)}
                        </span>
                        <span className="font-medium text-foreground">
                          {r.shortDefinition}
                        </span>
                        {r.transliteration && (
                          <span className="text-xs italic text-muted-foreground/60">
                            {r.transliteration}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground/40 ml-auto">
                          {r.strongsId}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 text-center py-2">
                    No words found matching "{searchQuery}"
                  </p>
                )}
              </div>
            )}

            {comparisonId && comparisonLoading && (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading comparison...</span>
              </div>
            )}

            {comparisonId && comparison && !comparisonLoading && (
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{
                    backgroundColor: `${getLangColor(comparison.language)}15`,
                    color: getLangColor(comparison.language),
                  }}
                >
                  {getLangLetter(comparison.language)}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {comparison.shortDefinition}
                </span>
                {comparison.transliteration && (
                  <span className="text-xs italic text-muted-foreground/60">
                    {comparison.transliteration}
                  </span>
                )}
                <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground ml-auto">
                  {comparisonId}
                </Badge>
              </div>
            )}

            {comparisonId && comparisonError && !comparisonLoading && (
              <p className="text-xs text-destructive">
                Could not load comparison word. Try a different word.
              </p>
            )}
          </div>

          {/* ── Comparison grid ── */}
          {primaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : primaryError ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Could not load word details for{" "}
                <span className="font-semibold">{primaryLabel || primaryStrongsId}</span>.
              </p>
            </div>
          ) : primary ? (
            <div className="space-y-4">
              {/* Column headers */}
              <div className="grid grid-cols-[80px_1fr_1fr] sm:grid-cols-[100px_1fr_1fr] gap-2 px-2">
                <div />
                <div className="text-center">
                  <Badge variant="secondary" className="text-[9px] font-bold gap-1 w-full justify-center">
                    Primary
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge
                    variant={comparison ? "secondary" : "outline"}
                    className={cn(
                      "text-[9px] font-bold gap-1 w-full justify-center",
                      !comparison && "text-muted-foreground/40",
                    )}
                  >
                    {comparison ? "Comparison" : "—"}
                  </Badge>
                </div>
              </div>

              {/* Original word row */}
              <ComparisonRow
                label="Original"
                left={primary.originalWord}
                right={comparison?.originalWord}
                renderLeft={() => (
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold"
                      style={{ fontFamily: getLangScript(primary.language) }}
                    >
                      {primary.originalWord || "—"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/40">
                      {primary.strongsId}
                    </span>
                  </div>
                )}
                renderRight={
                  comparison
                    ? () => (
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold"
                            style={{ fontFamily: getLangScript(comparison.language) }}
                          >
                            {comparison.originalWord || "—"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/40">
                            {comparison.strongsId}
                          </span>
                        </div>
                      )
                    : undefined
                }
              />

              {/* Transliteration */}
              <ComparisonRow
                label="Transliteration"
                left={primary.transliteration}
                right={comparison?.transliteration}
              />

              {/* Language */}
              <ComparisonRow
                label="Language"
                left={languageLabel(primary.language)}
                right={comparison ? languageLabel(comparison.language) : null}
              />

              {/* Definition (short) */}
              <ComparisonRow
                label="Definition"
                left={primary.shortDefinition}
                right={comparison?.shortDefinition}
              />

              {/* Full Definition */}
              {(primary.fullDefinition || comparison?.fullDefinition) && (
                <ComparisonRow
                  label="Full Detail"
                  highlightDiff={false}
                  renderLeft={() => (
                    <p className="text-xs leading-5 text-foreground/80">{primary.fullDefinition || "—"}</p>
                  )}
                  renderRight={
                    comparison
                      ? () => (
                          <p className="text-xs leading-5 text-foreground/80">{comparison.fullDefinition || "—"}</p>
                        )
                      : undefined
                  }
                />
              )}

              {/* Part of Speech */}
              <ComparisonRow
                label="POS"
                left={primary.partOfSpeech}
                right={comparison?.partOfSpeech}
              />

              {/* Grammar details */}
              <ComparisonRow
                label="Case"
                left={primary.grammaticalCase}
                right={comparison?.grammaticalCase}
              />
              <ComparisonRow
                label="Gender"
                left={primary.gender}
                right={comparison?.gender}
              />
              <ComparisonRow
                label="Number"
                left={primary.number}
                right={comparison?.number}
              />

              {/* Usage Count */}
              <ComparisonRow
                label="Usage"
                left={primary.usageCount != null ? `${primary.usageCount}×` : null}
                right={comparison?.usageCount != null ? `${comparison.usageCount}×` : null}
              />

              {/* Cross References */}
              {(crossRefsA.length > 0 || crossRefsB.length > 0) && (
                <ComparisonRow
                  label="Cross Refs"
                  highlightDiff={false}
                  renderLeft={() => (
                    <div className="flex flex-wrap gap-1">
                      {crossRefsA.length > 0
                        ? crossRefsA.map((ref, i) => (
                            <span key={i} className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {ref}
                            </span>
                          ))
                        : <span className="text-muted-foreground/40">—</span>}
                    </div>
                  )}
                  renderRight={
                    comparison
                      ? () => (
                          <div className="flex flex-wrap gap-1">
                            {crossRefsB.length > 0
                              ? crossRefsB.map((ref, i) => (
                                  <span key={i} className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    {ref}
                                  </span>
                                ))
                              : <span className="text-muted-foreground/40">—</span>}
                          </div>
                        )
                      : undefined
                  }
                />
              )}

              {/* No comparison selected state */}
              {!comparisonId && !showSearch && (
                <div className="flex flex-col items-center py-6 text-center">
                  <ArrowRight className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground/60 max-w-xs">
                    Search for a second word above to compare its meaning,
                    grammar, and usage side by side.
                  </p>
                </div>
              )}
            </div>
          ) : null}              {/* Quick word suggestions */}
          {!comparisonId && !showSearch && primary && (
            <div className="rounded-lg bg-muted/10 border border-border/40 p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Try Comparing With
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const isGreek = primary.language?.toLowerCase() === "greek";
                  const suggestions = isGreek
                    ? [
                        { id: "G0026", label: "ἀγάπη (agape)" },
                        { id: "G5368", label: "φιλέω (phileo)" },
                        { id: "G0025", label: "ἀγαπάω (agapao)" },
                        { id: "G4102", label: "πίστις (pistis)" },
                        { id: "G3056", label: "λόγος (logos)" },
                      ]
                    : [
                        { id: "H0430", label: "אֱלֹהִים (elohim)" },
                        { id: "H3068", label: "יְהוָה (YHWH)" },
                        { id: "H1697", label: "דָּבָר (dabar)" },
                        { id: "H7307", label: "רוּחַ (ruach)" },
                        { id: "H5315", label: "נֶפֶשׁ (nephesh)" },
                      ];
                  return suggestions
                    .filter((s) => s.id !== primaryStrongsId)
                    .slice(0, 4)
                    .map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectComparison(suggestion.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {suggestion.label}
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ));
                })()}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
