// Subscription feature tokens — sower page, tiers, management

export const subscriptionTheme = {
  colors: {
    accent: {
      free: "hsl(var(--muted-foreground))",
      sower: "hsl(var(--accent))",
      plan: "hsl(var(--primary))",
    },
    tier: {
      free: "border-border bg-muted/30",
      sower: "border-accent bg-accent/5",
      partner: "border-primary bg-primary/5",
    badge: {
      active: "bg-success/10 text-success",
      expired: "bg-destructive/10 text-destructive",
      trial: "bg-info/10 text-info",
  },
  typography: {
    heading: "font-heading text-xl sm:text-2xl font-bold",
    subtitle: "text-sm text-muted-foreground",
    body: "text-sm sm:text-base",
    price: "text-3xl font-bold text-foreground",
    period: "text-sm text-muted-foreground",
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-6",
    card: "p-4 sm:p-6",
    grid: "grid-cols-1 sm:grid-cols-3 gap-4",
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    featured: "shadow-xl border-2 border-accent",
  components: {
    tierCard:
      "bg-card rounded-xl p-4 sm:p-6 border-2 transition-all",
    tierFeatured:
      "bg-card rounded-xl p-4 sm:p-6 border-2 border-accent shadow-xl relative",
    subscribeButton:
      "w-full py-3 rounded-lg font-semibold transition-all",
    priceTag:
      "flex items-baseline gap-1 justify-center",
    featureList: "space-y-2 text-sm",
    featureCheck:
      "flex items-center gap-2 text-sm text-foreground",
    featureCross:
      "flex items-center gap-2 text-sm text-muted-foreground line-through",
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type SubscriptionTheme = typeof subscriptionTheme;
