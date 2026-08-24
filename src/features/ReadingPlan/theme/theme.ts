// Reading Plan feature theme tokens — plans, daily reading, plan detail

export const readingPlanTheme = {
  colors: {
    accent: {
      plan: "hsl(var(--primary))",
      reading: "hsl(var(--accent))",
      quiz: "hsl(142 76% 36%)",
      reflection: "hsl(212 63% 56%)",
    },
    progress: {
      track: "bg-muted",
      fill: "bg-primary",
      text: "text-primary font-semibold",
    day: {
      current: "border-primary bg-primary/5",
      completed: "border-success bg-success/5",
      locked: "border-border bg-muted/30 opacity-60",
      upcoming: "border-border",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base leading-relaxed",
    reference: "text-xs font-semibold text-primary uppercase tracking-wide",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-4 sm:space-y-6",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
  components: {
    planCard:
      "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:border-primary/30 transition-all",
    dayCard: "rounded-xl border-2 p-4 transition-all",
    progressBar: "h-2 rounded-full bg-muted overflow-hidden",
    progressFill: "h-full bg-primary rounded-full transition-all duration-500",
    quizOption:
      "w-full text-left p-3 rounded-xl border-2 border-border hover:border-primary transition-all",
    quizOptionSelected: "border-primary bg-primary/5",
    quizOptionCorrect: "border-success bg-success/5",
    quizOptionWrong: "border-destructive bg-destructive/5",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type ReadingPlanTheme = typeof readingPlanTheme;
