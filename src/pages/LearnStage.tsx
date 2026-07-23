import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookText,
  Brain,
  Copy,
  Check,
  FileText,
  GraduationCap,
  Hash,
  Tags,
  Languages,
  BookMarked as BookMarkedIcon,
  Heart,
  Save,
  ChevronRight as ChevronRightIcon,
  Loader2,
  Info,
} from "lucide-react";
import type { StrongsWordData, StrongsEntry as StrongsEntryType } from "@/services/strongsApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MorphItem {
  label: string;
  value: string;
}

interface LearnTabConfig {
  key: string;
  label: string;
}

interface LearnStageProps {
  learnTab: string;
  learnNotes: string;
  bookName: string;
  chapter: string;
  verseStart: string;
  passageRef: string | null;
  saving: boolean;
  verseWords: StrongsWordData[];
  wordsLoading: boolean;
  bookPrologue: BookPrologue | null;
  prologueLoading: boolean;
  verseResources: VerseResourceData | null;
  resourcesLoading: boolean;
  translations: TranslationComparisonEntry[] | null;
  translationsLoading: boolean;
  translationsError: boolean;
  onUpdate: (updates: Record<string, any>) => void;
  onAdvance: () => void;
  onSaveProgress: () => void;
  onWordTap: (strongsId: string, morphology?: string | null) => void;
  stageLabel: string;
  learnTabs: LearnTabConfig[];
}

// ── Helpers (morphology) ───────────────────────────────────────────────────────

