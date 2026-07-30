import { useState, useCallback, useRef } from "react";
import {
  getRandomQuestion,
  submitTriviaAnswer,
  type TriviaQuestionResponse,
  type TriviaAnswerResult,
} from "@/services/triviaApi";

// ── Constants ──

const STORAGE_KEY = "exegesis_daily_challenge";
export const DAILY_QUESTIONS_COUNT = 5;

// ── Types ──

export interface DailyChallengeEntry {
  completed: boolean;
  score: { correct: number; total: number };
}

interface DailyChallengeState {
  history: Record<string, DailyChallengeEntry>; // key: "2026-07-28"
  lastUpdatedDate: string;
  consecutiveDays: number;
}

export interface DailyChallengeSession {
  questions: TriviaQuestionResponse[];
  currentIndex: number;
  answers: { questionId: number; isCorrect: boolean }[];
  score: { correct: number; total: number };
  phase: "loading" | "question" | "answered" | "finished";
  currentQuestion: TriviaQuestionResponse | null;
  currentResult: TriviaAnswerResult | null;
  selectedAnswer: number | null;
  loading: boolean;
  error: string | null;
}

// ── Helpers ──

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => getDateNDaysAgo(6 - i));
}

export function getDayLabel(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
}

function loadState(): DailyChallengeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate shape
      if (parsed && typeof parsed === "object" && parsed.history) {
        return parsed as DailyChallengeState;
      }
    }
  } catch {
    // Corrupted data — reset
  }
  return { history: {}, lastUpdatedDate: "", consecutiveDays: 0 };
}

function saveState(state: DailyChallengeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail
  }
}

function recomputeStreak(state: DailyChallengeState): number {
  let streak = 0;
  const today = getTodayKey();
  // Check today first (may be incomplete)
  if (state.history[today]?.completed) {
    streak = 1;
  } else {
    // Don't count today if not completed
    // Start from yesterday
    let checkDate = getDateNDaysAgo(1);
    while (state.history[checkDate]?.completed) {
      streak++;
      checkDate = getDateNDaysAgo(streak + 1);
    }
    return streak;
  }

  // Count backwards from yesterday
  let daysBack = 1;
  while (true) {
    const dateKey = getDateNDaysAgo(daysBack);
    if (state.history[dateKey]?.completed) {
      streak++;
      daysBack++;
    } else {
      break;
    }
  }

  return streak;
}

// ── Hook ──

export function useDailyChallenge() {
  const [savedState, setSavedState] = useState<DailyChallengeState>(loadState);
  const savedRef = useRef(savedState);
  savedRef.current = savedState;

  const [session, setSession] = useState<DailyChallengeSession>({
    questions: [],
    currentIndex: 0,
    answers: [],
    score: { correct: 0, total: 0 },
    phase: "loading",
    currentQuestion: null,
    currentResult: null,
    selectedAnswer: null,
    loading: false,
    error: null,
  });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const todayKey = getTodayKey();
  const todayEntry = savedState.history[todayKey];
  const isTodayCompleted = todayEntry?.completed ?? false;
  const consecutiveDays = recomputeStreak(savedState);

  /** Start a daily challenge — fetch 5 unique questions */
  const startChallenge = useCallback(async () => {
    setSession({
      questions: [],
      currentIndex: 0,
      answers: [],
      score: { correct: 0, total: 0 },
      phase: "loading",
      currentQuestion: null,
      currentResult: null,
      selectedAnswer: null,
      loading: true,
      error: null,
    });

    try {
      const questions: TriviaQuestionResponse[] = [];
      const seenIds: number[] = [];

      // Fetch up to 5 unique questions
      for (let i = 0; i < DAILY_QUESTIONS_COUNT; i++) {
        const q = await getRandomQuestion(seenIds, null);
        if (!q) break;
        questions.push(q);
        seenIds.push(q.id);
      }

      if (questions.length === 0) {
        setSession((prev) => ({ ...prev, loading: false, error: "No questions available. Try again later!", phase: "finished" }));
        return;
      }

      setSession({
        questions,
        currentIndex: 0,
        answers: [],
        score: { correct: 0, total: 0 },
        phase: "question",
        currentQuestion: questions[0],
        currentResult: null,
        selectedAnswer: null,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      setSession((prev) => ({
        ...prev,
        loading: false,
        error: e?.message || "Failed to load daily challenge",
        phase: "finished",
      }));
    }
  }, []);

  /** Submit answer for the current question */
  const submitAnswer = useCallback(async (selectedAnswer: number) => {
    const s = sessionRef.current;
    const q = s.currentQuestion;
    if (!q || s.phase !== "question") return;

    setSession((prev) => ({ ...prev, selectedAnswer, loading: true }));

    try {
      const result = await submitTriviaAnswer(q.id, selectedAnswer);
      const isCorrect = result.isCorrect;

      const newAnswers = [...s.answers, { questionId: q.id, isCorrect }];
      const newScore = {
        correct: s.score.correct + (isCorrect ? 1 : 0),
        total: s.score.total + 1,
      };

      const isLastQuestion = newScore.total >= DAILY_QUESTIONS_COUNT || newScore.total >= s.questions.length;

      setSession((prev) => ({
        ...prev,
        currentResult: result,
        phase: "answered",
        answers: newAnswers,
        score: newScore,
        loading: false,
      }));

      if (isLastQuestion) {
        // Save daily challenge result to localStorage
        setSavedState((prev) => {
          const updated = {
            ...prev,
            history: {
              ...prev.history,
              [getTodayKey()]: {
                completed: true,
                score: newScore,
              },
            },
            lastUpdatedDate: getTodayKey(),
          };
          updated.consecutiveDays = recomputeStreak(updated);
          saveState(updated);
          savedRef.current = updated;
          return updated;
        });
      }
    } catch (e: any) {
      setSession((prev) => ({
        ...prev,
        loading: false,
        error: e?.message || "Failed to submit answer",
      }));
    }
  }, []);

  /** Move to the next question in the daily set */
  const nextQuestion = useCallback(() => {
    const s = sessionRef.current;
    const nextIndex = s.currentIndex + 1;

    if (nextIndex >= s.questions.length) {
      // All questions done — finish
      setSession((prev) => ({ ...prev, phase: "finished" }));
      return;
    }

    setSession((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      currentQuestion: s.questions[nextIndex],
      currentResult: null,
      selectedAnswer: null,
      phase: "question",
    }));
  }, []);

  /** Restore a previously-saved session (from sessionStorage after navigation) */
  const restoreSession = useCallback((saved: DailyChallengeSession) => {
    setSession({ ...saved });
  }, []);

  /** Reset to initial state */
  const reset = useCallback(() => {
    setSession({
      questions: [],
      currentIndex: 0,
      answers: [],
      score: { correct: 0, total: 0 },
      phase: "loading",
      currentQuestion: null,
      currentResult: null,
      selectedAnswer: null,
      loading: false,
      error: null,
    });
  }, []);

  /** Get the last 7 days of history for the streak calendar */
  const getWeekHistory = useCallback((): Record<string, DailyChallengeEntry> => {
    const days = getLast7Days();
    const result: Record<string, DailyChallengeEntry> = {};
    for (const day of days) {
      result[day] =
        savedRef.current.history[day] || { completed: false, score: { correct: 0, total: 0 } };
    }
    return result;
  }, []);

  return {
    // State
    savedState,
    session,
    todayKey,
    isTodayCompleted,
    consecutiveDays,
    // Session actions
    startChallenge,
    submitAnswer,
    nextQuestion,
    reset,
    restoreSession,
    // Data helpers
    getWeekHistory,
  };
}
