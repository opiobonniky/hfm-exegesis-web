import { tt } from "@/components/languages/hardcodedTranslate";
import type { LandingReadingPlan, LandingTier } from "@/features/Auth/services/landingService";
import type { LandingPlanItem } from "@/features/Auth/types";
import type { Translations } from "@/components/languages/type";

export const hexToRgba = (hex: string, alpha = 1) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
};

export const landingCopy = (t: Translations | undefined, key: string, fallback: string): string => {
  const value = (t?.landing as Record<string, string | undefined> | undefined)?.[key];
  return value ?? fallback;
};

export const scrollToSectionId = (sectionId: string): boolean => {
  if (typeof document === "undefined") return false;
  const element = document.getElementById(sectionId);
  if (!element) return false;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
};
export const getActiveSectionId = (sectionIds: string[]): string | null => {
  if (typeof window === "undefined") return null;
  const offset = window.innerHeight * 0.35;
  let active: string | null = null;
  for (const id of sectionIds) {
    const element = document.getElementById(id);
    if (!element) continue;
    if (element.getBoundingClientRect().top - offset <= 0) active = id;
  }
  if (active) return active;
  return document.getElementById(sectionIds[sectionIds.length - 1]) ? (sectionIds[sectionIds.length - 1] ?? null) : null;
};

/**
 * Build the meta line shown under a reading-plan title on the landing page.
 * Falls back to the day count when a plan has no category.
 */
export const formatPlanMeta = (
  plan: Pick<LandingReadingPlan, "category" | "totalDays">,
): string => {
  const days = tt("{count} days").replace("{count}", String(plan.totalDays));
  return plan.category ? `${plan.category} \u00b7 ${days}` : days;
};

/**
 * Map API reading plans onto the landing cards. Returns null when the payload
 * is unusable so the caller can keep the curated static copy.
 */
export const mapLandingPlans = (
  plans: LandingReadingPlan[] | null | undefined,
): LandingPlanItem[] | null => {
  if (!Array.isArray(plans) || plans.length === 0) return null;
  const items = plans
    .filter(
      (plan) =>
        plan && typeof plan.title === "string" && plan.title.trim().length > 0,
    )
    .map((plan) => ({
      title: plan.title,
      meta: formatPlanMeta(plan),
      description:
        plan.description?.trim() || tt("Open this plan to see the daily passages."),
    }));
  return items.length > 0 ? items : null;
};

// ─── Subscription tiers ───────────────────────────────────────────────────────

export interface TierOverride {
  name?: string;
  description?: string;
  /** Cents, matching the convention used by the tier cards. */
  monthlyPrice?: number;
  slotLimit?: number | null;
}

const toCents = (amount: number): number => Math.round(amount * 100);

/** `legacy_sower_monthly` and `legacy_sower` describe the same plan. */
const baseTierId = (id: string): string => id.replace(/_monthly$/, "");

/**
 * Turn the flat `/landing/get-tiers` list into per-plan overrides the tier
 * cards can merge over their curated design metadata. The API returns yearly
 * and `_monthly` rows in currency units; the cards expect a monthly price in
 * cents, so a yearly-only tier is divided by twelve.
 */
export const buildTierOverrides = (
  tiers: LandingTier[] | null | undefined,
): Record<string, TierOverride> => {
  if (!Array.isArray(tiers) || tiers.length === 0) return {};

  const overrides: Record<string, TierOverride> = {};

  tiers.forEach((tier) => {
    if (!tier?.id || typeof tier.price !== "number" || !Number.isFinite(tier.price)) {
      return;
    }
    const id = baseTierId(tier.id);
    const existing = overrides[id] ?? {};
    const override: TierOverride = { ...existing };

    if (tier.name?.trim()) override.name = tier.name.trim();
    if (tier.description?.trim()) override.description = tier.description.trim();
    if (tier.maxSlots !== undefined) override.slotLimit = tier.maxSlots ?? null;

    if (tier.interval === "month") {
      override.monthlyPrice = toCents(tier.price);
    } else if (tier.interval === "year" && existing.monthlyPrice === undefined) {
      override.monthlyPrice = Math.round(toCents(tier.price) / 12);
    }

    overrides[id] = override;
  });

  return overrides;
};

/**
 * Tier display names in matrix column order (free, legacy, covenant).
 * Returns null when the API does not cover a column so the caller can keep the
 * curated names.
 */
export const resolveTierNames = (
  tiers: LandingTier[] | null | undefined,
  fallbackNames: string[],
): string[] => {
  const overrides = buildTierOverrides(tiers);
  const resolved = fallbackNames.map((fallback, index) => {
    const id = ["free", "legacy_sower", "covenant_sower"][index];
    return id ? overrides[id]?.name ?? fallback : fallback;
  });
  return resolved;
};
