import { CheckCircle2, Target, BookOpen, Link, ClipboardList, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Verse { verseNumber: number; text: string; }

interface Props {
  passageRef: string;
  bookName: string;
  chapter: string;
  verseStart: string;
  passageVerses: Verse[];
  challengeText: string;
  setChallengeText: (v: string) => void;
  resultsText: string;
  setResultsText: (v: string) => void;
  saving: boolean;
  onComplete: () => void;
  onOpenBibleReader: () => void;
}

export default function LabApplyStage({
  passageRef, bookName, chapter, verseStart, passageVerses,
  challengeText, setChallengeText, resultsText, setResultsText,
  saving, onComplete, onOpenBibleReader,
}: Props) {
  const verseRange = passageVerses.length === 0 ? null
    : passageVerses[0].verseNumber === passageVerses[passageVerses.length - 1].verseNumber
      ? `v. ${passageVerses[0].verseNumber}`
      : `vv. ${passageVerses[0].verseNumber}–${passageVerses[passageVerses.length - 1].verseNumber}`;

  return (
    <div className="space-y-5">
      {/* Stage header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step 5 of 5</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">~10 min</span>
          </div>
          <h2 className="text-base font-bold text-foreground">Apply — Live It Out</h2>
          <p className="text-xs text-muted-foreground">Choose one practical way to apply this passage to your life this week.</p>
        </div>
      </div>

      {/* Scripture card */}
      {passageVerses.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/10 bg-emerald-500/[0.02]">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-600">
              {passageRef || `${bookName} ${chapter}:${verseStart}`}
            </span>
            {verseRange && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                {verseRange}
              </span>
            )}
          </div>
          <div className="p-4 space-y-1">
            {passageVerses.map((v) => (
              <div key={v.verseNumber} className="flex gap-2">
                <sup className="text-[10px] font-bold text-emerald-500 mt-1 shrink-0">{v.verseNumber}</sup>
                <p className="text-sm leading-7 text-foreground/90">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View in Context */}
      <button onClick={onOpenBibleReader}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-muted/20 transition-colors text-left">
        <Link className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-600 flex-1">View verse in full context</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Challenge Library */}
      <button className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-muted/20 transition-colors text-left">
        <ClipboardList className="w-4 h-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Challenge Library</p>
          <p className="text-[10px] text-muted-foreground">Browse community challenges for this passage</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Your Challenge card */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Your Challenge</p>
            <p className="text-[10px] text-muted-foreground">What specific step will you take this week?</p>
          </div>
        </div>
        <textarea
          value={challengeText}
          onChange={(e) => setChallengeText(e.target.value)}
          placeholder="Write a specific, actionable challenge for yourself..."
          className="w-full px-4 pb-4 text-sm text-foreground bg-transparent resize-none focus:outline-none min-h-[100px]"
        />
      </div>

      {/* My Results card */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">My Results</p>
            <p className="text-[10px] text-muted-foreground">How did it go? What did you learn?</p>
          </div>
        </div>
        <textarea
          value={resultsText}
          onChange={(e) => setResultsText(e.target.value)}
          placeholder="Record your results and insights after following through..."
          className="w-full px-4 pb-4 text-sm text-foreground bg-transparent resize-none focus:outline-none min-h-[100px]"
        />
      </div>

      {/* Complete button */}
      <button onClick={onComplete} disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        Complete Verse Study
      </button>
    </div>
  );
}
