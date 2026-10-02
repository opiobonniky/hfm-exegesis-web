import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchLandingTiers } from "@/features/Auth/services/landingService";
import type { LandingTier } from "@/features/Auth/services/landingService";
import {
  PLAN_TIER_NAMES,
  PUBLIC_PLAN_MATRIX,
} from "@/features/Subscription/constants";
import { buildTierOverrides, resolveTierNames } from "@/features/Auth/utils";
import type { TierOverride } from "@/features/Auth/utils";

/**
 * Subscription tiers for the public plans page. Names, pricing and supporter
 * limits come from the backend (Stripe/DB source of truth); the curated
 * feature matrix and card design stay in code. Static values are used until the
 * request resolves, and kept if it fails.
 */
export function usePublicPlanTiers() {
  const [tiers, setTiers] = useState<LandingTier[]>([]);

  const loadTiers = useCallback(async () => {
    const payload = await fetchLandingTiers();
    setTiers(payload);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const payload = await fetchLandingTiers();
      if (!cancelled) setTiers(payload);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tierOverrides = useMemo(() => buildTierOverrides(tiers), [tiers]);
  const tierNames = useMemo(
    () => resolveTierNames(tiers, PLAN_TIER_NAMES),
    [tiers],
  );

  return {
    data: {
      tierOverrides: tierOverrides as Record<string, TierOverride>,
      tierNames,
      categories: PUBLIC_PLAN_MATRIX,
      hasLiveTiers: tiers.length > 0,
    },
    actions: { refresh: loadTiers },
  };
}