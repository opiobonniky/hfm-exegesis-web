// Daily Content feature tokens — daily verse, devotions, verse explanations

export const dailyContentTheme = {
  colors: {
    accent: {
      verse: "hsl(var(--primary))",
      devotion: "hsl(var(--accent))",
      explanation: "hsl(212 63% 56%)",
      exegesis: "hsl(142 76% 36%)",
    },
    content: {
      verse: "bg-primary/5 border-l-4 border-primary",
      devotion: "bg-accent/5 border-l-4 border-accent",
      explanation: "bg-info/5 border-l-4 border-info",
      exegesis: "bg-success/5 border-l-4 border-success",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base leading-relaxed",
    verse: "text-base sm:text-lg italic font-medium",
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
    verseCard:
      "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    contentBlock:
      "rounded-xl p-4 sm:p-6 border-l-4",
    addButton:
      "inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all",
    formCard:
    textArea:
      "w-full min-h-[120px] bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none",
    input:
      "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type DailyContentTheme = typeof dailyContentTheme;
