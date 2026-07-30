import { useState, useCallback } from "react";

// ── Constants ──

const STORAGE_KEY = "exegesis_trivia_leaderboard";

// ── Types ──

export interface LeaderboardEntry {
  correct: number;
  total: number;
  percentage: number;
  date: string; // ISO date when achieved
}

export interface LeaderboardState {
  /** Best single-session performance (min 5 questions) */
  bestSession: LeaderboardEntry;
  /** Best streak ever achieved */
  bestStreak: number;
  /** Total lifetime stats */
  lifetime: {
    correct: number;
    total: number;
  };
}

// ── Default state ──

const DEFAULT_STATE: LeaderboardState = {
  bestSession: { correct: 0, total: 0, percentage: 0, date: "" },
  bestStreak: 0,
  lifetime: { correct: 0, total: 0 },
};

function loadState(): LeaderboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "bestSession" in parsed) {
        return parsed as LeaderboardState;
      }
    }
  } catch {
    // Corrupted — reset
  }
  return { ...DEFAULT_STATE };
}

function saveState(state: LeaderboardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail
  }
}

// ── Hook ──

export function useLeaderboard() {
  const [state, setState] = useState<LeaderboardState>(loadState);
  const [prevSessionScore, setPrevSessionScore] = useState<{
    correct: number;
    total: number;
    streak: number;
  } | null>(null);

  /**
   * Record a completed session. Returns whether a new best was set.
   * Should be called when a quiz is finished (phase === "finished").
   */
  const recordSession = useCallback(
    (correct: number, total: number, streak: number) => {
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      let updated = { ...state };

      // Update lifetime stats
      updated.lifetime = {
        correct: state.lifetime.correct + correct,
        total: state.lifetime.total + total,
      };

      // Update best streak
      if (streak > state.bestStreak) {
        updated.bestStreak = streak;
      }

      // Update best session (min 3 questions for a meaningful comparison)
      if (
        total >= 3 &&
        (percentage > state.bestSession.percentage ||
          (percentage === state.bestSession.percentage &&
            correct > state.bestSession.correct))
      ) {
        updated.bestSession = {
          correct,
          total,
          percentage,
          date: new Date().toISOString(),
        };
      }

      setPrevSessionScore({ correct, total, streak });
      setState(updated);
      saveState(updated);
    },
    [state],
  );

  /**
   * Get comparison data for the most recently completed session.
   */
  const getComparison = useCallback(() => {
    if (!prevSessionScore) return null;

    const currentPct =
      prevSessionScore.total > 0
        ? Math.round((prevSessionScore.correct / prevSessionScore.total) * 100)
        : 0;

    return {
      current: {
        correct: prevSessionScore.correct,
        total: prevSessionScore.total,
        percentage: currentPct,
        streak: prevSessionScore.streak,
      },
      best: state.bestSession,
      bestStreak: state.bestStreak,
      isNewBest:
        prevSessionScore.total >= 3 &&
        (currentPct > state.bestSession.percentage ||
          (currentPct === state.bestSession.percentage &&
            prevSessionScore.correct > state.bestSession.correct)),
      isNewStreak:
        prevSessionScore.streak > 0 &&
        prevSessionScore.streak >= state.bestStreak,
    };
  }, [prevSessionScore, state]);

  /** Reset all leaderboard data */
  const resetLeaderboard = useCallback(() => {
    setState({ ...DEFAULT_STATE });
    setPrevSessionScore(null);
    saveState(DEFAULT_STATE);
  }, []);

  return {
    state,
    prevSessionScore,
    recordSession,
    getComparison,
    resetLeaderboard,
  };
}
