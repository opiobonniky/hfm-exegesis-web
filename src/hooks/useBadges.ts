import { useState, useCallback, useRef } from "react";
import type { TriviaQuestionResponse } from "@/services/triviaApi";

// ── Badge Definitions ─────────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "streak" | "exploration" | "difficulty";
  target: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Answer your first question correctly",
    icon: "🌟",
    category: "milestone",
    target: 1,
  },
  {
    id: "beginner_scholar",
    name: "Beginner Scholar",
    description: "Answer 10 questions",
    icon: "📜",
    category: "milestone",
    target: 10,
  },
  {
    id: "diligent_student",
    name: "Diligent Student",
    description: "Answer 50 questions",
    icon: "🏅",
    category: "milestone",
    target: 50,
  },
  {
    id: "scripture_master",
    name: "Scripture Master",
    description: "Answer 100 questions",
    icon: "👑",
    category: "milestone",
    target: 100,
  },
  {
    id: "perfect_streak",
    name: "Flawless Streak",
    description: "Get 10 correct in a row",
    icon: "💎",
    category: "streak",
    target: 10,
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Correct answer from 10 different books",
    icon: "📚",
    category: "exploration",
    target: 10,
  },
  {
    id: "easy_pro",
    name: "Easy Pro",
    description: "Answer 10 easy questions correctly",
    icon: "🌱",
    category: "difficulty",
    target: 10,
  },
  {
    id: "deep_diver",
    name: "Deep Diver",
    description: "Answer 10 hard questions correctly",
    icon: "🧠",
    category: "difficulty",
    target: 10,
  },
];

// ── Types ─────────────────────────────────────────────────────────────────

export interface BadgeState {
  badges: Record<
    string,
    {
      unlocked: boolean;
      unlockedAt?: string;
    }
  >;
  stats: {
    totalCorrect: number;
    totalAnswered: number;
    bestStreak: number;
    booksCorrect: string[];
    easyCorrect: number;
    hardCorrect: number;
  };
}

const STORAGE_KEY = "exegesis_trivia_badges";

function loadState(): BadgeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data — reset
  }
  return {
    badges: {},
    stats: {
      totalCorrect: 0,
      totalAnswered: 0,
      bestStreak: 0,
      booksCorrect: [],
      easyCorrect: 0,
      hardCorrect: 0,
    },
  };
}

function saveState(state: BadgeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useBadges() {
  const [state, setState] = useState<BadgeState>(loadState);
  const [justUnlocked, setJustUnlocked] = useState<BadgeDefinition[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Check all badge conditions and return newly unlocked badges */
  const checkNewBadges = useCallback(
    (params: {
      totalAnswered: number;
      totalCorrect: number;
      streak: number;
      bookName: string | null;
      difficulty: string | null;
      isCorrect: boolean;
    }) => {
      const { totalAnswered, totalCorrect, streak, bookName, difficulty, isCorrect } = params;
      const prev = stateRef.current;
      const updated = { ...prev };
      const newUnlocked: BadgeDefinition[] = [];

      // Update stats
      updated.stats.totalAnswered = totalAnswered;
      updated.stats.totalCorrect = totalCorrect;

      if (streak > updated.stats.bestStreak) {
        updated.stats.bestStreak = streak;
      }

      if (isCorrect && bookName && !updated.stats.booksCorrect.includes(bookName)) {
        updated.stats.booksCorrect = [...updated.stats.booksCorrect, bookName];
      }

      if (isCorrect && difficulty === "easy") {
        updated.stats.easyCorrect += 1;
      }
      if (isCorrect && difficulty === "hard") {
        updated.stats.hardCorrect += 1;
      }

      // Check each badge
      for (const badge of BADGE_DEFINITIONS) {
        const wasUnlocked = updated.badges[badge.id]?.unlocked;
        if (wasUnlocked) continue;

        let earned = false;
        switch (badge.id) {
          case "first_steps":
            earned = totalCorrect >= badge.target;
            break;
          case "beginner_scholar":
            earned = totalAnswered >= badge.target;
            break;
          case "diligent_student":
            earned = totalAnswered >= badge.target;
            break;
          case "scripture_master":
            earned = totalAnswered >= badge.target;
            break;
          case "perfect_streak":
            earned = streak >= badge.target;
            break;
          case "bookworm":
            earned = updated.stats.booksCorrect.length >= badge.target;
            break;
          case "easy_pro":
            earned = updated.stats.easyCorrect >= badge.target;
            break;
          case "deep_diver":
            earned = updated.stats.hardCorrect >= badge.target;
            break;
        }

        if (earned) {
          updated.badges[badge.id] = {
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
          newUnlocked.push(badge);
        }
      }

      setState(updated);
      setJustUnlocked(newUnlocked);
      saveState(updated);

      return newUnlocked;
    },
    [],
  );

  /** Clear the "just unlocked" notification */
  const clearUnlocked = useCallback(() => {
    setJustUnlocked([]);
  }, []);

  /** Reset all badge progress */
  const resetBadges = useCallback(() => {
    const fresh: BadgeState = {
      badges: {},
      stats: { totalCorrect: 0, totalAnswered: 0, bestStreak: 0, booksCorrect: [], easyCorrect: 0, hardCorrect: 0 },
    };
    setState(fresh);
    setJustUnlocked([]);
    saveState(fresh);
  }, []);

  /** Get progress info for a specific badge */
  const getProgress = useCallback(
    (badgeId: string): { current: number; target: number } => {
      const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
      if (!badge) return { current: 0, target: 0 };

      const s = state.stats;
      switch (badgeId) {
        case "first_steps":
          return { current: s.totalCorrect, target: badge.target };
        case "beginner_scholar":
        case "diligent_student":
        case "scripture_master":
          return { current: s.totalAnswered, target: badge.target };
        case "perfect_streak":
          return { current: s.bestStreak, target: badge.target };
        case "bookworm":
          return { current: s.booksCorrect.length, target: badge.target };
        case "easy_pro":
          return { current: s.easyCorrect, target: badge.target };
        case "deep_diver":
          return { current: s.hardCorrect, target: badge.target };
        default:
          return { current: 0, target: 0 };
      }
    },
    [state.stats],
  );

  return {
    state,
    justUnlocked,
    checkNewBadges,
    clearUnlocked,
    resetBadges,
    getProgress,
  };
}
