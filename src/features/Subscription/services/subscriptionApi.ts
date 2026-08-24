// Subscription subscriptionApi — API endpoints for subscriptionApi operations
import { sendPostRequest } from "@/services/api";

export const subscriptionApi = {
  getTiers: () =>
    sendPostRequest("admin", "subscription-tiers/list", {}),
  getUsers: (page = 0, size = 20, tier?: string) =>
    sendPostRequest("admin", "get-subscriptions-users", { page, size, tier }),
  updateTier: (data: any) =>
    sendPostRequest("admin", "subscription-tiers/update", data),
  createTier: (data: any) =>
    sendPostRequest("admin", "subscription-tiers/create", data),
  deleteTier: (id: number) =>
    sendPostRequest("admin", "subscription-tiers/delete", { id }),
  seedTiers: () =>
    sendPostRequest("admin", "subscription-tiers/seed", {}),
  syncStripeUsers: () =>
    sendPostRequest("admin", "sync-stripe-users", {}),
  createCheckoutSession: (data: any) =>
    sendPostRequest("subscriptions", "create-checkout-session", data),
};
