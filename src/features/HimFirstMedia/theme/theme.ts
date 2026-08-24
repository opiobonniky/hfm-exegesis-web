// HimFirst Media feature tokens — who we are, vision, mission, founders, leadership

export const himFirstMediaTheme = {
  colors: {
    accent: {
      section: "hsl(var(--primary))",
      vision: "hsl(var(--accent))",
      mission: "hsl(142 76% 36%)",
      founders: "hsl(212 63% 56%)",
    },
    section: {
      hero: "bg-gradient-to-br from-primary/10 to-accent/5",
      alt: "bg-muted/30",
      dark: "bg-brand-dark text-white",
    team: {
      card: "bg-card border border-border",
      role: "text-xs font-semibold text-primary uppercase tracking-wide",
  },
  typography: {
    heading: "font-heading text-2xl sm:text-3xl lg:text-4xl font-bold",
    subheading: "font-heading text-lg sm:text-xl font-semibold",
    body: "text-sm sm:text-base leading-relaxed",
    caption: "text-xs text-muted-foreground",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-8 sm:space-y-12 py-12 sm:py-16",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    team: "shadow-md hover:shadow-lg transition-shadow",
  components: {
    heroSection:
      "relative py-16 sm:py-24 bg-gradient-to-br from-primary/10 to-accent/5",
    contentSection: "py-12 sm:py-16",
    altSection: "py-12 sm:py-16 bg-muted/30",
    teamCard:
      "bg-card rounded-xl p-4 sm:p-6 border border-border text-center hover:shadow-lg transition-all",
    roleBadge:
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary",
    valueCard:
      "bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all",
    statCard:
      "bg-card rounded-xl p-4 text-center border border-border",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type HimFirstMediaTheme = typeof himFirstMediaTheme;
