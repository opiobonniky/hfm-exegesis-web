import { ArrowLeft, RotateCcw, PartyPopper, Sun, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import StainedGlassQuestion from "@/components/trivia/StainedGlassQuestion";
import GlassResult from "@/components/trivia/GlassResult";
import StreakCalendar from "@/components/trivia/StreakCalendar";
import { DAILY_QUESTIONS_COUNT } from "@/hooks/useDailyChallenge";
import type { DailyChallengeSession } from "@/hooks/useDailyChallenge";

interface Props {
  session: DailyChallengeSession;
  isRtl: boolean;
  consecutiveDays: number;
  todayKey: string;
  onSelect: (index: number) => void;
  onDismiss: () => void;
  onBack: () => void;
  onStart: () => void;
  onReferencePress: (book: string, chapter: number, verse?: number | null) => void;
}

export default function DailyChallengeGame({
  session, isRtl, consecutiveDays, todayKey,
  onSelect, onDismiss, onBack, onStart, onReferencePress,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <div className="p-3 rounded-xl mb-4 border border-amber-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-500">Daily Challenge</p>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/70">
            {session.currentQuestion ? `${session.currentIndex + 1} of ${session.questions.length}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.max(session.questions.length || DAILY_QUESTIONS_COUNT, 0) }, (_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-primary/10" />
          ))}
        </div>
        {consecutiveDays > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Flame className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500">{consecutiveDays}-day streak</span>
          </div>
        )}
      </div>
      {session.loading && !session.currentQuestion && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full border-4 border-primary/15 border-t-primary animate-spin mb-4" />
          <p className="text-sm font-semibold text-muted-foreground/60">Preparing your daily challenge...</p>
        </div>
      )}
      {session.error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm font-semibold text-center max-w-sm text-red-500">{session.error}</p>
          <Button variant="outline" size="sm" onClick={onStart} className="gap-1.5 rounded-xl border-primary/30 text-primary">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}
      {session.phase === "question" && session.currentQuestion && (
        <StainedGlassQuestion question={session.currentQuestion} selectedAnswer={session.selectedAnswer} disabled={false} isRtl={isRtl} onSelect={onSelect} onReferencePress={onReferencePress} />
      )}
      {session.phase === "answered" && session.currentQuestion && session.currentResult && (
        <div>
          <StainedGlassQuestion question={session.currentQuestion} selectedAnswer={session.selectedAnswer} disabled={true} isRtl={isRtl} correctAnswerIndex={session.currentResult.correctAnswer} onSelect={() => {}} onReferencePress={onReferencePress} />
          <GlassResult result={session.currentResult} isRtl={isRtl} onDismiss={onDismiss} />
        </div>
      )}
      {session.phase === "finished" && (
        <div className="flex flex-col items-center pt-4 gap-4">
          <PartyPopper className="w-12 h-12 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-black text-center">Daily Challenge Complete!</h2>
          <p className="text-2xl font-black text-amber-500">{session.score.correct}/{session.score.total}</p>
          <StreakCalendar weekHistory={[]} todayKey={todayKey} isTodayCompleted={true} consecutiveDays={consecutiveDays} />
          <button onClick={onBack} className="inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-bold text-card bg-gradient-to-br from-primary to-primary/80">
            <RotateCcw className="w-4 h-4" /> Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}
