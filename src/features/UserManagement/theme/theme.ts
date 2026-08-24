// User Management — user list, roles, permissions

export const userManagementTheme = {
  colors: {
    accent: { list: "hsl(var(--primary))", role: "hsl(var(--accent))", permission: "hsl(142 76% 36%)" },
    role: { admin: "bg-primary/10 text-primary", user: "bg-muted text-muted-foreground", banned: "bg-destructive/10 text-destructive" },
    status: { active: "bg-success/10 text-success", inactive: "bg-muted text-muted-foreground", banned: "bg-destructive/10 text-destructive" },
  },
  typography: { heading: "font-heading text-xl sm:text-2xl font-bold", body: "text-sm sm:text-base", caption: "text-xs text-muted-foreground" },
  spacing: { page: "p-4 sm:p-6 lg:p-8", card: "p-4 sm:p-6", section: "space-y-4" },
  shadows: { card: "shadow-sm border border-border" },
  components: {
    userCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    roleBadge: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
    statusDot: "w-2 h-2 rounded-full",
    tableRow: "border-b border-border hover:bg-muted/50 transition-colors",
    input: "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary",
  },
  transition: { fast: "duration-150", normal: "duration-200", slow: "duration-300" },
} as const;
export type UserManagementTheme = typeof userManagementTheme;
