import { useCallback, useEffect, useMemo, useState } from "react";
import { sendPostRequest } from '@/services/api';
import { planMatrixFromPlans } from '../utils/planCards';
import type { Plan } from './useSowerPage';
import type { LandingTier } from "@/features/Auth/services/landingService";
import {
  PLAN_TIER_NAMES,
} from "@/features/Subscription/constants";
import { buildTierOverrides, resolveTierNames } from "@/features/Auth/utils";
import type { TierOverride } from "@/features/Auth/utils";

/**
 * Public and authenticated plan pages share the same catalog endpoint. Only
 * visual styling is curated; prices and benefits are never invented on failure.
 */
export function usePublicPlanTiers() {
  const [tiers, setTiers] = useState<LandingTier[]>([]);

  const fetchTiers = useCallback(async () => {
    const result = await sendPostRequest('subscriptions', 'tiers', {});
    return result.returnCode === 200 && Array.isArray(result.returnData?.tiers) ? result.returnData.tiers as LandingTier[] : [];
  }, []);

  const loadTiers = useCallback(async () => {
    const payload = await fetchTiers();
    setTiers(payload);
  }, [fetchTiers]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const payload = await fetchTiers();
      if (!cancelled) setTiers(payload);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchTiers]);

  const tierOverrides = useMemo(() => buildTierOverrides(tiers), [tiers]);
  const tierNames = useMemo(
    () => resolveTierNames(tiers, PLAN_TIER_NAMES),
    [tiers],
  );

  return {
    data: {
      tierOverrides: tierOverrides as Record<string, TierOverride>,
      plans: tiers as unknown as Plan[],
      tierNames,
      categories: planMatrixFromPlans(tiers),
      hasLiveTiers: tiers.length > 0,
    },
    actions: { refresh: loadTiers },
  };
}
