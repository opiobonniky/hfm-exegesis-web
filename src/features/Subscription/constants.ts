// Constants for Subscription feature
export const SUBSCRIPTION_TIERS = [
  { id: "free", name: "Free", price: 0 },
  { id: "sower", name: "Sower", price: 9.99 },
  { id: "builder", name: "Builder", price: 19.99 },
] as const;

export type SubscriptionTierId = typeof SUBSCRIPTION_TIERS[number]["id"];
