import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DevotionFilterBar } from './DevotionFilterBar';

vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ t: {} }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
afterEach(cleanup);

const renderBar = () => render(
  <DevotionFilterBar
    fromDate="" toDate="" search="" activePreset={null} filterError="" isFiltered={false}
    onFromChange={vi.fn()} onToChange={vi.fn()} onSearchChange={vi.fn()}
    onClear={vi.fn()} onPreset={vi.fn()}
  />,
);

it('filters as you type with no Apply button', () => {
  renderBar();
  expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy();
  expect(screen.getByPlaceholderText('Search by title, book or creator')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Apply' })).toBeNull();
});

it('lays out small horizontal From and To date fields', () => {
  renderBar();
  const from = screen.getByRole('button', { name: 'From' }).closest('div')?.parentElement;
  const to = screen.getByRole('button', { name: 'To' }).closest('div')?.parentElement;
  expect(from?.parentElement).toBe(to?.parentElement);
  expect(from?.parentElement?.className).toContain('grid-cols-2');
});
