// ─── Admin Trivia Constants ───────────────────────────────────────────────────

export const TRIVIA_TABS = [
  { value: "overview", label: "Overview", icon: "BarChart3" },
  { value: "questions", label: "Questions", icon: "HelpCircle" },
  { value: "users", label: "User Performance", icon: "Users" },
  { value: "performance", label: "Question Stats", icon: "TrendingUp" },
] as const;

export const DIFFICULTY_OPTIONS = ["all", "easy", "medium", "hard"] as const;

export const CATEGORY_OPTIONS = [
  "all", "general", "old_testament", "new_testament",
  "theology", "history", "prophecy", "wisdom", "poetry",
] as const;

export const TRIVIA_PAGE_SIZE = 20;