function renderMorphologyBreakdown(entry: StrongsEntryType, rawCode: string | null) {
  const items: MorphItem[] = [];
  if (entry.partOfSpeech) items.push({ label: "Part of Speech", value: entry.partOfSpeech });
  if (entry.grammaticalCase) items.push({ label: "Case", value: entry.grammaticalCase });
  if (entry.gender) items.push({ label: "Gender", value: entry.gender });
  if (entry.number) items.push({ label: "Number", value: entry.number });

  if (items.length === 0 && !rawCode) return null;

  return (
    <div className="rounded-lg bg-card border border-border p-3">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Info className="w-3 h-3" />
        Morphology Breakdown
        {rawCode && (
          <span className="font-mono font-normal text-[10px] text-muted-foreground/50">
            {rawCode}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge
            key={item.label}
            variant="outline"
            className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
          >
            {item.label}: {item.value}
          </Badge>
        ))}
        {items.length === 0 && rawCode && (
          <Badge
            variant="outline"
            className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-muted border-border text-muted-foreground"
          >
            {rawCode}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── Word detail dialog state (local) ───────────────────────────────────────────

// The word dialog state is managed inside LearnStage so it's self-contained.
// Props are passed up via onWordTap; the dialog detail fetch happens here.

// ── Component ──────────────────────────────────────────────────────────────────

export default function LearnStage({
  learnTab,
  learnNotes,
  bookName,
  chapter,
  verseStart,
  passageRef,
  saving,
  verseWords,
  wordsLoading,
  bookPrologue,
  prologueLoading,
  verseResources,
  resourcesLoading,
  translations,
  translationsLoading,
  translationsError,
  onUpdate,
  onAdvance,
  onSaveProgress,
  onWordTap,
  stageLabel,
  learnTabs,
}: LearnStageProps) {
  const navigate = useNavigate();
  const [copiedCommentaryIdx, setCopiedCommentaryIdx] = useState<number | null>(null);

  const copyCommentary = async (text: string, author: string, title: string, idx: number) => {
    const ref = passageRef || `${bookName} ${chapter}:${verseStart}`;
    const attribution = `${text}\n\n— ${author}, ${title} (commentary on ${ref})`;
    try {
      await navigator.clipboard.writeText(attribution);
      setCopiedCommentaryIdx(idx);
      setTimeout(() => setCopiedCommentaryIdx(null), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const getTabIcon = (key: string) => {
    switch (key) {
      case "exegesis": return FileText;
      case "language": return BookText;
      case "history": return GraduationCap;
      case "prologue": return BookMarkedIcon;
      default: return FileText;
    }
  };

  // ── Tab bar ──
  const renderTabBar = () => (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {learnTabs.map(({ key, label }) => {
        const active = learnTab === key;
        const IconComp = getTabIcon(key);
        return (
          <button
            key={key}
            onClick={() => onUpdate({ learnTab: key })}
            className={cn(
              "inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-[0.97] [touch-action:manipulation]",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted",
            )}
          >
            <IconComp className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );

  // ── Exegesis tab ──
  const renderExegesisTab = () => (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2">Study Notes</p>
      <textarea
        value={learnNotes}
        onChange={(e) => onUpdate({ learnNotes: e.target.value })}
        placeholder="Write your study notes, observations, and insights..."
        rows={6}
        className="w-full rounded-xl border border-border bg-card text-foreground text-sm p-3 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
      />
    </div>
  );

  // ── Language tab ──
  const renderLanguageTab = () => (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
        <BookText className="w-3.5 h-3.5" />
        Original Language Words
        {verseWords.length > 0 && (
          <span className="font-normal text-[11px]">({verseWords.length} words)</span>
        )}
      </p>

      {wordsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : verseWords.length > 0 ? (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {verseWords.map((w, idx) => {
            const hasStrongs = !!w.strongsId && w.hasData;
            return (
              <div
                key={`${w.verseNumber}-${w.wordOrder}-${idx}`}
                onClick={() => hasStrongs && w.strongsId && onWordTap(w.strongsId, w.morphology)}
                className={cn(
                "flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg border transition-colors text-sm [touch-action:manipulation]",
                hasStrongs
                  ? "bg-card border-border hover:bg-muted cursor-pointer active:scale-[0.99]"
                  : "bg-card/50 border-transparent text-muted-foreground",
                )}
              >
                {w.verseNumber && (
                  <span className="text-[10px] font-bold text-muted-foreground/60 w-5 shrink-0 text-right">
                    {w.verseNumber}
                  </span>
                )}
                <span className={cn("flex-1 font-medium", hasStrongs && "text-foreground")}>
                  {w.surfaceText}
                </span>
                {hasStrongs && w.lemma && (
                  <span className="text-[11px] italic text-primary/70 shrink-0">
                    {w.lemma}
                  </span>
                )}
                {hasStrongs && (
                  <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-6 text-center">
          <BookText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {bookName && chapter
              ? "No Strong's word data available for this passage."
              : "Select a passage to see original language word analysis."}
          </p>
        </div>
      )}            {verseWords.length > 0 && (
          <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
            Tap a word to see its original meaning and full explanation.
          </p>
        )}
    </div>
  );

  // ── Parse a passage reference like "John 3:16" into nav params ──
  const parsePassageRef = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!match) return null;
    const bookName = match[1].trim();
    const chapter = Number(match[2]);
    const verse = match[3] ? Number(match[3]) : 1;
    return { bookName, chapter, verse };
  };

  // ── History tab ──
  const renderHistoryTab = () => (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
        <GraduationCap className="w-3.5 h-3.5" />
        Historical Context
        {verseResources && (
          <span className="font-normal text-[11px]">
            ({[
              verseResources.commentaries.length && `${verseResources.commentaries.length} commentaries`,
              verseResources.crossReferences.length && `${verseResources.crossReferences.length} cross-refs`,
              verseResources.wordStudies.length && `${verseResources.wordStudies.length} word studies`,
              verseResources.dictionaryTerms.length && `${verseResources.dictionaryTerms.length} dictionary`,
              verseResources.relatedTopics.length && `${verseResources.relatedTopics.length} topics`,
              translationsLoading && "loading translations",
              translations && !translationsLoading && `${translations.length} translations`,
            ].filter(Boolean).join(", ")})
          </span>
        )}
      </p>

      {resourcesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        (verseResources && (
          verseResources.commentaries.length > 0 ||
          verseResources.crossReferences.length > 0 ||
          verseResources.wordStudies.length > 0 ||
          verseResources.dictionaryTerms.length > 0 ||
          verseResources.relatedTopics.length > 0
        )) ||
        (translations && translations.length > 0) ||
        translationsLoading
      ) ? (
        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
          {/* Translation Comparison */}
          {translationsLoading ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Translation Comparison
              </p>
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : translations && translations.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Translation Comparison ({translations.length} versions)
              </p>
              {translations.map((t, i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-black px-1.5 py-0 bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0"
                    >
                      {t.abbreviation}
                    </Badge>
                    <span className="text-[11px] font-medium text-muted-foreground">{t.version}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-6 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : translationsError && !translations ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Translation Comparison
              </p>
              <div className="rounded-xl bg-card border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  No translation data available for this verse.
                </p>
              </div>
            </div>
          ) : null}

          {verseResources.commentaries.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Commentaries</p>
              {verseResources.commentaries.map((c, i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{c.author}</p>
                      <p className="text-[11px] text-muted-foreground italic">{c.title}</p>
                    </div>
                    <button
                      onClick={() => copyCommentary(c.text, c.author, c.title, i)}
                      className="relative shrink-0 w-7 h-7 before:absolute before:content-[''] before:-inset-2 before:rounded-lg rounded-lg flex items-center justify-center transition-colors hover:bg-muted text-muted-foreground/60 hover:text-foreground [touch-action:manipulation]"
                      title="Copy with attribution"
                    >
                      {copiedCommentaryIdx === i ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="w-full h-px bg-border/50 my-2" />
                  <p className="text-sm text-foreground/80 leading-6">{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {verseResources.crossReferences.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cross References</p>
              {verseResources.crossReferences.map((cr, i) => {
                const parsed = parsePassageRef(cr.ref);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (parsed) {
                        navigate(`/bible-reader?book=${encodeURIComponent(parsed.bookName)}&chapter=${parsed.chapter}&verse=${parsed.verse}`);
                      }
                    }}
                    disabled={!parsed}
                    className={cn(
                      "w-full text-left rounded-xl bg-card border border-border p-4 border-l-4 border-l-primary transition-colors",
                      parsed
                        ? "cursor-pointer hover:bg-muted"
                        : "cursor-default opacity-80",
                    )}
                  >
                    <p className="text-sm font-bold text-primary mb-1 flex items-center gap-1.5">
                      {cr.ref}
                      {parsed && (
                        <BookOpen className="w-3 h-3 text-primary/50" />
                      )}
                    </p>
                    <p className="text-sm text-foreground/80 leading-6">{cr.text}</p>
                  </button>
                );
              })}
            </div>
          )}

          {verseResources.wordStudies.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <Hash className="w-3 h-3 inline mr-1" />
                Word Studies ({verseResources.wordStudies.length})
              </p>
              {verseResources.wordStudies.map((ws, i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-amber-500">
                  <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{ws.word}</p>
                    {ws.transliteration && (
                      <p className="text-[11px] italic text-muted-foreground">({ws.transliteration})</p>
                    )}
                    {ws.strongs && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono font-bold px-1.5 py-0 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      >
                        {ws.strongs}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 leading-6">{ws.meaning}</p>
                </div>
              ))}
            </div>
          )}

          {verseResources.dictionaryTerms.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dictionary Terms</p>
              {verseResources.dictionaryTerms.map((dt, i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-emerald-500">
                  <p className="text-sm font-bold text-foreground">{dt.term}</p>
                  {dt.pronunciation && (
                    <p className="text-[11px] text-muted-foreground italic mb-1">{dt.pronunciation}</p>
                  )}
                  <p className="text-sm text-foreground/80 leading-6">{dt.definition}</p>
                  {dt.description && (
                    <p className="text-sm text-muted-foreground leading-6 mt-2">{dt.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {verseResources.relatedTopics.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <Tags className="w-3 h-3 inline mr-1" />
                Related Topics ({verseResources.relatedTopics.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {verseResources.relatedTopics.map((t, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[11px] font-semibold px-2.5 py-1 bg-primary/5 border-primary/20 text-primary"
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-6 text-center">
          <GraduationCap className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No historical context resources available for this passage.
          </p>
        </div>
      )}
    </div>
  );

  // ── Prologue tab ──
  const renderPrologueTab = () => (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
        <BookMarkedIcon className="w-3.5 h-3.5" />
        Book Prologue — {bookName}
      </p>

      {prologueLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : bookPrologue ? (
        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {bookPrologue.author && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Author</p>
              <p className="text-sm font-medium text-foreground">{bookPrologue.author}</p>
            </div>
          )}
          {bookPrologue.audience && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Audience</p>
              <p className="text-sm text-foreground">{bookPrologue.audience}</p>
            </div>
          )}
          {bookPrologue.dateWritten && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Date Written</p>
              <p className="text-sm text-foreground">{bookPrologue.dateWritten}</p>
            </div>
          )}
          {bookPrologue.locationWritten && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-foreground">{bookPrologue.locationWritten}</p>
            </div>
          )}
          {bookPrologue.purpose && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Purpose</p>
              <p className="text-sm text-foreground leading-6">{bookPrologue.purpose}</p>
            </div>
          )}
          {bookPrologue.keyTheme && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Key Theme</p>
              <p className="text-sm font-semibold text-foreground italic">{bookPrologue.keyTheme}</p>
            </div>
          )}
          {bookPrologue.summary && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
              <p className="text-sm text-foreground leading-6">{bookPrologue.summary}</p>
            </div>
          )}
          {bookPrologue.mainThemes && bookPrologue.mainThemes.length > 0 && (
            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Main Themes ({bookPrologue.mainThemes.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bookPrologue.mainThemes.map((theme, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[11px] font-semibold px-2.5 py-1 bg-primary/5 border-primary/20 text-primary"
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {bookPrologue.christConnection && (
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Connection to Christ</p>
              <p className="text-sm text-foreground leading-6">{bookPrologue.christConnection}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-6 text-center">
          <BookMarkedIcon className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No book prologue available for {bookName}. Prologues provide author, date, audience, purpose, and key themes for each book.
          </p>
          {bookName && chapter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseStart || 1}`)}
              className="mt-3 gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open {bookName} {chapter} in Reader
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // ── Tab content router ──
  const renderTabContent = () => {
    switch (learnTab) {
      case "exegesis": return renderExegesisTab();
      case "language": return renderLanguageTab();
      case "history": return renderHistoryTab();
      case "prologue": return renderPrologueTab();
      default: return renderExegesisTab();
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Stage header */}
      <div className="flex flex-col items-center pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-0.5">
          Step 3 of 4
        </p>
        <h2 className="text-lg font-black text-foreground">Learn</h2>
        <p className="text-xs text-muted-foreground">{stageLabel}</p>
        {passageRef && (
          <Badge
            variant="outline"
            className="mt-2 text-[11px] font-bold bg-primary/10 border-primary/20 text-primary gap-1"
          >
            <BookOpen className="w-3 h-3" />
            {passageRef}
          </Badge>
        )}
      </div>

      {renderTabBar()}
      {renderTabContent()}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveProgress}
          disabled={saving}
          className="gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save Progress"}
        </Button>
        <div className="flex-1" />
        <Button onClick={onAdvance} disabled={saving} className="gap-1.5">
          <Heart className="w-4 h-4" />
          Continue to Abide
        </Button>
      </div>
    </div>
  );
}
