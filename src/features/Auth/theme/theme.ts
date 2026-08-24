// Auth feature theme tokens — login, register, forgot password, landing

export const authTheme = {
  colors: {
    accent: {
      login: "hsl(var(--primary))",
      register: "hsl(var(--accent))",
      forgot: "hsl(217 91% 60%)",
      landing: "hsl(var(--primary))",
    },
    form: {
      input: "bg-background border border-input rounded-lg px-4 py-3",
      inputFocus: "focus:ring-2 focus:ring-primary focus:border-primary",
      label: "text-sm font-medium text-foreground",
      error: "text-destructive text-sm",
      hint: "text-muted-foreground text-sm",
    splitScreen: {
      sidebar: "bg-brand-dark",
      sidebarOverlay: "bg-gradient-to-br from-brand-primary/80 to-brand-dark",
  },
  typography: {
    heading: "font-heading text-3xl sm:text-4xl font-bold",
    subheading: "font-heading text-lg sm:text-xl font-semibold",
    body: "font-body text-sm sm:text-base",
    caption: "text-xs text-muted-foreground",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    formGap: "space-y-4",
    card: "p-6 sm:p-8",
    section: "space-y-6 sm:space-y-8",
  shadows: {
    card: "shadow-2xl border border-border",
    input: "shadow-sm",
    button: "shadow-md hover:shadow-lg",
  components: {
    authCard: "bg-card rounded-2xl shadow-2xl border border-border p-6 sm:p-8",
    submitButton:
      "w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all",
    socialButton:
      "w-full border border-border bg-background hover:bg-muted/50 rounded-lg py-3 font-medium transition-all",
    splitSidebar:
      "hidden lg:flex flex-col justify-center items-center bg-brand-dark text-white p-12 relative overflow-hidden",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type AuthTheme = typeof authTheme;
