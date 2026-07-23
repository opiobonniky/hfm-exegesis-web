import {
  BookOpen,
  BookText,
  ChevronRight as ChevronRightIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MessageSquareQuote,
  Play,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Verse } from "@/services/bibleApi";
import type { StrongsWordData } from "@/services/strongsApi";
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
  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Stage header */}
      <div className="flex flex-col items-center pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
          <Eye className="w-5 h-5 text-primary" />
        </div>
        <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-0.5">
          Step 1 of 4
        </p>
        <h2 className="text-lg font-black text-foreground">Look</h2>
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

      {/* Passage verses display */}
      {versesLoading ? (
        <div className="flex items-center justify-center py-8" role="status" aria-label="Loading verses">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : passageVerses.length > 0 ? (
        <>
          <div className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-primary/40">
            <div className="space-y-3">
              {passageVerses.map((v) => (
                <div key={v.verseNumber} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold flex items-center justify-center mt-0.5">
                    {v.verseNumber}
                  </span>
                  <p className="text-sm text-foreground leading-7">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Original Language Words — clickable Strong's words */}
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookText className="w-3.5 h-3.5" />
              Original Language Words
              {!wordsLoading && verseWords.length > 0 && (
                <span className="font-normal text-[11px]">({verseWords.length} words)</span>
              )}
            </p>

            {wordsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : verseWords.length > 0 ? (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
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
              <p className="text-xs text-muted-foreground text-center py-2">
                No Strong's word data available for this passage.
              </p>
            )}

            {verseWords.length > 0 && (
              <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
                Tap a word to see its original meaning and full explanation.
              </p>
            )}
          </div>
        </>
      ) : passageRef ? (
        <div className="rounded-xl bg-muted border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Could not load passage text.
          </p>
        </div>
      ) : null}

      {/* Prompt card */}
      <div className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-primary">
        <MessageSquareQuote className="w-4 h-4 text-primary mb-2" />
        <p className="text-sm text-foreground font-medium leading-6 italic">
          {lookPrompts[currentPromptIdx]}
        </p>
        <div className="flex items-center justify-between mt-3">
          <button
            data-testid="look-prev-prompt"
            onClick={() =>
              onUpdate({ currentPromptIdx: Math.max(0, currentPromptIdx - 1) })
            }
            disabled={currentPromptIdx === 0}
            className="relative p-1 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full disabled:opacity-30 hover:bg-muted transition-colors [touch-action:manipulation]"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {currentPromptIdx + 1} / {lookPrompts.length}
          </span>
          <button
            data-testid="look-next-prompt"
            onClick={() =>
              onUpdate({
                currentPromptIdx: Math.min(lookPrompts.length - 1, currentPromptIdx + 1),
              })
            }
            disabled={currentPromptIdx === lookPrompts.length - 1}
            className="relative p-1 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full disabled:opacity-30 hover:bg-muted transition-colors [touch-action:manipulation]"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Your Observations */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2">Your Observations</p>
        <textarea
          value={lookNotes}
          onChange={(e) => onUpdate({ lookNotes: e.target.value })}
          placeholder="Write what you observe in this passage..."
          rows={5}
          className="w-full rounded-xl border border-border bg-card text-foreground text-sm p-3 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Save Progress */}
      <div className="flex items-center gap-2">
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
        <Button
          onClick={onAdvance}
          disabled={saving}
          className="gap-1.5"
        >
          <Play className="w-4 h-4 fill-current" />
          Continue to Listen
        </Button>
      </div>
    </div>
  );
}
