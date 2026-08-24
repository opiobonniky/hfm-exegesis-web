// Admin Journal Moderation — entries, approval, flagging

export const adminJournalModerationTheme = {
  colors: {
    accent: { pending: "hsl(var(--warning))", approved: "hsl(142 76% 36%)", flagged: "hsl(var(--destructive))" },
    status: { pending: "bg-warning/10 text-warning", approved: "bg-success/10 text-success", flagged: "bg-destructive/10 text-destructive" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", body: "text-sm sm:text-base", caption: "text-xs text-muted-foreground" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    entryCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    statusBadge: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
    actionButton: "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type AdminJournalModerationTheme = typeof adminJournalModerationTheme;
