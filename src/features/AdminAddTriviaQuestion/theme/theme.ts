// Admin Add Trivia Question — form, categories, difficulty

export const adminAddTriviaTheme = {
  colors: {
    accent: {
      form: "hsl(var(--primary))",
      category: "hsl(var(--accent))",
      difficulty: "hsl(142 76% 36%)",
    },
    difficulty: {
      easy: "bg-success/10 text-success border-success/30",
      medium: "bg-warning/10 text-warning border-warning/30",
      hard: "bg-destructive/10 text-destructive border-destructive/30",
    },
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    label: "text-sm font-medium text-foreground",
    caption: "text-xs text-muted-foreground",
  },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", formGap: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    formCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    input: "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
    textArea: "w-full min-h-[100px] bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none",
    submitButton: "bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type AdminAddTriviaTheme = typeof adminAddTriviaTheme;
