// ─── Admin Subscriptions Constants ────────────────────────────────────────────

export const SUBSCRIPTION_TABS = [
  { value: "tiers", label: "Subscription Tiers", icon: "ShieldCheck" },
  { value: "subscribers", label: "Subscribers", icon: "Users" },
] as const;

export const SUBSCRIPTION_PAGE_SIZE = 20;
export const ACTIVITY_PAGE_SIZE = 20;
export const DEVICE_FILTERS = ["all", "mobile", "desktop", "tablet"] as const;
export const STATUS_FILTERS = ["all", "success", "failed", "online"] as const;

export const SUBSCRIPTION_TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400",
  supporter: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  legacy_sower: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  sower: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
};
