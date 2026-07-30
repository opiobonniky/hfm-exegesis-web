import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  RotateCcw,
  PartyPopper,
  BookOpen,
  Zap,
  Target,
  Sparkles,
  Trophy,
  ArrowLeft,
  XCircle,
  Star,
  Timer,
  Medal,
  Sun,
  Flame,
} from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { useTrivia, DifficultyFilter, type TriviaState } from "@/hooks/useTrivia";
import { useDailyChallenge, DAILY_QUESTIONS_COUNT, type DailyChallengeSession } from "@/hooks/useDailyChallenge";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StarBurst from "@/components/trivia/StarBurst";
import SanctuarySeal, {
  MILESTONE_THRESHOLDS,
} from "@/components/trivia/SanctuarySeal";
import StainedGlassQuestion from "@/components/trivia/StainedGlassQuestion";
import GlassResult from "@/components/trivia/GlassResult";
import AnimatedNumber from "@/components/trivia/AnimatedNumber";
import BadgeCrest from "@/components/trivia/BadgeCrest";
import BadgeUnlockPanel from "@/components/trivia/BadgeUnlockPanel";
import { useBadges, BADGE_DEFINITIONS } from "@/hooks/useBadges";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import StreakCalendar from "@/components/trivia/StreakCalendar";
import SessionLeaderboard from "@/components/trivia/SessionLeaderboard";
import type { TriviaAnswerResult } from "@/services/triviaApi";

// ── Constants ──

