// Trivia feature theme tokens — questions, daily challenge, badges, leaderboard

export const triviaTheme = {
  colors: {
    accent: {
      question: "hsl(var(--primary))",
      challenge: "hsl(var(--accent))",
      badge: "hsl(38 80% 45%)",
      leaderboard: "hsl(212 63% 56%)",
    },
    difficulty: {
      easy: "bg-success/10 text-success border-success/30",
      medium: "bg-warning/10 text-warning border-warning/30",
      hard: "bg-destructive/10 text-destructive border-destructive/30",
    score: {
      correct: "text-success",
      incorrect: "text-destructive",
      streak: "text-accent",
    badge: {
      gold: "bg-accent/10 text-accent",
      silver: "bg-muted text-muted-foreground",
      bronze: "bg-warning/10 text-warning",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base",
    option: "text-sm sm:text-base font-medium",
    score: "text-3xl font-bold",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-4 sm:space-y-6",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    option: "shadow-sm hover:shadow-md transition-shadow",
  components: {
    questionCard:
      "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    optionCard:
      "w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary transition-all",
    optionCorrect: "border-success bg-success/5",
    optionWrong: "border-destructive bg-destructive/5",
    optionSelected: "border-primary bg-primary/5",
    scoreCard:
      "bg-card rounded-xl p-4 sm:p-6 text-center shadow-sm border border-border",
    badgeCard:
      "bg-card rounded-xl p-4 border border-border text-center",
    timerBar: "h-1.5 rounded-full bg-muted overflow-hidden",
    timerFill: "h-full bg-primary rounded-full transition-all duration-1000",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type TriviaTheme = typeof triviaTheme;
