// Trivia feature constants
import {
  Target, Sparkles, BookOpen, Zap,
} from "lucide-react";
import type { DifficultyFilter } from "@/hooks/useTrivia";

export const DIFFICULTY_OPTIONS: {
  value: DifficultyFilter;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}[] = [
  { value: null, label: "All", desc: "Mixed challenges", icon: Target, color: "#6366F1" },
  { value: "easy", label: "Easy", desc: "Gentle start", icon: Sparkles, color: "#22C55E" },
  { value: "medium", label: "Medium", desc: "Balanced path", icon: BookOpen, color: "#3B82F6" },
  { value: "hard", label: "Hard", desc: "Deep waters", icon: Zap, color: "#EF4444" },
];

export const TRIVIA_STORAGE_KEY = "exegesis_trivia_state";
export const DAILY_STORAGE_KEY = "exegesis_daily_session";
export const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500];

export const BADGE_CATEGORIES = [
  { label: "Milestones", key: "milestone", color: "#6366F1" },
  { label: "Streak", key: "streak", color: "#F59E0B" },
  { label: "Exploration", key: "exploration", color: "#10B981" },
  { label: "Difficulty", key: "difficulty", color: "#EC4899" },
] as const;

export const ACCENT = "hsl(var(--primary))";
