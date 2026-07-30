import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookText,
  Brain,
  Copy,
  Check,
  Hash,
  Tags,
  Languages,
  BookMarked as BookMarkedIcon,
  Heart,
  Save,
  ChevronRight as ChevronRightIcon,
  Loader2,
  Globe,
  Lock,
  Sparkles,
  Lightbulb,
  ScrollText,
  Layers,
  Timer,
} from "lucide-react";
import type { StrongsWordData } from "@/services/strongsApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import CathedralArch from "@/components/CathedralArch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LearnStageProps {
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
  isPublic: boolean;
  onUpdate: (updates: Record<string, any>) => void;
  onAdvance: () => void;
  onSaveProgress: () => void;
  onWordTap: (strongsId: string, morphology?: string | null) => void;
  stageLabel: string;
}

type ResourceKey =
  | "language"
  | "translations"
  | "commentaries"
  | "crossRefs"
  | "wordStudies"
  | "dictionary"
  | "topics"
  | "prologue";

interface ResourceButtonProps {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  count?: number;
  tone: "amber" | "blue" | "violet" | "emerald";
  step?: number;
  guide?: string;
  onClick: () => void;
}

function ResourceButton({
  active,
  icon,
  title,
  eyebrow,
  count,
  tone,
  step,
  guide,
  onClick,
}: ResourceButtonProps) {
  const toneClasses = {
    amber: active
      ? "bg-amber-500 text-white border-amber-500 shadow-amber-500/20"
      : "bg-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/15 hover:bg-amber-500/10",
    blue: active
      ? "bg-blue-500 text-white border-blue-500 shadow-blue-500/20"
      : "bg-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-500/15 hover:bg-blue-500/10",
    violet: active
      ? "bg-violet-500 text-white border-violet-500 shadow-violet-500/20"
      : "bg-violet-500/5 text-violet-700 dark:text-violet-300 border-violet-500/15 hover:bg-violet-500/10",
    emerald: active
      ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20"
      : "bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/15 hover:bg-emerald-500/10",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group min-h-[74px] rounded-2xl border p-3 text-left shadow-sm transition-all active:scale-[0.98]",
        toneClasses,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl border transition-colors relative",
          active ? "border-white/20 bg-white/15" : "border-current/10 bg-white/50 dark:bg-background/20",
        )}>
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          {step <= 3 && (
            <span className={cn(
              "px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-wider",
              active ? "bg-white/20 text-white" : step === 1 ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" : "bg-muted/60 text-muted-foreground/60",
            )}>
              {step === 1 ? "Start" : step === 2 ? "Then" : "Next"}
            </span>
          )}
          {count !== undefined && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums",
              active ? "bg-white/20 text-white" : "bg-background/60 text-current",
            )}>
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2">
        <p className={cn("text-[9px] font-black uppercase tracking-[0.18em]", active ? "text-white/70" : "opacity-60")}>
          {eyebrow}
        </p>
        <p className={cn("text-xs font-black leading-tight", active ? "text-white" : "text-foreground")}>
          {title}
        </p>
        <p className={cn(
          "mt-1 text-[8px] font-medium leading-tight",
          active ? "text-white/75" : "text-muted-foreground/60",
        )}>
          {guide}
        </p>
        <p className={cn(
          "mt-1 text-[9px] font-bold uppercase tracking-[0.16em]",
          active ? "text-white/75" : "text-muted-foreground/55",
        )}>
          {active ? "Open now" : "Open"}
        </p>
      </div>
    </button>
  );
}

function EmptyPanel({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background/70 text-muted-foreground/50">
        {icon}
      </div>
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground/70">{message}</p>
    </div>
  );
}

function PanelShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.35rem] border border-border/50 bg-gradient-to-b from-card to-card/75 shadow-sm overflow-hidden">
      <div className="border-b border-border/30 bg-muted/15 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500/70">Research Focus</p>
            <h3 className="mt-0.5 text-base font-black tracking-tight text-foreground">{title}</h3>
          </div>
          <Badge variant="outline" className="rounded-full border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400">
            Focus
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground/70">{subtitle}</p>
      </div>
      <div className="p-3.5">
        {children}
      </div>
    </section>
  );
}

