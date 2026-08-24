// Lab feature theme tokens — learn stage, look stage, lab flow

export const labTheme = {
  colors: {
    accent: {
      learn: "hsl(var(--primary))",
      look: "hsl(var(--accent))",
      study: "hsl(142 76% 36%)",
      reflection: "hsl(212 63% 56%)",
    },
    stage: {
      active: "border-primary bg-primary/5",
      completed: "border-success bg-success/5",
      locked: "border-border bg-muted/30 opacity-60",
    highlight: {
      word: "bg-accent/15 rounded px-1 cursor-pointer hover:bg-accent/25",
      verse: "bg-primary/10 rounded-lg p-3 border-l-2 border-primary",
      note: "bg-info/10 rounded-lg p-3 border-l-2 border-info",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base leading-relaxed",
    word: "text-primary font-semibold cursor-pointer hover:underline",
    verse: "text-sm italic text-foreground/80",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-4 sm:space-y-6",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-2 gap-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    popup: "shadow-xl border border-border rounded-xl",
  components: {
    stageCard:
      "bg-card rounded-xl p-4 sm:p-6 shadow-sm border-2 transition-all",
    stageIndicator: "flex items-center gap-2 text-sm font-medium",
    stageActive: "text-primary",
    stageCompleted: "text-success",
    stageLocked: "text-muted-foreground",
    wordCard:
      "bg-card rounded-lg p-3 border border-border hover:border-primary/30 transition-all cursor-pointer",
    exegesisCard:
      "bg-card rounded-xl p-4 sm:p-6 border border-border",
    noteInput:
      "w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type LabTheme = typeof labTheme;
