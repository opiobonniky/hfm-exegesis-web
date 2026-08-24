// Extended Profile — bio, social links, avatar

export const extendedProfileTheme = {
  colors: {
    accent: { avatar: "hsl(var(--primary))", social: "hsl(var(--accent))", bio: "hsl(212 63% 56%)" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", label: "text-sm font-medium text-foreground", body: "text-sm sm:text-base" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", formGap: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    avatar: "w-20 h-20 rounded-full border-2 border-primary object-cover",
    formCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    input: "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
    socialLink: "flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-all",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type ExtendedProfileTheme = typeof extendedProfileTheme;
