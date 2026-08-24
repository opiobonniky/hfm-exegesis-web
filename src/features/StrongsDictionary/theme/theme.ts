// Strongs Dictionary — word search, definitions, parsing

export const strongsDictionaryTheme = {
  colors: {
    accent: { word: "hsl(var(--primary))", definition: "hsl(var(--accent))", parsing: "hsl(142 76% 36%)" },
    word: { hebrew: "bg-primary/10 text-primary", greek: "bg-accent/10 text-accent" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", body: "text-sm sm:text-base", code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    searchCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    resultCard: "bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-all",
    wordBadge: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
    definitionBlock: "bg-muted/30 rounded-lg p-4 border-l-2 border-primary",
    input: "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type StrongsDictionaryTheme = typeof strongsDictionaryTheme;
