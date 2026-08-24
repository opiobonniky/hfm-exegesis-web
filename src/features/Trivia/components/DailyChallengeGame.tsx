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
      {/* Back button */}
      <button onClick={onBack} className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all hover:bg-muted active:scale-[0.98]" style={{ color: "hsl(var(--primary)/0.7)", border: "1px solid hsl(var(--primary)/0.15)" }}>
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      {/* Progress header */}
      <div className="p-3 rounded-xl mb-4" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))", border: "1px solid rgba(251,191,36,0.2)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em]" style={{ color: "#F59E0B" }}>Daily Challenge</p>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/70">
            {session.currentQuestion ? `${session.currentIndex + 1} of ${session.questions.length}` : ""}
          </p>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.max(session.questions.length || DAILY_QUESTIONS_COUNT, 0) }, (_, i) => {
            const isDone = i < session.answers.length;
            const isCurrent = i === session.currentIndex && session.phase !== "finished";
            const isCorrect = session.answers[i]?.isCorrect;
            return (
              <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: isDone ? (isCorrect ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)") : isCurrent ? "rgba(251,191,36,0.5)" : "hsl(var(--foreground)/0.08)", boxShadow: isCurrent ? "0 0 6px rgba(251,191,36,0.3)" : "none" }} />
            );
          })}
        {consecutiveDays > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Flame className="w-3 h-3" style={{ color: consecutiveDays >= 3 ? "#F59E0B" : "#F59E0B99" }} />
            <span className="text-[10px] font-bold" style={{ color: consecutiveDays >= 3 ? "#F59E0B" : "#F59E0B99" }}>{consecutiveDays}-day streak</span>
        )}
      </div>
      {/* Loading */}
      {session.loading && !session.currentQuestion && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full border-4 animate-spin mb-4" style={{ borderColor: "rgba(251,191,36,0.15)", borderTopColor: "#F59E0B" }} />
          <p className="text-sm font-semibold text-muted-foreground/60">Preparing your daily challenge...</p>
      )}
      {/* Error */}
      {session.error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm font-semibold text-center max-w-sm text-red-500">{session.error}</p>
          <Button variant="outline" size="sm" onClick={onStart} className="gap-1.5 rounded-xl border-primary/30 text-primary"><RotateCcw className="w-3.5 h-3.5" /> Retry</Button>
      {/* Question phase */}
      {session.phase === "question" && session.currentQuestion && (
        <StainedGlassQuestion question={session.currentQuestion} selectedAnswer={session.selectedAnswer} disabled={false} isRtl={isRtl} onSelect={onSelect} onReferencePress={onReferencePress} />
      {/* Answered phase */}
      {session.phase === "answered" && session.currentQuestion && session.currentResult && (
        <div>
          <div className="mb-2">
            <StainedGlassQuestion question={session.currentQuestion} selectedAnswer={session.selectedAnswer} disabled={true} isRtl={isRtl} correctAnswerIndex={session.currentResult.correctAnswer} onSelect={() => {}} onReferencePress={onReferencePress} />
          <GlassResult result={session.currentResult} isRtl={isRtl} onDismiss={onDismiss} />
      {/* Finished phase */}
      {session.phase === "finished" && (
        <div className="flex flex-col items-center pt-4 gap-4 sm:gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ backgroundColor: "#F59E0B" }} />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 30px rgba(251,191,36,0.3)" }}>
              <PartyPopper className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
            </div>
          <h2 className="text-xl sm:text-2xl font-black text-center text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>Daily Challenge Complete!</h2>
          <div className="w-full max-w-xs p-5 sm:p-6 rounded-2xl flex flex-col items-center gap-1" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02))", border: "1px solid rgba(251,191,36,0.2)" }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#F59E0B80" }}>Today's Score</p>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: "#F59E0B" }}>{session.score.correct}/{session.score.total}</p>
            <p className="text-xs font-semibold text-muted-foreground/60">
              {session.score.total > 0 ? Math.round((session.score.correct / session.score.total) * 100) : 0}%
            </p>
          <div className="w-full p-4 rounded-xl" style={{ background: "hsl(var(--foreground)/0.02)", border: "1px solid hsl(var(--foreground)/0.06)" }}>
            <StreakCalendar weekHistory={[]} todayKey={todayKey} isTodayCompleted={true} consecutiveDays={consecutiveDays} />
          <button onClick={onBack} className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-bold text-card transition-all hover:brightness-110 active:scale-[0.98] mt-2 overflow-hidden relative uppercase tracking-wider bg-gradient-to-br from-primary to-primary/80" style={{ boxShadow: "0 0 20px hsl(var(--primary)/0.3), 0 4px 15px hsl(var(--primary)/0.2)" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <RotateCcw className="w-4 h-4" /> Back to Menu
          </button>
    </div>
  );
