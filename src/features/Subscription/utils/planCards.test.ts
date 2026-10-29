import { expect, it } from 'vitest';
import { buildPlanCards, planMatrixFromPlans } from './planCards';
import type { Plan } from '../hooks/useSowerPage';
const plan: Plan = { id: 'legacy_sower_monthly', name: 'Live name', description: 'Live description', price: 4.5, currency: 'eur', interval: 'month', features: ['Published benefit'], checkoutAvailable: true };
it('renders backend cadence, currency, benefits and names', () => {
  expect(buildPlanCards([plan], 'month')[1]).toMatchObject({ name: 'Live name', currency: 'eur', monthlyPrice: 450, available: true, features: [{ text: 'Published benefit', included: true }] });
});
it('never invents prices or paid benefits for missing/fallback plans', () => {
  expect(buildPlanCards([plan], 'year')[1]).toMatchObject({ available: false, features: [] });
  expect(buildPlanCards([{ ...plan, source: 'fallback' }], 'month')[1].available).toBe(false);
  expect(buildPlanCards([{ ...plan, isActive: false }], 'month')[1].available).toBe(false);
  expect(planMatrixFromPlans([plan])[0].items).toEqual([{ label: 'Published benefit', free: false, legacy: true, covenant: false }]);
});
