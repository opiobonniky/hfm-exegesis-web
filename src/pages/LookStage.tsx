import { useState, useCallback, useEffect, useRef } from "react";
import {
  BookOpen,
  BookText,
  ChevronRight as ChevronRightIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ear,
  Loader2,
  MessageSquareQuote,
  Play,
  Save,
  Search,
  CheckCheck,
  Sparkles,
  Quote,
  PenLine,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Verse } from "@/services/bibleApi";
import type { StrongsWordData } from "@/services/strongsApi";
import CathedralArch from "@/components/CathedralArch";
import { cn } from "@/lib/utils";

interface LookStageProps {
  lookNotes: string;
  currentPromptIdx: number;
  passageRef: string | null;
  passageVerses: Verse[];
  versesLoading: boolean;
  verseWords: StrongsWordData[];
  wordsLoading: boolean;
  onWordTap: (strongsId: string, morphology?: string | null) => void;
  saving: boolean;
  onUpdate: (updates: Record<string, any>) => void;
  onAdvance: () => void;
  onSaveProgress: () => void;
  stageLabel: string;
  lookPrompts: string[];
}

function parseNotes(raw: string): Record<number, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const map: Record<number, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        const n = Number(k);
        if (!isNaN(n) && typeof v === "string") map[n] = v;
      }
      return map;
    }
  } catch {}
  return { 0: raw };
}

function serializeNotes(map: Record<number, string>): string {
  const keys = Object.keys(map).filter((k) => map[Number(k)].trim());
  if (keys.length === 0) return "";
  if (keys.length === 1 && keys[0] === "0") return map[0];
  return JSON.stringify(map);
}

