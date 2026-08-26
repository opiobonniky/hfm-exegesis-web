/**
 * useTriviaPage — comprehensive hook that wraps all trivia sub-hooks.
 * Provides ALL state + handlers needed by TriviaPage components.
 * The page should have zero useState/useEffect — only this hook.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { useTrivia, type TriviaState } from "@/hooks/useTrivia";
import { useDailyChallenge, type DailyChallengeSession } from "@/hooks/useDailyChallenge";
import { routes } from "@/components/Routes/routes";
import { useBadges } from "@/hooks/useBadges";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { TRIVIA_STORAGE_KEY, DAILY_STORAGE_KEY, MILESTONE_THRESHOLDS } from "../constants";

export function useTriviaPage() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const {
    phase, question, selectedAnswer, result, score, stats, loading, error,
    difficulty, totalCount, streak, questionIdsSeen,
    fetchQuestion, answer, nextQuestion, fetchStats, reset, setDifficulty, startQuiz, restoreState,
  } = useTrivia();
  const prevDifficultyRef = useRef(difficulty);
  const { session: dcSession, isTodayCompleted, consecutiveDays, todayKey,
    startChallenge, submitAnswer: dcSubmitAnswer, nextQuestion: dcNextQuestion,
    reset: dcReset, getWeekHistory, restoreSession: dcRestoreSession,
  } = useDailyChallenge();
  const [gameMode, setGameMode] = useState<"normal" | "daily">("normal");
  const [resultDismissed, setResultDismissed] = useState(false);
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState<number | null>(null);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const autoAdvanceRef = useRef<{ startTime: number; duration: number; rafId: number; timeoutId?: ReturnType<typeof setTimeout> } | null>(null);
  const cancelledRef = useRef(false);
  const gameModeRef = useRef<"normal" | "daily">("normal");
  const dcSessionRef = useRef<DailyChallengeSession>(dcSession);
  const prevStreakRef = useRef(0);
  const prevTotalRef = useRef(0);
  const prevPhaseRef = useRef(phase);

  // Keep refs in sync
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { dcSessionRef.current = dcSession; }, [dcSession]);

  const { state: badgeState, justUnlocked, checkNewBadges, clearUnlocked, getProgress } = useBadges();
  const prevResultRef = useRef<any>(null);
  const { state: leaderboardState, recordSession, getComparison, resetLeaderboard } = useLeaderboard();
  const weekHistory = getWeekHistory();
  const leaderboardComparison = getComparison();

  // EFFECTS
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Restore saved state on mount
  useEffect(() => {
    const savedTrivia = sessionStorage.getItem(TRIVIA_STORAGE_KEY);
    const savedDaily = sessionStorage.getItem(DAILY_STORAGE_KEY);
    if (savedTrivia) {
      sessionStorage.removeItem(TRIVIA_STORAGE_KEY);
      try { restoreState(JSON.parse(savedTrivia) as TriviaState); } catch {}
    } else if (savedDaily) {
      sessionStorage.removeItem(DAILY_STORAGE_KEY);
      try {
        const p = JSON.parse(savedDaily) as DailyChallengeSession;
        dcRestoreSession(p);
        setGameMode("daily");
      } catch {}
    }
  }, [restoreState, dcRestoreSession]);

  // Re-fetch when difficulty changes during game
  useEffect(() => {
    if (prevDifficultyRef.current !== difficulty && phase !== "plan") { prevDifficultyRef.current = difficulty; fetchQuestion(); }
    if (phase === "plan") prevDifficultyRef.current = difficulty;
  }, [difficulty, fetchQuestion, phase]);

  // Reset result dismissed when entering playing phase
  useEffect(() => { if (phase === "playing") setResultDismissed(false); }, [phase]);

  // Starburst on 3+ streak
  useEffect(() => {
    if (streak >= 3 && prevStreakRef.current < 3 && phase === "answered" && result?.isCorrect) setShowStarBurst(true);
    prevStreakRef.current = streak;
  }, [streak, phase, result]);

  // Milestone detection
  useEffect(() => {
    const cur = score.total;
    if (cur > 0 && cur !== prevTotalRef.current && MILESTONE_THRESHOLDS.includes(cur) && phase === "answered") setShowMilestone(true);
    prevTotalRef.current = cur;
  }, [score.total, phase]);

  // Check badges after each answer
  useEffect(() => {
    if (phase === "answered" && result && result !== prevResultRef.current) {
      prevResultRef.current = result;
      checkNewBadges({
        totalAnswered: score.total, totalCorrect: score.correct, streak,
        bookName: question?.bookName || null, difficulty: question?.difficulty || null, isCorrect: result.isCorrect,
      });
    }
  }, [phase, result, score, streak, question, checkNewBadges]);

  // Record session on quiz finish
  useEffect(() => {
    if (phase === "finished" && prevPhaseRef.current !== "finished" && score.total > 0) recordSession(score.correct, score.total, streak);
    prevPhaseRef.current = phase;
  }, [phase, score, streak, recordSession]);

  // AUTO-ADVANCE
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
    const duration = result?.isCorrect ? 3000 : 4500;
    cancelledRef.current = false;
    const startTime = performance.now();
    const tick = (now: number) => {
      if (cancelledRef.current) return;
      const progress = Math.min(((now - startTime) / duration) * 100, 100);
      setAutoAdvanceProgress(progress);
      if (progress >= 100) {
        setResultDismissed(true);
        setAutoAdvanceProgress(null);
        if (result?.isCorrect && autoAdvanceRef.current) {
          autoAdvanceRef.current.timeoutId = setTimeout(() => { if (!cancelledRef.current) nextQuestion(); }, 600);
        }
        if (autoAdvanceRef.current) autoAdvanceRef.current.rafId = 0;
      } else { autoAdvanceRef.current = { startTime, duration, rafId: requestAnimationFrame(tick) }; }
    };
    autoAdvanceRef.current = { startTime, duration, rafId: requestAnimationFrame(tick) };
  }, [result, cleanupAutoAdvance, nextQuestion]);

  useEffect(() => {
    if (phase === "answered" && result && !resultDismissed) startAutoAdvance();
    return () => { cleanupAutoAdvance(); };
  }, [phase, result, resultDismissed, startAutoAdvance, cleanupAutoAdvance]);

  // HANDLERS
  const handleSelect = useCallback((index: number) => { if (selectedAnswer !== null) return; answer(index); }, [answer, selectedAnswer]);
  const handleSelectDaily = useCallback((index: number) => { if (dcSession.selectedAnswer !== null) return; dcSubmitAnswer(index); }, [dcSession.selectedAnswer, dcSubmitAnswer]);
  const handleDismissDaily = useCallback(() => { dcNextQuestion(); }, [dcNextQuestion]);
  const startDailyChallenge = useCallback(() => { setGameMode("daily"); startChallenge(); }, [startChallenge]);
  const handleDailyBackToPlan = useCallback(() => { setGameMode("normal"); dcReset(); }, [dcReset]);
  const handleDismissWithCancel = useCallback(() => { cleanupAutoAdvance(); setResultDismissed(true); }, [cleanupAutoAdvance]);

  const handleReferencePress = useCallback((bookName: string, chapter: number, verseNumber?: number | null) => {
    const gm = gameModeRef.current;
    const dcs = dcSessionRef.current;
    if (gm === "normal" && phase !== "plan") {
      sessionStorage.setItem(TRIVIA_STORAGE_KEY, JSON.stringify({ phase, question, selectedAnswer, result, score, stats, loading, error, questionIdsSeen, difficulty, totalCount, streak }));
    } else if (gm === "daily") {
      sessionStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dcs));
    }
    navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber ?? 1}&ref=trivia`);
  }, [navigate, phase, question, selectedAnswer, result, score, stats, loading, error, difficulty, totalCount, streak, questionIdsSeen]);

  // RETURN
  return {
    // Core state
    navigate, isRtl, phase, question, selectedAnswer, result, score, stats,
    loading, error, difficulty, totalCount, streak,
    // Game mode
    gameMode, resultDismissed, autoAdvanceProgress, showStarBurst, showMilestone,
    // Daily challenge
    dcSession, isTodayCompleted, consecutiveDays, todayKey, weekHistory,
    // Badges
    badgeState, justUnlocked, clearUnlocked, getProgress,
    // Leaderboard
    leaderboardState, leaderboardComparison, resetLeaderboard,
    // Actions
    setDifficulty, startQuiz, fetchQuestion, reset, nextQuestion: () => nextQuestion(),
    handleSelect, handleSelectDaily, handleDismissDaily,
    startDailyChallenge, handleDailyBackToPlan,
    handleDismissWithCancel, handleReferencePress,
    setShowStarBurst, setShowMilestone,
  };
}
