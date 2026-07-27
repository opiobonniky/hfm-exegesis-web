import { type RefObject, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BookOpen, Lightbulb, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import {
  type Highlight,
  type ChapterData,
  type SpeechItem,
  renderVerseWithStrongs,
} from "@/lib/bibleHelpers";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface VerseWordEntry {
  text: string;
  strongsId: string | null;
  hasData: boolean;
}

export interface PromptEntry {
  id: number;
  prompt: string;
  category: string;
}

export interface ExplanationEntry {
  explanation: string;
  learnMore?: string;
  promptIds?: number[];
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface VerseDisplayProps {
  /** Loaded chapter data */
  chapters: ChapterData[];
  /** Is data still loading */
  loading: boolean;
  /** Current display position */
  displayBook: string;
  displayChapter: number;
  /** Annotations */
  highlights: Record<string, Highlight>;
  favorites: Set<string>;
  verseNotes: Record<string, string>;
  /** Strong's data per verse key */
  verseWordsMap: Record<string, VerseWordEntry[]>;
  /** Explanations */
  verseExplanationMap: Record<string, ExplanationEntry>;
  verseExplanationPrompts: Record<string, PromptEntry[]>;
  chapterPrompts: Record<string, PromptEntry[]>;
  expandedExplanation: string | null;
  expandedFullExplanation: Set<string>;
  explanationLoading: boolean;
  /** Selection */
  selectedVerses: string[];
  /** Speech */
  isSpeaking: boolean;
  currentSpeechIdx: number;
  speechItems: SpeechItem[];
  /** Auth */
  isAuthenticated: boolean;
  /** Refs forwarded from parent */
  contentRef: RefObject<HTMLDivElement | null>;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  chapterRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
  verseRefs: React.MutableRefObject<Record<string, HTMLSpanElement | null>>;
  /** Callbacks */
  onToggleVerseSelection: (verseKey: string) => void;
  onToggleExplanation: (verseKey: string) => void;
  onWordTap: (strongsId: string, wordText: string) => void;
  onRemoveHighlight?: (verseKey: string) => void;
  onDailyVerseRef?: (verseKey: string) => void;
  onCloseDailyVerseRef?: (verseKey: string) => void;
  dailyVerseRefMap?: Record<string, any>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const getStrongsForVerse = (
  verseKey: string,
  verseWordsMap: Record<string, VerseWordEntry[]>,
): VerseWordEntry[] => {
  return verseWordsMap[verseKey] || [];
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function VerseDisplay({
  chapters,
  loading,
  displayBook,
  displayChapter,
  highlights,
  favorites,
  verseNotes,
  verseWordsMap,
  verseExplanationMap,
  verseExplanationPrompts,
  chapterPrompts,
  expandedExplanation,
  expandedFullExplanation,
  explanationLoading,
  explainedVerseKey,
  selectedVerses,
  isSpeaking,
  currentSpeechIdx,
  speechItems,
  isAuthenticated,
  contentRef,
  loadMoreRef,
  chapterRefs,
  verseRefs,
  onToggleVerseSelection,
  onToggleExplanation,
  onWordTap,
  onRemoveHighlight,
  onDailyVerseRef,
  onCloseDailyVerseRef,
  dailyVerseRefMap,
}: VerseDisplayProps) {
  const { t, isRtl } = useLanguage();

  // Is this verse currently being spoken?
  const isCurrentSpeechVerse = useCallback(
    (verseKey: string) => {
      if (!isSpeaking || speechItems.length === 0) return false;
      const item = speechItems[currentSpeechIdx];
      return item?.verseKey === verseKey;
    },
    [isSpeaking, currentSpeechIdx, speechItems],
  );

  // Get the daily verse ref for a given verse
  const getDailyRef = useCallback(
    (verseKey: string) => dailyVerseRefMap[verseKey],
    [dailyVerseRefMap],
  );

  // Skeleton loading state
  if (loading && chapters.length === 0) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6 font-serif"
        ref={contentRef}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {chapters.map((cd) => {
          const chapterKey = `${cd.book}-${cd.chapter}`;
          const isCurrentChapter =
            cd.book === displayBook && cd.chapter === displayChapter;
          const chapterPromptsForChapter = chapterPrompts[chapterKey] || [];

          return (
            <div
              key={chapterKey}
              ref={(el) => {
                if (el) chapterRefs.current[chapterKey] = el;
              }}
              data-chapter-key={chapterKey}
              className={cn(
                "mb-10 scroll-mt-24",
                isCurrentChapter ? "" : "opacity-70",
              )}
            >
              {/* ── Chapter Header ── */}
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/40">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <h2
                  className="text-lg sm:text-xl font-semibold text-foreground"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {cd.book} {cd.chapter}
                </h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  {cd.verses.length} {t.bibleReader?.verses || "verses"}
                </span>
              </div>

              {/* ── Chapter Prompts ── */}
              {chapterPromptsForChapter.length > 0 && isCurrentChapter && (
                <div className="mb-6 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t.bibleReader?.reflections || "Reflections"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {chapterPromptsForChapter.map((prompt) => (
                      <span
                        key={prompt.id}
                        className="px-2 py-0.5 rounded-full bg-primary/5 text-primary/80 text-[11px] leading-relaxed"
                      >
                        {prompt.prompt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Verses ── */}
              <div className="space-y-1">
                {cd.verses.map((v) => {
                  const verseKey = v.key;
                  const isSelected = selectedVerses.includes(verseKey);
                  const isHighlighted = !!highlights[verseKey]?.color;
                  const highlightColor = highlights[verseKey]?.color;
                  const isFav = favorites.has(verseKey);
                  const hasNote = !!verseNotes[verseKey];
                  const isSpoken = isCurrentSpeechVerse(verseKey);
                  const verseExpanded = expandedExplanation === verseKey;
                  const isFullExpanded = expandedFullExplanation.has(verseKey);
                  const explanation = verseExplanationMap[verseKey];
                  const prompts = verseExplanationPrompts[verseKey] || [];
                  const dailyRef = getDailyRef(verseKey);
                  const strongsWords = getStrongsForVerse(
                    verseKey,
                    verseWordsMap,
                  );

                  return (
                    <div
                      key={verseKey}
                      id={`verse-${v.num}`}
                      className={cn(
                        "group flex gap-2 sm:gap-3 py-1.5 px-2 rounded-lg transition-colors",
                        isSelected && "bg-primary/5 ring-1 ring-primary/20",
                        isSpoken && "bg-primary/10 ring-1 ring-primary/30",
                      )}
                    >
                      {/* ── Verse Number ── */}
                      <span
                        ref={(el) => {
                          verseRefs.current[verseKey] = el;
                        }}
                        onClick={() => onToggleVerseSelection(verseKey)}
                        className={cn(
                          "select-none text-xs sm:text-sm font-bold text-muted-foreground/60 w-7 sm:w-8 text-right shrink-0 pt-0.5 cursor-pointer hover:text-primary transition-colors",
                          isSelected && "text-primary",
                          isSpoken && "text-primary",
                        )}
                      >
                        {v.num}
                      </span>

                      {/* ── Verse Content ── */}
                      <div className="flex-1 min-w-0">
                        {/* Verse text */}
                        <div
                          className={cn(
                            "text-sm sm:text-base leading-relaxed sm:leading-8 text-foreground/90 rounded px-1 -mx-1 transition-colors",
                            isHighlighted && highlightColor
                              ? "rounded px-1 -mx-1"
                              : "",
                          )}
                          style={
                            isHighlighted && highlightColor
                              ? {
                                  backgroundColor: `${highlightColor}30`,
                                  borderLeft: `3px solid ${highlightColor}`,
                                }
                              : undefined
                          }
                          onClick={() => onToggleVerseSelection(verseKey)}
                        >
                          {renderVerseWithStrongs(
                            v.text,
                            verseKey,
                            strongsWords,
                            onWordTap,
                          )}
                        </div>

                        {/* ── Verse metadata badges ── */}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {/* Favorite badge */}
                          {isFav && (
                            <span className="text-[10px] text-rose-500 font-semibold">
                              ★
                            </span>
                          )}
                          {/* Note badge */}
                          {hasNote && (
                            <span className="text-[10px] text-emerald-500 font-semibold">
                              📝
                            </span>
                          )}
                          {/* Daily verse ref */}
                          {dailyRef && (
                            <button
                              onClick={() => onCloseDailyVerseRef(verseKey)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] text-amber-700 dark:text-amber-300 font-medium border border-amber-200/50 dark:border-amber-800/30"
                            >
                              <Lightbulb className="w-2.5 h-2.5" />
                              {t.bibleReader?.dailyVerse || "Daily Verse"}
                            </button>
                          )}
                        </div>

                        {/* ── Explanation Panel ── */}
                        {verseExpanded && (
                          <div className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/40 animate-in slide-in-from-top-1 duration-200">
                            {explanationLoading && explainedVerseKey === verseKey ? (
                              <div className="flex items-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {t.bibleReader?.loadingExplanation || "Loading..."}
                                </span>
                              </div>
                            ) : explanation ? (
                              <div className="space-y-2">
                                <p className="text-sm leading-relaxed text-foreground/80">
                                  {isFullExpanded
                                    ? explanation.explanation
                                    : explanation.explanation.length > 300
                                      ? explanation.explanation.slice(0, 300) + "…"
                                      : explanation.explanation}
                                </p>
                                {explanation.explanation.length > 300 && (
                                  <button
                                    onClick={() => {
                                      // Dispatch custom event to toggle full explanation
                                      window.dispatchEvent(
                                        new CustomEvent("toggle-full-explanation", {
                                          detail: { verseKey },
                                        }),
                                      );
                                    }}
                                    className="text-xs font-medium text-primary hover:underline"
                                  >
                                    {isFullExpanded
                                      ? (t.bibleReader?.showLess || "Show less")
                                      : (t.bibleReader?.readMore || "Read more")}
                                  </button>
                                )}
                                {/* Journal prompts */}
                                {prompts.length > 0 && (
                                  <div className="pt-2 border-t border-border/30 mt-2">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                      {t.bibleReader?.journalPrompts || "Journal Prompts"}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {prompts.map((p) => (
                                        <span
                                          key={p.id}
                                          className="px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 text-[10px]"
                                        >
                                          {p.prompt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* ── Explanation toggle button ── */}
                        <button
                          onClick={() => onToggleExplanation(verseKey)}
                          className={cn(
                            "mt-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
                            verseExpanded
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          {verseExpanded
                            ? (t.bibleReader?.hideExplanation || "Hide explanation")
                            : (t.bibleReader?.explain || "Explain")}
                        </button>

                        {/* ── Daily verse ref trigger ── */}
                        {!dailyRef && isCurrentChapter && (
                          <button
                            onClick={() => onDailyVerseRef(verseKey)}
                            className="mt-0.5 ml-2 text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500 transition-opacity"
                          >
                            {t.bibleReader?.setAsDaily || "Set as daily verse"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Infinite scroll sentinel ── */}
        <div ref={loadMoreRef} className="h-4" />

        {/* ── End marker ── */}
        {chapters.length > 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground/40">
            <p className="text-xs">
              {t.bibleReader?.endOfReading || "— End —"}
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
