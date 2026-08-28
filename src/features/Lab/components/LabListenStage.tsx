import { Ear, Play, Pause, RotateCcw, SkipForward, Volume2, CheckCircle2, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LISTEN_OPTIONS } from "@/hooks/useLabFlow";

interface Verse { verseNumber: number; text: string; }

interface Props {
  passageRef: string;
  bookName: string;
  chapter: string;
  passageVerses: Verse[];
  selectedRepeats: number;
  setSelectedRepeats: (v: number) => void;
  repeatCount: number;
  listenComplete: boolean;
  saving: boolean;
  onStart: () => void;
  onAdvance: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export default function LabListenStage({
  passageRef, bookName, chapter, passageVerses, selectedRepeats, setSelectedRepeats,
  repeatCount, listenComplete, saving, onStart, onAdvance, onReset, onSkip,
}: Props) {
  const selectedLabel = LISTEN_OPTIONS.find((o) => o.value === selectedRepeats)?.label || `${selectedRepeats}x`;

  return (
    <div className="space-y-5">
      {/* Stage header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Ear className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step 2 of 5</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold">~5 min</span>
          </div>
          <h2 className="text-base font-bold text-foreground">Listen — Hear the Word</h2>
          <p className="text-xs text-muted-foreground">Be still and dwell in the Word. Let Scripture sink into your heart.</p>
        </div>
      </div>

      {/* Passage card */}
      {passageVerses.length > 0 && (
        <div className="rounded-xl border border-purple-500/20 bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">{passageRef || `${bookName} ${chapter}`}</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {passageVerses.map((v) => (
              <div key={v.verseNumber} className="flex gap-2">
                <sup className="text-[10px] font-bold text-purple-500 mt-1 shrink-0">{v.verseNumber}</sup>
                <p className="text-sm leading-6 text-foreground/80">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!listenComplete ? (
        <>
          {/* Repeat picker */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-3">How many times should we read?</p>
            <div className="grid grid-cols-5 gap-2">
              {LISTEN_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSelectedRepeats(opt.value)}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-bold transition-all",
                    selectedRepeats === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/40"
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {repeatCount > 0 && (
            <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Read <span className="font-bold text-foreground">{repeatCount}</span> of <span className="font-bold text-foreground">{selectedRepeats}</span> times
              </p>
              <div className="w-full h-2 bg-muted/30 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(repeatCount / selectedRepeats) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Audio controls */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={onStart}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all">
              <Play className="w-5 h-5" />
              {repeatCount > 0 ? `Resume (${selectedLabel})` : `Begin Listening (${selectedLabel})`}
            </button>
          </div>

          {/* Stage navigation */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={onSkip}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              <SkipForward className="w-3.5 h-3.5" /> Skip to Learn
            </button>
          </div>
        </>
      ) : (
        /* Completed view */
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Amen! 🙏</h3>
          <p className="text-sm text-muted-foreground">You've dwelled in the Word {repeatCount} time{repeatCount !== 1 ? "s" : ""}.</p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button onClick={onAdvance} disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Continue to Learn
            </button>
            <button onClick={onStart}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors">
              <Play className="w-4 h-4" /> Replay Passage
            </button>
            <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground">
              Change reading times
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
