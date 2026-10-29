import { TIERS, type TierConfig } from '../components/SowerTierCards';
import type { Plan } from '../hooks/useSowerPage';
import type { PlanMatrixCategory } from '../types';

export function buildPlanCards(plans: Plan[], interval: 'month' | 'year'): TierConfig[] {
  return TIERS.map(design => {
    const plan = plans.find(p => p.id.replace(/_monthly$/, '') === design.id &&
      (design.id === 'free' || p.interval === interval) && p.isActive !== false);
    const valid = plan && Number.isFinite(Number(plan.price)) && Number(plan.price) >= 0;
    const cents = valid ? Math.round(Number(plan.price) * 100) : 0;
    return {
      ...design,
      name: plan?.name || design.name,
      description: plan?.description || '',
      monthlyPrice: cents,
      yearlyPrice: cents,
      currency: plan?.currency || 'usd',
      available: Boolean(valid && plan.checkoutAvailable !== false && plan.source !== 'fallback'),
      features: (plan?.features || []).filter((f): f is string => typeof f === 'string').map(text => ({ text, included: true })),
    };
  });
}

export function planMatrixFromPlans(plans: Pick<Plan, 'id' | 'features' | 'isActive'>[]): PlanMatrixCategory[] {
  const active = plans.filter(plan => plan.isActive !== false && Array.isArray(plan.features));
  const features = [...new Set(active.flatMap(plan => plan.features).filter((text): text is string => typeof text === 'string'))];
  if (!features.length) return [];
  const includes = (id: string, feature: string) => active.some(plan => plan.id.replace(/_monthly$/, '') === id && plan.features.includes(feature));
  return [{ category: 'Published plan benefits', items: features.map(label => ({
    label, free: includes('free', label), legacy: includes('legacy_sower', label), covenant: includes('covenant_sower', label),
  })) }];
}
