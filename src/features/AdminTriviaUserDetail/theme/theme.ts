// Admin Trivia User Detail — user stats, answers, history

export const adminTriviaUserDetailTheme = {
  colors: {
    accent: { stats: "hsl(var(--primary))", history: "hsl(var(--accent))", correct: "hsl(142 76% 36%)", wrong: "hsl(var(--destructive))" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", body: "text-sm sm:text-base", stat: "text-2xl font-bold" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-4", grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    statCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border text-center",
    historyRow: "flex items-center justify-between p-3 rounded-lg border border-border",
    correctAnswer: "text-success font-medium",
    wrongAnswer: "text-destructive line-through",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type AdminTriviaUserDetailTheme = typeof adminTriviaUserDetailTheme;
