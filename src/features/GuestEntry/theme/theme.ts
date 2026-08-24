// Guest Entry — quick access without account

export const guestEntryTheme = {
  colors: {
    accent: { entry: "hsl(var(--primary))", browse: "hsl(var(--accent))" },
  },
  typography: { heading: "font-heading text-2xl sm:text-3xl font-bold", body: "text-sm sm:text-base" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-6" },
  shadows: { card: "shadow-sm border border-border", elevated: "shadow-lg border border-border" },
  components: {
    guestCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    entryButton: "bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all",
    browseButton: "border border-border bg-background px-6 py-3 rounded-lg font-medium hover:bg-muted/50 transition-all",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type GuestEntryTheme = typeof guestEntryTheme;
