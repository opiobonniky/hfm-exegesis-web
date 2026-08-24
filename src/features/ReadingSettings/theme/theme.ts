// Reading Settings — translation, font, display

export const readingSettingsTheme = {
  colors: {
    accent: { translation: "hsl(var(--primary))", font: "hsl(var(--accent))", display: "hsl(212 63% 56%)" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", label: "text-sm font-medium text-foreground", caption: "text-xs text-muted-foreground" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    settingsCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    select: "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
    slider: "w-full accent-primary",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type ReadingSettingsTheme = typeof readingSettingsTheme;
