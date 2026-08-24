// Settings feature tokens — profile, password, preferences, notifications

export const settingsTheme = {
  colors: {
    accent: {
      profile: "hsl(var(--primary))",
      password: "hsl(var(--destructive))",
      preferences: "hsl(var(--accent))",
      notifications: "hsl(212 63% 56%)",
    },
    strength: {
      weak: "bg-destructive",
      fair: "bg-warning",
      good: "bg-accent",
      strong: "bg-success",
    toggle: {
      track: "bg-muted",
      trackActive: "bg-primary",
      thumb: "bg-background shadow-sm",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base",
    label: "text-sm font-medium text-foreground",
    caption: "text-xs text-muted-foreground",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-6",
    card: "p-4 sm:p-6",
    formGap: "space-y-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
  components: {
    tab: "px-4 py-2 rounded-lg text-sm font-medium transition-all",
    tabActive: "bg-primary text-primary-foreground",
    tabInactive: "text-muted-foreground hover:bg-muted",
    formCard:
      "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    input:
      "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
    toggle:
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
    toggleLabel:
      "flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors",
    strengthBar: "h-1.5 rounded-full transition-all duration-300",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type SettingsTheme = typeof settingsTheme;
