// Bible feature theme tokens — reader, my activity, verse explanations

export const bibleTheme = {
  colors: {
    accent: {
      verse: "hsl(var(--primary))",
      highlight: "hsl(var(--accent) / 0.15)",
      note: "hsl(217 91% 60% / 0.1)",
      reference: "hsl(var(--accent))",
    },
    verse: {
      text: "text-foreground leading-relaxed",
      reference: "text-primary font-semibold",
      highlight: "bg-accent/15 rounded px-1",
      note: "bg-info/10 border-l-2 border-info",
    book: {
      old: "hsl(var(--primary))",
      new: "hsl(var(--accent))",
      wisdom: "hsl(142 76% 36%)",
      prophecy: "hsl(var(--destructive))",
  },
  typography: {
    heading: "font-heading",
    body: "font-body",
    verse: "text-base sm:text-lg leading-relaxed font-medium",
    reference: "text-sm font-semibold text-primary",
    chapter: "text-3xl sm:text-4xl font-bold",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    verse: "py-2 px-3 sm:px-4",
    chapter: "space-y-1",
    card: "p-4 sm:p-6",
  shadows: {
    card: "shadow-sm border border-border",
    reader: "shadow-lg",
    popup: "shadow-xl border border-border rounded-xl",
  components: {
    verseCard: "p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all",
    chapterNav: "flex items-center justify-between gap-4",
    translationBadge:
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary",
    searchResult: "p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type BibleTheme = typeof bibleTheme;
