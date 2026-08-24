// Notification Settings — toggles, schedules, channels

export const notificationSettingsTheme = {
  colors: {
    accent: { email: "hsl(var(--primary))", push: "hsl(var(--accent))", sms: "hsl(142 76% 36%)" },
    toggle: { track: "bg-muted", active: "bg-primary" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", label: "text-sm font-medium text-foreground", caption: "text-xs text-muted-foreground" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    settingsCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    toggleRow: "flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors",
    toggle: "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type NotificationSettingsTheme = typeof notificationSettingsTheme;