export default function LookStage({
  lookNotes,
  currentPromptIdx,
  passageRef,
  passageVerses,
  versesLoading,
  verseWords,
  wordsLoading,
  onWordTap,
  saving,
  onUpdate,
  onAdvance,
  onSaveProgress,
  stageLabel,
  lookPrompts,
}: LookStageProps) {
  const [promptNotes, setPromptNotes] = useState<Record<number, string>>(() => parseNotes(lookNotes));
  const [currentText, setCurrentText] = useState(() => parseNotes(lookNotes)[currentPromptIdx] || "");
  const [saved, setSaved] = useState(false);
  const promptNotesRef = useRef(promptNotes);
  promptNotesRef.current = promptNotes;
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const savedFlashRef = useRef<ReturnType<typeof setTimeout>>();

  const syncToParent = useCallback((map: Record<number, string>) => {
    const serialized = serializeNotes(map);
    onUpdate({ lookNotes: serialized });
  }, [onUpdate]);

  const switchPrompt = useCallback((nextIdx: number) => {
    const map = { ...promptNotesRef.current };
    map[currentPromptIdx] = currentText;
    setPromptNotes(map);
    syncToParent(map);
    onSaveProgress?.();
    setCurrentText(map[nextIdx] || "");
    onUpdate({ currentPromptIdx: nextIdx });
  }, [currentPromptIdx, currentText, onUpdate, onSaveProgress, syncToParent]);

  const handleTextChange = useCallback((text: string) => {
    setCurrentText(text);
    setSaved(false);
    clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
      const map = { ...promptNotesRef.current };
      map[currentPromptIdx] = text;
      setPromptNotes(map);
      syncToParent(map);
      setSaved(true);
      clearTimeout(savedFlashRef.current);
      savedFlashRef.current = setTimeout(() => setSaved(false), 2000);
    }, 600);
  }, [currentPromptIdx, syncToParent]);

  useEffect(() => {
    return () => {
      clearTimeout(savedTimerRef.current);
      clearTimeout(savedFlashRef.current);
    };
  }, []);

  const hasAnswer = Object.values(promptNotes).some((n) => n.trim().length > 0);
  const answeredCount = Object.values(promptNotes).filter((n) => n.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-3 pt-2">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-[1.6rem] border border-amber-500/15 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.24),transparent_34%),linear-gradient(135deg,rgba(217,119,6,0.13),rgba(251,191,36,0.06),transparent)] shadow-sm">
        <div className="absolute -right-12 top-2 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative px-4 py-4 sm:px-5">
          <CathedralArch />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 ring-1 ring-white/20">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
                    Step 1 of 4
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {stageLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/30">
                    <Timer className="w-2.5 h-2.5 text-muted-foreground/50" />
                    <span className="text-[8px] font-semibold text-muted-foreground/60">8–12 min</span>
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Look</h2>
                <p className="mt-0.5 max-w-md text-xs leading-5 text-muted-foreground/75">
                  Slow down, read carefully, and name what the passage actually says.
                </p>
              </div>
            </div>
            {passageRef && (
              <Badge
                variant="outline"
                className="hidden shrink-0 rounded-full border-amber-500/20 bg-background/60 px-3 py-1 text-[10px] font-black text-amber-700 shadow-sm backdrop-blur sm:inline-flex dark:text-amber-300"
              >
                <BookOpen className="mr-1 h-3 w-3" />
                {passageRef}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* ── SCRIPTURE ── */}
      {versesLoading ? (
        <div className="flex items-center justify-center py-10 rounded-xl bg-muted/10 border border-border/30" role="status" aria-label="Loading verses">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground/70 ml-2">Reading the passage...</p>
        </div>
      ) : passageVerses.length > 0 ? (
        <section>
          <div className="group relative overflow-hidden rounded-[1.35rem] border border-amber-500/15 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
            <div className="border-b border-border/30 bg-muted/15 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15 dark:text-amber-300">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/70 dark:text-amber-300/70">Observation Text</p>
                  <p className="text-sm font-black text-foreground">Read the passage as one continuous thought</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p
                className="text-[15px] text-foreground/90 leading-7 tracking-wide"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                {passageVerses.map((v, idx) => (
                  <span key={v.verseNumber}>
                    <sup className="text-[9px] font-bold text-amber-500 dark:text-amber-400 mr-px select-none">{v.verseNumber}</sup>
                    {v.text}
                    {idx < passageVerses.length - 1 && ' '}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>
      ) : passageRef ? (
        <section className="mb-3 rounded-xl bg-muted/20 border border-border/40 p-5 text-center">
          <p className="text-sm text-muted-foreground/60">Could not load passage text.</p>
        </section>
      ) : null}

      {/* ── ORIGINAL LANGUAGE WORDS ── */}
      {!wordsLoading && verseWords.length > 0 && (
        <section>
          <div className="rounded-[1.35rem] bg-gradient-to-b from-card to-card/80 border border-border/50 shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-border/30 bg-muted/10">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/15">
                <BookText className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Original Language Words</p>
                <p className="text-[10px] text-muted-foreground/60">{verseWords.length} word{verseWords.length !== 1 ? 's' : ''} available for quick lookup</p>
              </div>
              <Sparkles className="w-3 h-3 text-amber-400/50 ml-auto" />
            </div>
            <div className="p-1 space-y-px max-h-56 overflow-y-auto">
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
            <div className="px-3 py-1.5 bg-muted/20 border-t border-border/20">
              <p className="text-[9px] text-muted-foreground/50 text-center">
                Click a word to explore its original meaning
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── REFLECTION PROMPTS ── */}
      <section>
        <div className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/20 shadow-sm">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 dark:via-amber-500/30 to-transparent" />

          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center ring-1 ring-amber-200/50 dark:ring-amber-700/30">
                <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-[0.15em]">
                    Reflection
                  </span>
                  <span className="text-[9px] text-amber-400/50 dark:text-amber-500/30">/</span>
                  <span className="text-[9px] text-amber-500/60 dark:text-amber-400/50">
                    {stageLabel}
                  </span>
                </div>
              </div>
              {hasAnswer && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/25 shrink-0">
                  <CheckCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {answeredCount}/{lookPrompts.length}
                  </span>
                </div>
              )}
            </div>

            {/* Prompt progress dots */}
            <div className="flex items-center gap-1 mb-2.5">
              {lookPrompts.map((_, idx) => {
                const answered = !!promptNotes[idx]?.trim();
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx !== currentPromptIdx) switchPrompt(idx);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300 [touch-action:manipulation]",
                      idx === currentPromptIdx
                        ? "w-6 bg-amber-500/60 dark:bg-amber-400/60"
                        : answered
                          ? "w-1.5 bg-emerald-400/60 dark:bg-emerald-500/50"
                          : "w-1 bg-amber-300/30 dark:bg-amber-600/20 hover:bg-amber-300/50",
                    )}
                  />
                );
              })}
            </div>

            {/* Quote */}
            <div className="relative mb-3">
              <Quote className="absolute -top-1 -left-0.5 w-4 h-4 text-amber-300/40 dark:text-amber-500/20" />
              <p className="text-sm text-amber-950/80 dark:text-amber-100/85 leading-relaxed italic font-serif pl-5 pr-1">
                {lookPrompts[currentPromptIdx]}
              </p>
            </div>

            {/* Observations */}
            <div className="pt-3 border-t border-amber-200/30 dark:border-amber-800/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <PenLine className="w-3 h-3 text-amber-500/60" />
                  <p className="text-[11px] font-semibold text-foreground">Your Observations</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {saved && (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-right-1 font-medium">
                      <CheckCheck className="w-2.5 h-2.5" />
                      Saved
                    </span>
                  )}
                  {currentText.length > 0 && (
                    <span className="text-[9px] text-muted-foreground/40 font-mono">{currentText.length}</span>
                  )}
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={currentText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Write what you observe in response to the prompt above..."
                  rows={3}
                  className={cn(
                    "w-full rounded-lg border bg-white/60 dark:bg-card/80 text-foreground text-sm p-3 resize-none transition-all",
                    "focus:outline-none focus:ring-2 placeholder:text-muted-foreground/40",
                    currentText.trim()
                      ? "border-amber-200/60 dark:border-amber-800/40 focus:border-amber-400/50 focus:ring-amber-500/10"
                      : "border-border/50 focus:border-primary/50 focus:ring-primary/5",
                  )}
                />
                {currentText.trim() && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <span className="text-[9px] text-amber-500/40 font-medium bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded">
                      Prompt {currentPromptIdx + 1}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-amber-200/30 dark:border-amber-800/20">
              <button
                data-testid="look-prev-prompt"
                onClick={() => {
                  if (currentPromptIdx > 0) switchPrompt(currentPromptIdx - 1);
                }}
                disabled={currentPromptIdx === 0}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-25 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-all [touch-action:manipulation]"
              >
                <ChevronLeft className="w-3 h-3" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                <span className="text-[9px] font-semibold text-muted-foreground/60">Prompt</span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {currentPromptIdx + 1}
                </span>
                <span className="text-amber-300 dark:text-amber-600/40 text-[9px]">/</span>
                <span className="text-[10px] text-amber-400/60 dark:text-amber-500/40">
                  {lookPrompts.length}
                </span>
              </div>

              <button
                data-testid="look-next-prompt"
                onClick={() => {
                  if (currentPromptIdx < lookPrompts.length - 1) switchPrompt(currentPromptIdx + 1);
                }}
                disabled={currentPromptIdx === lookPrompts.length - 1}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-25 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-all [touch-action:manipulation]"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-2 pb-2">
        <Button
          variant="outline"
          onClick={onSaveProgress}
          disabled={saving}
          className="gap-1.5 h-9 rounded-lg border-border/60 text-[11px] font-semibold flex-1"
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={onAdvance}
          disabled={saving}
          className="gap-1.5 h-9 rounded-lg text-[11px] font-bold flex-1 shadow shadow-amber-500/20 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 dark:from-amber-500 dark:to-amber-400 dark:hover:from-amber-600 dark:hover:to-amber-500 text-white border-0"
        >
          Continue
          <Play className="w-3 h-3 fill-current" />
        </Button>
      </div>

      {/* ── CARRY FORWARD ── */}
      <section className="rounded-xl bg-gradient-to-r from-blue-500/[0.04] to-transparent border border-blue-500/20 p-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Ear className="w-3 h-3 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
              What you'll carry forward &rarr; Listen
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your observations will stay with you as you move to the <strong className="text-foreground">Listen</strong> stage,
              where you'll hear the passage repeated and let it sink deep into your heart.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
