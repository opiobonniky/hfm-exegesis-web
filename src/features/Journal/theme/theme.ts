// Journal feature theme tokens — entries, prompts, templates, detail

export const journalTheme = {
  colors: {
    accent: {
      entry: "hsl(var(--primary))",
      prompt: "hsl(var(--accent))",
      template: "hsl(212 63% 56%)",
      mood: "hsl(142 76% 36%)",
    },
    mood: {
      happy: "bg-success/10 text-success",
      neutral: "bg-muted text-muted-foreground",
      sad: "bg-destructive/10 text-destructive",
      reflective: "bg-info/10 text-info",
      grateful: "bg-accent/10 text-accent",
    entry: {
      card: "bg-card border border-border",
      preview: "text-muted-foreground text-sm line-clamp-3",
      date: "text-xs text-muted-foreground",
      tag: "bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base leading-relaxed",
    mood: "text-2xl",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-4 sm:space-y-6",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    entry: "shadow-sm hover:shadow-md transition-shadow",
  components: {
    entryCard:
      "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:border-primary/30 transition-all",
    promptCard:
      "bg-card rounded-xl p-4 border border-accent/20 hover:border-accent/40 transition-all",
    templateCard:
      "bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-all cursor-pointer",
    textArea:
      "w-full min-h-[200px] bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none",
    moodSelector: "flex gap-2 flex-wrap",
    moodButton: "p-2 rounded-xl border-2 border-border hover:border-primary transition-all text-xl",
    moodButtonActive: "border-primary bg-primary/5",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type JournalTheme = typeof journalTheme;
