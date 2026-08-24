// Home feature theme tokens — dashboard, user dashboard, challenges

export const homeTheme = {
  colors: {
    accent: {
      dashboard: "hsl(var(--primary))",
      challenge: "hsl(var(--accent))",
      streak: "hsl(38 80% 45%)",
      journal: "hsl(212 63% 56%)",
    },
    stat: {
      blue: "bg-primary/10 text-primary",
      gold: "bg-accent/10 text-accent",
      green: "bg-success/10 text-success",
      red: "bg-destructive/10 text-destructive",
    challenge: {
      active: "border-primary/30 bg-primary/5",
      completed: "border-success/30 bg-success/5",
      expired: "border-muted bg-muted/30",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm sm:text-base font-medium text-muted-foreground",
    stat: "text-2xl sm:text-3xl font-bold",
    greeting: "text-2xl sm:text-3xl font-bold text-foreground",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-6",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
  components: {
    statCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    greetingCard:
      "bg-gradient-to-r from-primary/10 to-accent/5 rounded-2xl p-6 sm:p-8 border border-border",
    quickAction: "bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-all",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type HomeTheme = typeof homeTheme;