function LoadingPanel({ color = "violet" }: { color?: "amber" | "blue" | "violet" | "emerald" }) {
  const colorClass = {
    amber: "text-amber-500",
    blue: "text-blue-500",
    violet: "text-violet-500",
    emerald: "text-emerald-500",
  }[color];

  return (
    <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card py-10">
      <Loader2 className={cn("h-5 w-5 animate-spin", colorClass)} />
    </div>
  );
}

export default function LearnStage({
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
  isPublic,
  onUpdate,
  onAdvance,
  onSaveProgress,
  onWordTap,
  stageLabel,
}: LearnStageProps) {
  const navigate = useNavigate();
  const focusPanelRef = useRef<HTMLDivElement | null>(null);
  const [copiedCommentaryIdx, setCopiedCommentaryIdx] = useState<number | null>(null);

  const copyCommentary = async (text: string, author: string, title: string, idx: number) => {
    const ref = passageRef || `${bookName} ${chapter}:${verseStart}`;
    const attribution = `${text}\n\n\u2014 ${author}, ${title} (commentary on ${ref})`;
    try {
      await navigator.clipboard.writeText(attribution);
      setCopiedCommentaryIdx(idx);
      setTimeout(() => setCopiedCommentaryIdx(null), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const parsePassageRef = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!match) return null;
    const book = match[1].trim();
    const ch = Number(match[2]);
    const verse = match[3] ? Number(match[3]) : 1;
    return { bookName: book, chapter: ch, verse };
  };

  const resourceButtons: Array<{
    key: ResourceKey;
    title: string;
    eyebrow: string;
    count?: number;
    tone: "amber" | "blue" | "violet" | "emerald";
    icon: React.ReactNode;
    available: boolean;
    step: number;
    guide: string;
  }> = [
    {
      key: "prologue",
      title: "Book Prologue",
      eyebrow: bookName || "Book",
      tone: "emerald",
      icon: <BookMarkedIcon className="h-3.5 w-3.5" />,
      available: true,
      step: 1,
      guide: "Understand the book's context — author, audience, date, and purpose. Start here for the big picture.",
    },
    {
      key: "language",
      title: "Original Language Words",
      eyebrow: "Words",
      count: verseWords.length,
      tone: "amber",
      icon: <BookText className="h-3.5 w-3.5" />,
      available: verseWords.length > 0 || wordsLoading,
      step: 2,
      guide: "Examine key Hebrew & Greek terms. Tap any word to see its lexical data and morphology.",
    },
    {
      key: "translations",
      title: "Translation Comparison",
      eyebrow: "Versions",
      count: translations?.length,
      tone: "blue",
      icon: <Languages className="h-3.5 w-3.5" />,
      available: !!(translations && translations.length > 0) || translationsLoading || translationsError,
      step: 3,
      guide: "Compare how different versions render the same verse. Notice emphasis and interpretive choices.",
    },
    {
      key: "commentaries",
      title: "Commentaries",
      eyebrow: "Sources",
      count: verseResources?.commentaries.length,
      tone: "blue",
      icon: <ScrollText className="h-3.5 w-3.5" />,
      available: !!verseResources?.commentaries.length,
      step: 4,
      guide: "Read trusted scholars on the passage. Copy insights with attribution to your notes.",
    },
    {
      key: "crossRefs",
      title: "Cross References",
      eyebrow: "Scripture",
      count: verseResources?.crossReferences.length,
      tone: "violet",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      available: !!verseResources?.crossReferences.length,
      step: 5,
      guide: "Follow Scripture interpreting Scripture. Click a reference to open it in the reader.",
    },
    {
      key: "wordStudies",
      title: "Word Studies",
      eyebrow: "Lexicon",
      count: verseResources?.wordStudies.length,
      tone: "amber",
      icon: <Hash className="h-3.5 w-3.5" />,
      available: !!verseResources?.wordStudies.length,
      step: 6,
      guide: "Study key terms in depth with transliterations, Strong's numbers, and concise meanings.",
    },
    {
      key: "dictionary",
      title: "Dictionary Terms",
      eyebrow: "Terms",
      count: verseResources?.dictionaryTerms.length,
      tone: "emerald",
      icon: <BookText className="h-3.5 w-3.5" />,
      available: !!verseResources?.dictionaryTerms.length,
      step: 7,
      guide: "Clarify theological and historical terms connected to the passage.",
    },
    {
      key: "topics",
      title: "Related Topics",
      eyebrow: "Themes",
      count: verseResources?.relatedTopics.length,
      tone: "violet",
      icon: <Tags className="h-3.5 w-3.5" />,
      available: !!verseResources?.relatedTopics.length,
      step: 8,
      guide: "Trace broader themes this passage touches across the whole biblical story.",
    },
  ];

  // Sort by step order, then filter available
  const availableResources = resourceButtons
    .filter((resource) => resource.available)
    .sort((a, b) => a.step - b.step);

  const [activeResource, setActiveResource] = useState<ResourceKey>(
    availableResources[0]?.key || "prologue"
  );

  const activeResourceButton = availableResources.find(
    (resource) => resource.key === activeResource
  ) || availableResources[0];

  useEffect(() => {
    if (!activeResourceButton && availableResources[0]) {
      setActiveResource(availableResources[0].key);
    }
  }, [activeResourceButton, availableResources]);

  const openResource = (key: ResourceKey) => {
    setActiveResource(key);
    requestAnimationFrame(() => {
      if (typeof focusPanelRef.current?.scrollIntoView === "function") {
        focusPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  // ── Study Notes (always visible) ──
  const renderStudyNotes = () => (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-violet-500/15 bg-gradient-to-br from-violet-500/10 via-card to-card shadow-sm">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-400/10 blur-2xl" />
      <div className="relative p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:text-violet-300">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500/70">Insight Journal</p>
              <h3 className="text-base font-black tracking-tight text-foreground">Study Notes</h3>
              <p className="text-xs leading-5 text-muted-foreground/70">
                Distill the research into your own words before moving to prayer.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400">
            Always open
          </Badge>
        </div>
        <div className="rounded-2xl border border-border/40 bg-background/60 p-2 shadow-inner dark:bg-background/30">
          <textarea
            value={learnNotes}
            onChange={(e) => onUpdate({ learnNotes: e.target.value })}
            placeholder="Write your study notes, observations, and insights..."
            rows={5}
            className="min-h-[136px] w-full resize-none rounded-xl border-0 bg-transparent p-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </section>
  );

  // ── Original Language Words ──
  const renderLanguageWords = () => (
    <div className="rounded-xl bg-gradient-to-b from-card to-card/80 border border-border/50 shadow-sm overflow-hidden">
      {wordsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
        </div>
      ) : verseWords.length > 0 ? (
        <div className="p-1 space-y-px max-h-72 overflow-y-auto">
          {verseWords.map((w, idx) => {
            const hasStrongs = !!w.strongsId && w.hasData;
            const lang = w.language?.toLowerCase() || '';
            const langIcon = lang === 'greek' ? 'α' : lang === 'hebrew' ? 'א' : lang === 'aramaic' ? '𐡀' : null;
            const langColor = lang === 'greek' ? 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:bg-blue-500/8 dark:border-blue-400/20' : lang === 'hebrew' ? 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/8 dark:border-amber-400/20' : lang === 'aramaic' ? 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400 dark:bg-red-500/8 dark:border-red-400/20' : 'text-muted-foreground bg-muted/50 border-border/30';
            return (
              <div
                key={`${w.verseNumber}-${w.wordOrder}-${idx}`}
                onClick={() => hasStrongs && w.strongsId && onWordTap(w.strongsId, w.morphology)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-all text-sm [touch-action:manipulation]",
                  hasStrongs
                    ? "hover:bg-amber-50/50 dark:hover:bg-amber-950/20 cursor-pointer active:scale-[0.99] group"
                    : "text-muted-foreground/50",
                )}
              >
                {w.verseNumber && (
                  <span className="text-[9px] font-bold text-muted-foreground/30 w-4 shrink-0 text-right font-mono">
                    {w.verseNumber}
                  </span>
                )}
                <span className={cn(
                  "flex-1 font-medium leading-none",
                  hasStrongs ? "text-foreground" : "text-muted-foreground/50",
                )}>
                  {w.surfaceText}
                </span>
                {hasStrongs && w.lemma && (
                  <span className="text-[10px] italic text-amber-600/60 dark:text-amber-400/60 shrink-0 font-medium hidden sm:inline">
                    {w.lemma}
                  </span>
                )}
                {hasStrongs && w.strongsId && (
                  <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0 hidden sm:inline">
                    {w.strongsId}
                  </span>
                )}
                {hasStrongs && langIcon && (
                  <span className={cn(
                    "inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold border shrink-0",
                    langColor,
                  )}>
                    {langIcon}
                  </span>
                )}
                {hasStrongs && w.partOfSpeech && (
                  <span className="text-[8px] font-semibold text-muted-foreground/40 uppercase tracking-wider shrink-0 hidden sm:inline">
                    {w.partOfSpeech}
                  </span>
                )}
                {hasStrongs ? (
                  <div className="w-5 h-5 rounded bg-amber-100/50 dark:bg-amber-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <ChevronRightIcon className="w-3 h-3 text-amber-500/60" />
                  </div>
                ) : (
                  <span className="text-[9px] text-muted-foreground/25 italic shrink-0">no data</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 px-4 text-center">
          <BookText className="w-6 h-6 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            {bookName && chapter
              ? "No Strong's word data available for this passage."
              : "Select a passage to see original language word analysis."}
          </p>
        </div>
      )}
      {verseWords.length > 0 && (
        <div className="px-3 py-1.5 bg-muted/20 border-t border-border/20">
          <p className="text-[9px] text-muted-foreground/50 text-center">
            Tap a word to explore its original meaning
          </p>
        </div>
      )}
    </div>
  );

  // ── Translation Comparison ──
  const renderTranslations = () => {
    if (translationsLoading) {
      return (
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        </div>
      );
    }
    if (translations && translations.length > 0) {
      return (
        <div className="space-y-1.5">
          {translations.map((t, i) => (
            <div key={i} className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm border-l-[3px] border-l-blue-400">
              <div className="flex items-center gap-2 mb-1.5">
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
      );
    }
    if (translationsError && !translations) {
      return (
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <p className="text-xs text-muted-foreground/70">No translation data available for this verse.</p>
        </div>
      );
    }
    return null;
  };

  // ── Commentaries ──
  const renderCommentaries = () => {
    if (!verseResources || verseResources.commentaries.length === 0) return null;
    return (
      <div className="space-y-1.5">
        {verseResources.commentaries.map((c, i) => (
          <div key={i} className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm border-l-[3px] border-l-blue-400">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{c.author}</p>
                <p className="text-[11px] text-muted-foreground italic">{c.title}</p>
              </div>
              <button
                onClick={() => copyCommentary(c.text, c.author, c.title, i)}
                className="relative shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-muted/80 text-muted-foreground/60 hover:text-foreground [touch-action:manipulation] active:scale-90"
                title="Copy with attribution"
              >
                {copiedCommentaryIdx === i ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="w-full h-px bg-border/30 my-2" />
            <p className="text-sm text-foreground/80 leading-6">{c.text}</p>
          </div>
        ))}
      </div>
    );
  };

  // ── Cross References ──
  const renderCrossReferences = () => {
    if (!verseResources || verseResources.crossReferences.length === 0) return null;
    return (
      <div className="space-y-1.5">
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
                "w-full text-left rounded-xl bg-card border border-border/50 p-3.5 shadow-sm border-l-[3px] border-l-violet-400 transition-all",
                parsed
                  ? "cursor-pointer hover:bg-muted/50 active:scale-[0.99]"
                  : "cursor-default opacity-80",
              )}
            >
              <p className="text-sm font-bold text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1.5">
                {cr.ref}
                {parsed && <BookOpen className="w-3 h-3 text-violet-400/50" />}
              </p>
              <p className="text-sm text-foreground/80 leading-6">{cr.text}</p>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Word Studies ──
  const renderWordStudies = () => {
    if (!verseResources || verseResources.wordStudies.length === 0) return null;
    return (
      <div className="space-y-1.5">
        {verseResources.wordStudies.map((ws, i) => (
          <div key={i} className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm border-l-[3px] border-l-amber-400">
            <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
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
    );
  };

  // ── Dictionary Terms ──
  const renderDictionaryTerms = () => {
    if (!verseResources || verseResources.dictionaryTerms.length === 0) return null;
    return (
      <div className="space-y-1.5">
        {verseResources.dictionaryTerms.map((dt, i) => (
          <div key={i} className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm border-l-[3px] border-l-emerald-400">
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
    );
  };

  // ── Related Topics ──
  const renderRelatedTopics = () => {
    if (!verseResources || verseResources.relatedTopics.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {verseResources.relatedTopics.map((t, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-[11px] font-semibold px-2.5 py-1 bg-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400"
          >
            {t.name}
          </Badge>
        ))}
      </div>
    );
  };

  // ── Book Prologue ──
  const renderBookPrologue = () => {
    if (prologueLoading) {
      return (
        <div className="rounded-xl bg-card border border-border/50 p-8 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />
        </div>
      );
    }
    if (!bookPrologue) {
      return (
        <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
          <BookMarkedIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/70 mb-3">
            No book prologue available for {bookName}. Prologues provide author, date, audience, purpose, and key themes.
          </p>
          {bookName && chapter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseStart || 1}`)}
              className="gap-1.5 rounded-xl"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open {bookName} {chapter} in Reader
            </Button>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {bookPrologue.author && (
          <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Author</p>
              <p className="text-sm font-semibold text-foreground">{bookPrologue.author}</p>
            </div>
          </div>
        )}
        {bookPrologue.audience && (
          <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Audience</p>
              <p className="text-sm text-foreground">{bookPrologue.audience}</p>
            </div>
          </div>
        )}
        {(bookPrologue.dateWritten || bookPrologue.locationWritten) && (
          <div className="grid grid-cols-2 gap-2">
            {bookPrologue.dateWritten && (
              <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-sm font-semibold text-foreground">{bookPrologue.dateWritten}</p>
              </div>
            )}
            {bookPrologue.locationWritten && (
              <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm font-semibold text-foreground">{bookPrologue.locationWritten}</p>
              </div>
            )}
          </div>
        )}
        {bookPrologue.purpose && (
          <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Purpose</p>
            </div>
            <p className="text-sm text-foreground leading-6">{bookPrologue.purpose}</p>
          </div>
        )}
        {bookPrologue.keyTheme && (
          <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/20 p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Key Theme</p>
            </div>
            <p className="text-sm font-semibold text-foreground italic">&ldquo;{bookPrologue.keyTheme}&rdquo;</p>
          </div>
        )}
        {bookPrologue.summary && (
          <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ScrollText className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Summary</p>
            </div>
            <p className="text-sm text-foreground leading-6">{bookPrologue.summary}</p>
          </div>
        )}
        {bookPrologue.mainThemes && bookPrologue.mainThemes.length > 0 && (
          <div className="rounded-xl bg-card border border-border/50 p-3.5 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Main Themes &mdash; {bookPrologue.mainThemes.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {bookPrologue.mainThemes.map((theme, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                >
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {bookPrologue.christConnection && (
          <div className="rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/20 p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Connection to Christ</p>
            </div>
            <p className="text-sm text-foreground leading-6">{bookPrologue.christConnection}</p>
          </div>
        )}
      </div>
    );
  };

  const renderActiveResource = () => {
    const key = activeResourceButton?.key || "prologue";

    switch (key) {
      case "language":
        return (
          <PanelShell title="Language Study" subtitle="Tap a Strong's-enabled word to inspect lexical data and morphology.">
            {renderLanguageWords()}
          </PanelShell>
        );
      case "translations":
        return (
          <PanelShell title="Translation Lens" subtitle="Compare wording across versions to notice emphasis, rhythm, and interpretive choices.">
            {renderTranslations() || (
              <EmptyPanel icon={<Languages className="h-5 w-5" />} title="No translations found" message="Translation comparison is not available for this verse yet." />
            )}
          </PanelShell>
        );
      case "commentaries":
        return (
          <PanelShell title="Commentary Desk" subtitle="Read trusted notes with attribution, then capture what helps your interpretation.">
            {resourcesLoading ? <LoadingPanel color="blue" /> : renderCommentaries()}
          </PanelShell>
        );
      case "crossRefs":
        return (
          <PanelShell title="Scripture Links" subtitle="Follow Scripture interpreting Scripture. Click a reference to open it in the reader.">
            {resourcesLoading ? <LoadingPanel color="violet" /> : renderCrossReferences()}
          </PanelShell>
        );
      case "wordStudies":
        return (
          <PanelShell title="Lexicon Notes" subtitle="Study key terms, transliterations, and concise meaning notes.">
            {resourcesLoading ? <LoadingPanel color="amber" /> : renderWordStudies()}
          </PanelShell>
        );
      case "dictionary":
        return (
          <PanelShell title="Term Glossary" subtitle="Clarify theological and historical terms connected to the passage.">
            {resourcesLoading ? <LoadingPanel color="emerald" /> : renderDictionaryTerms()}
          </PanelShell>
        );
      case "topics":
        return (
          <PanelShell title="Theme Map" subtitle="Trace the broader themes this passage touches.">
            {resourcesLoading ? <LoadingPanel color="violet" /> : renderRelatedTopics()}
          </PanelShell>
        );
      case "prologue":
      default:
        return (
          <PanelShell title="Book Background" subtitle={`Read the setting, purpose, and themes of ${bookName || "this book"}.`}>
            {renderBookPrologue()}
          </PanelShell>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      <section className="relative overflow-hidden rounded-[1.6rem] border border-violet-500/15 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_34%),linear-gradient(135deg,rgba(124,58,237,0.12),rgba(59,130,246,0.06),transparent)] shadow-sm">
        <div className="absolute -right-12 top-2 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative px-4 py-4 sm:px-5">
          <CathedralArch />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/20">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
                    Step 3 of 4
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {stageLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/30">
                    <Timer className="w-2.5 h-2.5 text-muted-foreground/50" />
                    <span className="text-[8px] font-semibold text-muted-foreground/60">15–25 min</span>
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Learn</h2>
                <p className="mt-0.5 max-w-md text-xs leading-5 text-muted-foreground/75">
                  Build understanding from the text, original language, background, and connected Scripture.
                </p>
              </div>
            </div>
            {passageRef && (
              <Badge
                variant="outline"
                className="hidden shrink-0 rounded-full border-violet-500/20 bg-background/60 px-3 py-1 text-[10px] font-black text-violet-600 shadow-sm backdrop-blur sm:inline-flex dark:text-violet-300"
              >
                <BookOpen className="mr-1 h-3 w-3" />
                {passageRef}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-border/50 bg-card/70 p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Research Shelf</p>
            <p className="text-sm font-black text-foreground">Follow the numbered steps for a complete study</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/65 leading-relaxed">
              Start with <strong className="text-foreground">Book Prologue</strong> to get the big picture, then work through original language, translations, commentaries, and cross references. Each tool builds on the one before.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full bg-muted/30 px-2.5 py-1 text-[10px] font-bold text-muted-foreground shrink-0">
            {availableResources.length} tools
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {availableResources.map((resource) => (
            <ResourceButton
              key={resource.key}
              active={activeResourceButton?.key === resource.key}
              icon={resource.icon}
              title={resource.title}
              eyebrow={resource.eyebrow}
              count={resource.count}
              tone={resource.tone}
              onClick={() => openResource(resource.key)}
            />
          ))}
        </div>
      </section>

      <div ref={focusPanelRef} className="scroll-mt-3">
        {renderActiveResource()}
      </div>

      {renderStudyNotes()}

      {/* ── PRIVACY TOGGLE ── */}
      <section className="mt-3">
        <button
          onClick={() => onUpdate({ isPublic: !isPublic })}
          className={cn(
            "flex items-center gap-2 p-3 rounded-xl border transition-all active:scale-[0.98] [touch-action:manipulation] w-full",
            isPublic
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-card border-border/50 shadow-sm",
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            isPublic ? "bg-amber-500/10" : "bg-emerald-500/10",
          )}>
            {isPublic ? (
              <Globe className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">
              {isPublic ? "Public" : "Private"}
            </p>
            <p className="text-[9px] text-muted-foreground/60">
              {isPublic
                ? "Anyone with the link can read this study"
                : "Only you can see this study"}
            </p>
          </div>
        </button>
      </section>

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-2 mt-3 pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveProgress}
          disabled={saving}
          className="gap-1.5 h-9 rounded-lg border-border/60 text-[11px] font-semibold flex-1"
        >
          <Save className="w-3 h-3" />
          {saving ? "Saving..." : "Save"}
        </Button>
        <div className="flex-1" />
        <Button
          onClick={onAdvance}
          disabled={saving}
          className="gap-1.5 h-9 text-[11px] font-bold rounded-lg shadow shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 dark:from-violet-500 dark:to-violet-400 text-white border-0"
        >
          <Heart className="w-3.5 h-3.5" />
          Continue to Abide
        </Button>
      </div>

      {/* ── CARRY FORWARD ── */}
      <section className="rounded-xl bg-gradient-to-r from-rose-500/[0.04] to-transparent border border-rose-500/20 p-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-3 h-3 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5">
              What you'll carry forward &rarr; Abide
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your research and study notes will accompany you to the final <strong className="text-foreground">Abide</strong> stage,
              where you'll turn insight into prayer, practical application, and a lasting journal entry.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
