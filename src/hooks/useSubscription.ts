// ── useSubscription ──────────────────────────────────────────────────────────
// Centralized hook for subscription tier queries. Wraps AuthContext's
// subscriptionTier + accessExpiresAt with convenience helpers for feature
// gating throughout the app.
//
// Tier hierarchy: free (0) < legacy_sower (1) < covenant_sower (2)
// Monthly variants are treated the same as their base tier.

import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionTier = "free" | "legacy_sower" | "covenant_sower";

/**
 * Map a raw tier string (possibly with _monthly suffix) to a numeric level.
 *   0 = free / unknown
 *   1 = legacy_sower / legacy_sower_monthly
 *   2 = covenant_sower / covenant_sower_monthly
 */
function tierLevel(tier: string): number {
  const base = tier.replace("_monthly", "");
  switch (base) {
    case "covenant_sower":
      return 2;
    case "legacy_sower":
      return 1;
    default:
      return 0;
  }
}

/** Human-readable label for a raw tier string. */
export function formatTierLabel(tier: string): string {
  switch (tier) {
    case "free":
      return "Free Reader";
    case "legacy_sower":
    case "legacy_sower_monthly":
      return "Legacy Sower";
    case "covenant_sower":
    case "covenant_sower_monthly":
      return "Covenant Sower";
    default:
      return tier;
  }
}

export function useSubscription() {
  const { subscriptionTier, accessExpiresAt, fetchSubscriptionStatus, userInfo } = useAuth();

  const raw = subscriptionTier || "free";
  const level = tierLevel(raw);
  const isAdminUser = userInfo?.userRole === 1;

  /** True if the user's tier meets or exceeds the required tier, or user is admin. */
  const hasAccess = (minTier: SubscriptionTier): boolean =>
    isAdminUser || level >= tierLevel(minTier);

  /** True if the user is on the Free Reader plan (or not logged in). */
  const isFree = level === 0;

  /** True if the user is on Legacy Sower (yearly or monthly). */
  const isLegacySower = raw.startsWith("legacy_sower");

  /** True if the user is on Covenant Sower (yearly or monthly). */
  const isCovenantSower = raw.startsWith("covenant_sower");

  /** True if the user is on any paid plan (or is admin). */
  const isPayingUser = isAdminUser || isLegacySower || isCovenantSower;

  /** Human-readable label for the current tier. */
  const tierLabel = formatTierLabel(raw);

  /** Formatted expiry date string, or null if no expiry. */
  const expiresLabel = accessExpiresAt
    ? new Date(accessExpiresAt).toLocaleDateString()
    : null;

  return {
    /** Raw tier string from the backend (e.g. "free", "legacy_sower", "covenant_sower_monthly"). */
    subscriptionTier: raw,
    /** ISO expiry date string, or null. */
    accessExpiresAt,
    /** Re-fetch subscription status from the backend. */
    refresh: fetchSubscriptionStatus,

    // ── Helpers ──
    hasAccess,
    isFree,
    isLegacySower,
    isCovenantSower,
    isPayingUser,
    isAdminUser,
    tierLabel,
    expiresLabel,
  };
}