// ═══════════════════════════════════════════════════════════════════════════════
//  DIFFICULTY OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const DIFFICULTY_OPTIONS: {
  value: DifficultyFilter;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}[] = [
  {
    value: null,
    label: "All",
    desc: "Mixed challenges",
    icon: Target,
    color: "#6366F1",
  },
  {
    value: "easy",
    label: "Easy",
    desc: "Gentle start",
    icon: Sparkles,
    color: "#22C55E",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Balanced path",
    icon: BookOpen,
    color: "#3B82F6",
  },
  {
    value: "hard",
    label: "Hard",
    desc: "Deep waters",
    icon: Zap,
    color: "#EF4444",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function TriviaPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const {
    phase,
    question,
    selectedAnswer,
    result,
    score,
    stats,
    loading,
    error,
    difficulty,
    totalCount,
    streak,
    questionIdsSeen,
    fetchQuestion,
    answer,
    nextQuestion,
    fetchStats,
    reset,
    setDifficulty,
    startQuiz,
    restoreState,
  } = useTrivia();

  const prevDifficultyRef = useRef(difficulty);

  // ── Session storage keys for state persistence across navigation ──
  const TRIVIA_STORAGE_KEY = "exegesis_trivia_state";
  const DAILY_STORAGE_KEY = "exegesis_daily_session";

  // Refs to hold values from useDailyChallenge / gameMode (avoids TDZ since those hooks are called later)
  const dcRestoreRef = useRef<(s: DailyChallengeSession) => void>(() => {});
  const setGameModeRef = useRef<(m: "normal" | "daily") => void>(() => {});
  const gameModeRef = useRef<"normal" | "daily">("normal");
  const dcSessionRef = useRef<DailyChallengeSession>(null!);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Restore saved state when returning from BibleReader
  useEffect(() => {
    const savedTrivia = sessionStorage.getItem(TRIVIA_STORAGE_KEY);
    const savedDaily = sessionStorage.getItem(DAILY_STORAGE_KEY);
    if (savedTrivia) {
      sessionStorage.removeItem(TRIVIA_STORAGE_KEY);
      try {
        const parsed = JSON.parse(savedTrivia) as TriviaState;
        restoreState(parsed);
      } catch { /* ignore corrupt data */ }
    } else if (savedDaily) {
      sessionStorage.removeItem(DAILY_STORAGE_KEY);
      try {
        const parsed = JSON.parse(savedDaily) as DailyChallengeSession;
        dcRestoreRef.current(parsed);
        setGameModeRef.current("daily");
      } catch { /* ignore corrupt data */ }
    }
  }, [restoreState]);

  // Re-fetch when difficulty changes during game
  useEffect(() => {
    if (prevDifficultyRef.current !== difficulty && phase !== "plan") {
      prevDifficultyRef.current = difficulty;
      fetchQuestion();
    }
    if (phase === "plan") {
      prevDifficultyRef.current = difficulty;
    }
  }, [difficulty, fetchQuestion, phase]);

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedAnswer !== null) return;
      answer(index);
    },
    [answer, selectedAnswer],
  );

  const handleReferencePress = useCallback(
    (bookName: string, chapter: number, verseNumber?: number | null) => {
      const gm = gameModeRef.current;
      const dcs = dcSessionRef.current;
      if (gm === "normal" && phase !== "plan") {
        const triviaState: TriviaState = {
          phase, question, selectedAnswer, result, score, stats,
          loading, error, questionIdsSeen, difficulty, totalCount, streak,
        };
        sessionStorage.setItem(TRIVIA_STORAGE_KEY, JSON.stringify(triviaState));
      } else if (gm === "daily") {
        sessionStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dcs));
      }
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber ?? 1}&ref=trivia`,
      );
    },
    // Only stable / early-declared deps; gameMode/dcSession via refs to avoid TDZ
    [navigate, phase, question, selectedAnswer, result, score, stats, loading, error, difficulty, totalCount, streak, questionIdsSeen],
  );

  // ── Result dismissed state ──
  const [resultDismissed, setResultDismissed] = useState(false);

  const handleDismissResult = useCallback(() => {
    setResultDismissed(true);
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      setResultDismissed(false);
    }
  }, [phase]);

  // ── Auto-advance timer ──
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState<number | null>(null);
  const autoAdvanceRef = useRef<{
    startTime: number;
    duration: number;
    rafId: number;
    timeoutId?: ReturnType<typeof setTimeout>;
  } | null>(null);
  const cancelledRef = useRef(false);

  const cleanupAutoAdvance = useCallback(() => {
    cancelledRef.current = true;
    if (autoAdvanceRef.current) {
      cancelAnimationFrame(autoAdvanceRef.current.rafId);
      clearTimeout(autoAdvanceRef.current.timeoutId);
      autoAdvanceRef.current = null;
    }
    setAutoAdvanceProgress(null);
  }, []);

  const startAutoAdvance = useCallback(() => {
    cleanupAutoAdvance();

    const isCorrect = result?.isCorrect;
    // Correct: 3s auto-advance, Incorrect: 4s auto-advance (give time to read explanation)
    const duration = isCorrect ? 3000 : 4500;

    cancelledRef.current = false;
    const startTime = performance.now();

    const tick = (now: number) => {
      // If manually cancelled, don't do anything
      if (cancelledRef.current) return;

      const elapsed = now - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setAutoAdvanceProgress(progress);

      if (progress >= 100) {
        // Auto-dismiss, then auto-advance for correct answers
        setResultDismissed(true);
        setAutoAdvanceProgress(null);

        if (isCorrect) {
          // Brief pause, then auto-advance to next question
          const tid = setTimeout(() => {
            // Guard: only advance if user hasn't already dismissed
            if (!cancelledRef.current) {
              nextQuestion();
            }
          }, 600);
          if (autoAdvanceRef.current) {
            autoAdvanceRef.current.timeoutId = tid;
          }
        }

        // Clear the ref after scheduling
        if (autoAdvanceRef.current) {
          autoAdvanceRef.current.rafId = 0;
        }
      } else {
        autoAdvanceRef.current = {
          startTime,
          duration,
          rafId: requestAnimationFrame(tick),
        };
      }
    };

    autoAdvanceRef.current = {
      startTime,
      duration,
      rafId: requestAnimationFrame(tick),
    };
  }, [result, cleanupAutoAdvance, nextQuestion]);

  // Start auto-advance when answer result appears
  useEffect(() => {
    if (phase === "answered" && result && !resultDismissed) {
      startAutoAdvance();
    }
    return () => {
      cleanupAutoAdvance();
    };
  }, [phase, result, resultDismissed, startAutoAdvance, cleanupAutoAdvance]);

  // Override handleDismissResult to also cancel auto-advance
  const handleDismissWithCancel = useCallback(() => {
    cleanupAutoAdvance();
    handleDismissResult();
  }, [cleanupAutoAdvance, handleDismissResult]);

  // ── Starburst state (was confetti) ──
  const [showStarBurst, setShowStarBurst] = useState(false);
  const prevStreakRef = useRef(0);

  useEffect(() => {
    if (
      streak >= 3 &&
      prevStreakRef.current < 3 &&
      phase === "answered" &&
      result?.isCorrect
    ) {
      setShowStarBurst(true);
    }
    prevStreakRef.current = streak;
  }, [streak, phase, result]);

  const handleStarBurstFinish = useCallback(() => setShowStarBurst(false), []);

  // ── Milestone state ──
  const [showMilestone, setShowMilestone] = useState(false);
  const prevTotalRef = useRef(0);

  useEffect(() => {
    const current = score.total;
    const prev = prevTotalRef.current;
    if (
      current > 0 &&
      current !== prev &&
      MILESTONE_THRESHOLDS.includes(current) &&
      phase === "answered"
    ) {
      setShowMilestone(true);
    }
    prevTotalRef.current = current;
  }, [score.total, phase]);

  const handleMilestoneFinish = useCallback(() => setShowMilestone(false), []);

  // ── Badge system ──
  const {
    state: badgeState,
    justUnlocked,
    checkNewBadges,
    clearUnlocked,
    getProgress,
  } = useBadges();

  // Check badges after each answer
  const prevResultRef = useRef<TriviaAnswerResult | null>(null);
  useEffect(() => {
    if (phase === "answered" && result && result !== prevResultRef.current) {
      prevResultRef.current = result;
      checkNewBadges({
        totalAnswered: score.total,
        totalCorrect: score.correct,
        streak,
        bookName: question?.bookName || null,
        difficulty: question?.difficulty || null,
        isCorrect: result.isCorrect,
      });
    }
  }, [phase, result, score, streak, question, checkNewBadges]);

  // Badge categories for the plan screen
  const badgeCategories = [
    { label: "Milestones", key: "milestone", color: "#6366F1" },
    { label: "Streak", key: "streak", color: "#F59E0B" },
    { label: "Exploration", key: "exploration", color: "#10B981" },
    { label: "Difficulty", key: "difficulty", color: "#EC4899" },
  ] as const;

  const badgesByCategory = badgeCategories.map((cat) => ({
    ...cat,
    badges: BADGE_DEFINITIONS.filter((b) => b.category === cat.key),
  }));

  // ── Daily Challenge ──
  const {
    session: dcSession,
    isTodayCompleted,
    consecutiveDays,
    todayKey,
    startChallenge,
    submitAnswer: dcSubmitAnswer,
    nextQuestion: dcNextQuestion,
    reset: dcReset,
    getWeekHistory,
    restoreSession: dcRestoreSession,
  } = useDailyChallenge();
  const [gameMode, setGameMode] = useState<"normal" | "daily">("normal");
  gameModeRef.current = gameMode;

  dcRestoreRef.current = dcRestoreSession;
  setGameModeRef.current = setGameMode;
  dcSessionRef.current = dcSession;

  const handleSelectDaily = useCallback(
    (index: number) => {
      if (dcSession.selectedAnswer !== null) return;
      dcSubmitAnswer(index);
    },
    [dcSession.selectedAnswer, dcSubmitAnswer],
  );

  const handleDismissDaily = useCallback(() => {
    dcNextQuestion();
  }, [dcNextQuestion]);

  const startDailyChallenge = useCallback(() => {
    setGameMode("daily");
    startChallenge();
  }, [startChallenge]);

  // Reset daily challenge on return to plan
  useEffect(() => {
    if (dcSession.phase === "finished") {
      // Stay on finish screen until user clicks back
    }
  }, [dcSession.phase]);

  const handleDailyBackToPlan = useCallback(() => {
    setGameMode("normal");
    dcReset();
  }, [dcReset]);

  const weekHistory = getWeekHistory();

  // ── Leaderboard ──
  const {
    state: leaderboardState,
    recordSession,
    getComparison,
    resetLeaderboard,
  } = useLeaderboard();

  // Record session when quiz finishes
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (
      phase === "finished" &&
      prevPhaseRef.current !== "finished" &&
      score.total > 0
    ) {
      recordSession(score.correct, score.total, streak);
    }
    prevPhaseRef.current = phase;
  }, [phase, score, streak, recordSession]);

  const leaderboardComparison = getComparison();

  return (
    <>
      <BadgeUnlockPanel badges={justUnlocked} onClose={clearUnlocked} />
    <div
      className="min-h-screen flex flex-col bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Subtle dot texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header
        className="flex-shrink-0 sticky top-0 z-30"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)/0.95), hsl(var(--background)/0.8))",
          borderBottom: "1px solid hsl(var(--primary)/0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="relative w-9 h-9 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-xl flex items-center justify-center active:scale-[0.93] transition-all [touch-action:manipulation] group"
              style={{
                backgroundColor: "hsl(var(--primary)/0.08)",
                border: "1px solid hsl(var(--primary)/0.2)",
              }}
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
            </button>
            <div>
              <h1
                className="text-base sm:text-lg font-bold tracking-wide leading-none text-foreground"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bible Trivia
              </h1>
              <p className="text-[10px] tracking-widest uppercase leading-none mt-0.5 text-primary/50">
                {difficulty
                  ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} questions`
                  : "All levels"}
              </p>
            </div>
          </div>
          {score.total > 0 && (
            <span
              className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-primary inline-flex items-center gap-0.5"
              style={{
                backgroundColor: "hsl(var(--primary)/0.1)",
                border: "1px solid hsl(var(--primary)/0.25)",
              }}
            >
              <span className="text-green-400">
                <AnimatedNumber value={score.correct} springConfig={{ stiffness: 70, damping: 15 }} />
              </span>
              <span className="mx-0.5 text-primary/30">/</span>
              <AnimatedNumber value={score.total} springConfig={{ stiffness: 70, damping: 15 }} />
            </span>
          )}
        </div>
      </header>

      {/* StarBurst + SanctuarySeal overlays */}
      <StarBurst visible={showStarBurst} onFinish={handleStarBurstFinish} />
      <SanctuarySeal
        visible={showMilestone}
        total={score.total}
        correct={score.correct}
        percentage={
          score.total > 0
            ? Math.round((score.correct / score.total) * 100)
            : 0
        }
        onFinish={handleMilestoneFinish}
      />

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 pb-20">
          {/* ══════════════════════════════════════════════
              DAILY CHALLENGE GAME
             ══════════════════════════════════════════════ */}
          {gameMode === "daily" && (
            <div className="max-w-2xl mx-auto">
              {/* Back button */}
              <button
                onClick={handleDailyBackToPlan}
                className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all hover:bg-muted active:scale-[0.98]"
                style={{
                  color: "hsl(var(--primary)/0.7)",
                  border: "1px solid hsl(var(--primary)/0.15)",
                }}
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>

              {/* Daily progress header */}
              <div
                className="p-3 rounded-xl mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))",
                  border: "1px solid rgba(251,191,36,0.2)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em]" style={{ color: "#F59E0B" }}>
                      Daily Challenge
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground/70">
                    {dcSession.currentQuestion
                      ? `${dcSession.currentIndex + 1} of ${dcSession.questions.length}`
                      : ""}
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.max(dcSession.questions.length || DAILY_QUESTIONS_COUNT, 0) }, (_, i) => {
                    const isDone = i < dcSession.answers.length;
                    const isCurrent = i === dcSession.currentIndex && dcSession.phase !== "finished";
                    const isCorrect = dcSession.answers[i]?.isCorrect;
                    return (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: isDone
                            ? isCorrect
                              ? "rgba(34,197,94,0.6)"
                              : "rgba(239,68,68,0.6)"
                            : isCurrent
                              ? "rgba(251,191,36,0.5)"
                              : "hsl(var(--foreground)/0.08)",
                          boxShadow: isCurrent ? "0 0 6px rgba(251,191,36,0.3)" : "none",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Streak indicator */}
                {consecutiveDays > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="w-3 h-3" style={{ color: consecutiveDays >= 3 ? "#F59E0B" : "#F59E0B99" }} />
                    <span className="text-[10px] font-bold" style={{ color: consecutiveDays >= 3 ? "#F59E0B" : "#F59E0B99" }}>
                      {consecutiveDays}-day streak
                    </span>
                  </div>
                )}
              </div>

              {/* Loading */}
              {dcSession.loading && !dcSession.currentQuestion && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div
                    className="w-12 h-12 rounded-full border-4 animate-spin mb-4"
                    style={{
                      borderColor: "rgba(251,191,36,0.15)",
                      borderTopColor: "#F59E0B",
                    }}
                  />
                  <p className="text-sm font-semibold text-muted-foreground/60">
                    Preparing your daily challenge...
                  </p>
                </div>
              )}

              {/* Error */}
              {dcSession.error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-sm font-semibold text-center max-w-sm text-red-500">
                    {dcSession.error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startDailyChallenge}
                    className="gap-1.5 rounded-xl border-primary/30 text-primary"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Question phase */}
              {dcSession.phase === "question" && dcSession.currentQuestion && (
                <StainedGlassQuestion
                  question={dcSession.currentQuestion}
                  selectedAnswer={dcSession.selectedAnswer}
                  disabled={false}
                  isRtl={isRtl}
                  onSelect={handleSelectDaily}
                  onReferencePress={handleReferencePress}
                />
              )}

              {/* Answered phase */}
              {dcSession.phase === "answered" && dcSession.currentQuestion && dcSession.currentResult && (
                <div>
                  <div className="mb-2">
                    <StainedGlassQuestion
                      question={dcSession.currentQuestion}
                      selectedAnswer={dcSession.selectedAnswer}
                      disabled={true}
                      isRtl={isRtl}
                      correctAnswerIndex={dcSession.currentResult.correctAnswer}
                      onSelect={() => {}}
                      onReferencePress={handleReferencePress}
                    />
                  </div>
                  <GlassResult
                    result={dcSession.currentResult}
                    isRtl={isRtl}
                    onDismiss={handleDismissDaily}
                  />
                </div>
              )}

              {/* Finished phase */}
              {dcSession.phase === "finished" && (
                <div className="flex flex-col items-center pt-4 gap-4 sm:gap-5">
                  {/* Completion icon */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-30"
                      style={{ backgroundColor: "#F59E0B" }}
                    />
                    <div
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        boxShadow: "0 0 30px rgba(251,191,36,0.3)",
                      }}
                    >
                      <PartyPopper className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                    </div>
                  </div>

                  <h2
                    className="text-xl sm:text-2xl font-black text-center text-foreground"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Daily Challenge Complete!
                  </h2>

                  {/* Score card */}
                  <div
                    className="w-full max-w-xs p-5 sm:p-6 rounded-2xl flex flex-col items-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02))",
                      border: "1px solid rgba(251,191,36,0.2)",
                    }}
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#F59E0B80" }}>
                      Today's Score
                    </p>
                    <p className="text-2xl sm:text-3xl font-black" style={{ color: "#F59E0B" }}>
                      {dcSession.score.correct}/{dcSession.score.total}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground/60">
                      {dcSession.score.total > 0
                        ? Math.round((dcSession.score.correct / dcSession.score.total) * 100)
                        : 0}
                      %
                    </p>
                  </div>

                  {/* Streak calendar */}
                  <div
                    className="w-full p-4 rounded-xl"
                    style={{
                      background: "hsl(var(--foreground)/0.02)",
                      border: "1px solid hsl(var(--foreground)/0.06)",
                    }}
                  >
                    <StreakCalendar
                      weekHistory={getWeekHistory()}
                      todayKey={todayKey}
                      isTodayCompleted={true}
                      consecutiveDays={consecutiveDays}
                    />
                  </div>

                  {/* Back to plan */}
                  <button
                    onClick={handleDailyBackToPlan}
                    className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-bold text-card transition-all hover:brightness-110 active:scale-[0.98] mt-2 overflow-hidden relative uppercase tracking-wider [touch-action:manipulation] bg-gradient-to-br from-primary to-primary/80"
                    style={{
                      boxShadow: "0 0 20px hsl(var(--primary)/0.3), 0 4px 15px hsl(var(--primary)/0.2)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <RotateCcw className="w-4 h-4" />
                    Back to Menu
                  </button>
                </div>
              )}
            </div>
          )}

          {gameMode !== "daily" && phase === "plan" ? (
            /* ══════════════════════════════════════════════
                PLAN SCREEN — Cathedral Atrium
               ══════════════════════════════════════════════ */
            <div className="flex flex-col gap-5 sm:gap-6">
              {/* Hero section — Illuminated Manuscript Header */}
<div className="flex items-center gap-3 p-3 bg-background rounded-xl border">
  <BookOpen className="w-10 h-10 text-primary" />
  <div>
    <h2 className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>Bible Trivia</h2>
    <p className="text-sm text-muted-foreground">Test your knowledge of the Scriptures.</p>
  </div>
</div>

              {/* Stats section — Compact Record Badge */}
              {stats && stats.totalAnswered > 0 && (
                <div
                  className="rounded-xl border border-primary/10 p-3"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)/0.04), hsl(var(--primary)/0.01))",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "hsl(var(--primary)/0.1)" }}
                      >
                        <Trophy className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/60 leading-none mb-0.5">
                          Your Record
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground/80 truncate">
                          {stats.correct}<span className="text-muted-foreground/40">/</span>{stats.totalAnswered} correct
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="w-px h-6"
                        style={{ backgroundColor: "hsl(var(--primary)/0.1)" }}
                      />
                      <div className="text-right">
                        <p className="text-lg font-black text-primary leading-none">
                          {stats.totalAnswered > 0
                            ? Math.round((stats.correct / stats.totalAnswered) * 100)
                            : 0}
                          <span className="text-[8px] font-bold text-primary/50 ml-0.5">%</span>
                        </p>
                        <p className="text-[7px] font-bold text-primary/40 uppercase tracking-[0.2em] leading-none mt-0.5">
                          acc
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Badges Section ── */}
              {/* <div
                className="rounded-xl border border-primary/10 p-3"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "hsl(var(--primary)/0.1)" }}
                  >
                    <Medal className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/60 leading-none">
                    Badges
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {badgesByCategory.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-1">
                      {cat.badges.map((badge) => {
                        const unlocked = !!badgeState.badges[badge.id]?.unlocked;
                        const progress = getProgress(badge.id);
                        return (
                          <BadgeCrest
                            key={badge.id}
                            badge={badge}
                            unlocked={unlocked}
                            current={progress.current}
                            target={progress.target}
                            size="xs"
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div> */}

              {/* ── Performance Leaderboard ── */}
              {leaderboardState.bestSession.total > 0 && (
                <SessionLeaderboard
                  comparison={leaderboardComparison!}
                  onReset={resetLeaderboard}
                />
              )}

              {/* ── Daily Challenge ── */}
              <div
                className="rounded-xl border border-primary/10 p-3"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(251,191,36,0.12)" }}
                    >
                      <Sun className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
                    </div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/60 leading-none">
                      Daily Challenge
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {isTodayCompleted ? (
                      <span
                        className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-block"
                        style={{
                          backgroundColor: "rgba(34,197,94,0.12)",
                          color: "#22C55E",
                          border: "1px solid rgba(34,197,94,0.25)",
                        }}
                      >
                        Done
                      </span>
                    ) : (
                      <button
                        onClick={startDailyChallenge}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.97] whitespace-nowrap"
                        style={{
                          background: "linear-gradient(135deg, #F59E0B, #D97706)",
                          color: "#FFF",
                          boxShadow: "0 2px 8px rgba(251,191,36,0.3)",
                        }}
                      >
                        <Sun className="w-3 h-3" />
                        Start
                      </button>
                    )}
                  </div>
                </div>

                <StreakCalendar
                  weekHistory={weekHistory}
                  todayKey={todayKey}
                  isTodayCompleted={isTodayCompleted}
                  consecutiveDays={consecutiveDays}
                />
              </div>

              {/* Difficulty selection — "Choose Your Path" */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3 h-3 text-primary/50" />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                    Choose your path
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = difficulty === opt.value;

                    return (
                      <button
                        key={opt.value ?? "all"}
                        onClick={() => setDifficulty(opt.value)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all active:scale-[0.97] [touch-action:manipulation]"
                        style={{
                          borderColor: isSelected ? opt.color : "hsl(var(--foreground)/0.06)",
                          backgroundColor: isSelected ? `${opt.color}15` : "hsl(var(--foreground)/0.02)",
                          boxShadow: isSelected ? `0 0 12px ${opt.color}12` : "none",
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isSelected ? opt.color : `${opt.color}12`,
                          }}
                        >
                          <IconComp
                            className="w-3.5 h-3.5"
                            style={(opt as any).color !== undefined ? { color: isSelected ? "#0f0f2e" : (opt as any).color } : undefined}
                          />
                        </div>
                        <div className="text-left min-w-0">
                          <p
                            className="text-[10px] font-extrabold leading-tight"
                            style={{ color: isSelected ? opt.color : "hsl(var(--foreground))" }}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[8px] font-semibold text-muted-foreground/50 leading-tight truncate">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Quiz — Gilded Seal */}
              <button
                onClick={startQuiz}
                className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-card transition-all hover:brightness-110 active:scale-[0.98] overflow-hidden [touch-action:manipulation] tracking-wider uppercase bg-gradient-to-br from-primary to-primary/80"
                style={{
                  boxShadow: "0 0 30px hsl(var(--primary)/0.3), 0 4px 20px hsl(var(--primary)/0.2)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Play className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-current" />
                Begin Quest
              </button>

              <p
                className="text-[10px] sm:text-[11px] text-center leading-5 px-4 sm:px-8 pb-2 text-muted-foreground/40"
              >
                Questions are drawn from across the Bible. Tap a scripture
                reference to read the passage before answering.
              </p>
            </div>
          ) : (
            /* ══════════════════════════════════════════════
                GAME SCREEN — Chapter Room
               ══════════════════════════════════════════════ */
            <div className="max-w-2xl mx-auto">
              {/* Difficulty filter chips — Stained Glass Tabs */}
              <div
                className="p-2 rounded-xl mb-4"
                style={{
                  background: "hsl(var(--foreground)/0.02)",
                  border: "1px solid hsl(var(--foreground)/0.06)",
                }}
              >
                <p className="px-3 pt-1 pb-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/50">
                  Difficulty
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  {(["all", "easy", "medium", "hard"] as const).map((d) => {
                    const isActive =
                      d === "all" ? difficulty === null : difficulty === d;
                    const chipColor =
                      d === "easy"
                        ? "#22C55E"
                        : d === "hard"
                          ? "#EF4444"
                          : d === "medium"
                            ? "#3B82F6"
                            : "hsl(var(--primary))";

                    return (
                      <button
                        key={d}
                        onClick={() =>
                          setDifficulty(d === "all" ? null : d)
                        }
                        className={cn(
                          "flex-1 min-h-[40px] py-2 rounded-xl text-[10px] font-extrabold text-center transition-all border active:scale-[0.97] uppercase tracking-wider [touch-action:manipulation]",
                        )}
                        style={{
                          backgroundColor: isActive ? `${chipColor}18` : "hsl(var(--foreground)/0.03)",
                          borderColor: isActive ? `${chipColor}40` : "hsl(var(--foreground)/0.06)",
                          color: isActive ? chipColor : "hsl(var(--muted-foreground)/0.5)",
                          boxShadow: isActive ? `0 0 15px ${chipColor}15` : "none",
                        }}
                      >
                        {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress — Pilgrim's Path */}
              {totalCount > 0 && (
                <div className="mb-4">
                  <div
                    className={cn(
                      "flex items-center justify-between mb-1.5",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-muted-foreground/70">
                        Question {score.total + 1} of {totalCount}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-primary/30" />
                      <p className="text-[10px] font-medium text-muted-foreground/50">
                        {difficulty
                          ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                          : "All"}
                      </p>
                    </div>
                    <p className="text-[10px] font-extrabold text-primary">
                      {Math.round((score.total / totalCount) * 100)}%
                    </p>
                  </div>
                  {/* Progress bar — Guilded path */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: "hsl(var(--foreground)/0.04)",
                      border: "1px solid hsl(var(--primary)/0.1)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary/80"
                      style={{
                        width: `${(score.total / totalCount) * 100}%`,
                        boxShadow: "0 0 8px hsl(var(--primary)/0.3)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && !question && (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full border-4 animate-spin mb-4"
                      style={{
                        borderColor: "hsl(var(--primary)/0.15)",
                        borderTopColor: "hsl(var(--primary))",
                      }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground/60">
                    Loading question...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                  >
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-center max-w-sm text-red-500">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQuestion}
                    className="gap-1.5 rounded-xl border-primary/30 text-primary"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Playing */}
              {phase === "playing" && question && (
                <div>
                  <StainedGlassQuestion
                    question={question}
                    selectedAnswer={selectedAnswer}
                    disabled={false}
                    isRtl={isRtl}
                    onSelect={handleSelect}
                    onReferencePress={handleReferencePress}
                  />
                  <div className="flex items-center justify-center mt-3">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: "hsl(var(--foreground)/0.03)",
                        border: "1px solid hsl(var(--foreground)/0.06)",
                      }}
                    >
                      <Target className="w-3 h-3 text-primary/40" />
                      <p className="text-[9px] font-semibold text-muted-foreground/50">
                        Tap an option to answer
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Answered */}
              {phase === "answered" && question && result && (
                <div>
                  <div className="mb-2">
                    <StainedGlassQuestion
                      question={question}
                      selectedAnswer={selectedAnswer}
                      disabled={true}
                      isRtl={isRtl}
                      correctAnswerIndex={result?.correctAnswer}
                      onSelect={() => {}}
                      onReferencePress={handleReferencePress}
                    />
                  </div>

                  {/* Streak — Spark indicator */}
                  {streak >= 2 && (
                    <div
                      className={cn(
                        "flex items-center justify-center gap-1.5 mb-3 py-2 px-4 rounded-xl self-center mx-auto w-fit border",
                        isRtl && "flex-row-reverse",
                      )}
                      style={{
                        backgroundColor: streak >= 3
                          ? "hsl(var(--primary)/0.08)"
                          : "hsl(var(--primary)/0.04)",
                        borderColor: streak >= 3
                          ? "hsl(var(--primary)/0.3)"
                          : "hsl(var(--primary)/0.15)",
                        boxShadow: streak >= 3
                          ? "0 0 15px hsl(var(--primary)/0.15)"
                          : "none",
                      }}
                    >
                      <Star
                        className="w-4 h-4"
                        style={{
                          color: streak >= 3 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.6)",
                        }}
                        fill={streak >= 3 ? "hsl(var(--primary))" : "transparent"}
                      />
                      <p
                        className="text-xs font-extrabold"
                        style={{
                          color: streak >= 3 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.7)",
                        }}
                      >
                        {streak} in a row{streak >= 3 ? " ✦" : ""}
                      </p>
                    </div>
                  )}

                  {/* Result area */}
                  <div className="min-h-[160px]">
                    {!resultDismissed && (
                      <GlassResult
                        result={result}
                        isRtl={isRtl}
                        autoAdvanceProgress={autoAdvanceProgress}
                        onDismiss={handleDismissWithCancel}
                      />
                    )}

                    {/* Next button — shown after dismiss */}
                    {resultDismissed && (
                      <div className="space-y-2">
                        {/* Auto-advance countdown indicator (after dismiss, before next question) */}
                        {result?.isCorrect && autoAdvanceProgress != null && autoAdvanceProgress >= 100 && (
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground/50 animate-pulse">
                            <Timer className="w-3 h-3" />
                            Advancing to next question...
                          </div>
                        )}
                        <button
                          onClick={nextQuestion}
                          className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-extrabold text-card transition-all hover:brightness-110 active:scale-[0.98] overflow-hidden relative uppercase tracking-wider [touch-action:manipulation] bg-gradient-to-br from-primary to-primary/80"
                          style={{
                            boxShadow: "0 0 20px hsl(var(--primary)/0.3), 0 4px 15px hsl(var(--primary)/0.2)",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          <Play className="w-4 h-4 fill-current" />
                          Next Question
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Finished */}
              {phase === "finished" && (
                <div className="flex flex-col items-center pt-6 sm:pt-10 gap-4 sm:gap-5">
                  {/* Illuminated finish crest */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
                      style={{ backgroundColor: "hsl(var(--primary))" }}
                    />
                    <div
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-primary to-primary/80"
                      style={{
                        boxShadow: "0 0 30px hsl(var(--primary)/0.3)",
                      }}
                    >
                      <PartyPopper className="w-9 h-9 sm:w-11 sm:h-11 text-card" />
                    </div>
                  </div>
                  <h2
                    className="text-xl sm:text-2xl font-black text-center text-foreground"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    All Questions Completed!
                  </h2>
                  <p
                    className="text-sm text-center max-w-sm leading-relaxed text-muted-foreground/70"
                  >
                    You've answered every available question. Come back later for
                    more!
                  </p>

                  {/* Final score */}
                  <div
                    className="w-full max-w-xs p-5 sm:p-6 rounded-2xl flex flex-col items-center gap-1 border-primary/15"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--primary)/0.02))",
                    }}
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary/50">
                      Final Score
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-primary inline-flex items-center gap-1">
                      <AnimatedNumber value={score.correct} springConfig={{ stiffness: 60, damping: 15 }} />
                      <span className="text-primary/40">/</span>
                      <AnimatedNumber value={score.total} springConfig={{ stiffness: 60, damping: 15 }} />
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground/60">
                      {score.total > 0
                        ? Math.round((score.correct / score.total) * 100)
                        : 0}
                      %
                    </p>
                  </div>

                  {/* Leaderboard comparison */}
                  {leaderboardComparison &&
                    leaderboardState.bestSession.total > 0 && (
                      <div className="w-full max-w-xs">
                        <SessionLeaderboard
                          comparison={leaderboardComparison}
                        />
                      </div>
                    )}

                  {/* Lifetime stats */}
                  {stats && stats.totalAnswered > score.total && (
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        backgroundColor: "hsl(var(--foreground)/0.03)",
                        border: "1px solid hsl(var(--foreground)/0.06)",
                      }}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-primary/40" />
                      <p className="text-[10px] font-semibold text-muted-foreground/60">
                        Lifetime: {stats.correct}/{stats.totalAnswered} (
                        {stats.percentage}%)
                      </p>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-bold text-card transition-all hover:brightness-110 active:scale-[0.98] mt-2 overflow-hidden relative uppercase tracking-wider [touch-action:manipulation] bg-gradient-to-br from-primary to-primary/80"
                    style={{
                      boxShadow: "0 0 20px hsl(var(--primary)/0.3), 0 4px 15px hsl(var(--primary)/0.2)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
