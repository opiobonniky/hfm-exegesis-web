import type { PropsWithChildren } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BibleReadingPlan from './BibleReadingPlan';

vi.mock('@/components/Gate', () => ({ default: ({ children }: PropsWithChildren) => children }));
vi.mock('@/components/Routes/routes', () => ({ routes: {} }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('../hooks/useBibleReadingPlanPage', () => ({ useBibleReadingPlanPage: () => ({
  data: { isRtl: false, t: {}, statItems: [], tabs: [], activeTab: 'progress', loading: false }, actions: {},
}) }));
vi.mock('../components/ReadingPlanProgressTab', () => ({ ReadingPlanProgressTab: () => <div data-testid="plan-content" /> }));
vi.mock('../components/ReadingPlanBrowseTab', () => ({ ReadingPlanBrowseTab: () => null }));
vi.mock('../components/PlanModals', () => ({ StartPlanModal: () => null, RemovePlanModal: () => null }));

afterEach(cleanup);

it('lets the app shell own bottom-tab clearance instead of adding another full viewport', () => {
  const { container } = render(<BibleReadingPlan />);
  expect(container.firstElementChild).toHaveClass('min-h-0');
  expect(container.firstElementChild).not.toHaveClass('min-h-screen');
  expect(screen.getByTestId('plan-content').parentElement).toHaveClass('pb-3', 'md:pb-8');
});
