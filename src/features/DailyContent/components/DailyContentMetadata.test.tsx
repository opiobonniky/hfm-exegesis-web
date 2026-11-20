import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DailyContentMetadata } from './DailyContentMetadata';
import { DevotionList } from './DevotionList';

vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ t: {}, lang: 'en' }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
afterEach(cleanup);

it('renders creator, creation date and scheduled publish date without inventing missing data', () => {
  const { rerender } = render(<DailyContentMetadata creatorName="Ada Lovelace" createdOn="2026-11-20" displayDate="2026-11-21" />);
  expect(screen.getByText('Created by')).toBeTruthy();
  expect(screen.getByText('Ada Lovelace')).toBeTruthy();
  expect(screen.getByText('Created date')).toBeTruthy();
  expect(screen.getByText('Publish date')).toBeTruthy();
  rerender(<DailyContentMetadata createdOn="invalid" />);
  expect(screen.getAllByText('—')).toHaveLength(3);
});

it('shows a theme-aware published badge when requested', () => {
  const { container } = render(
    <DailyContentMetadata creatorName="Ada" createdOn="2026-11-20" displayDate="2026-11-21" showStatus isPublished />,
  );
  const badge = screen.getByText('Published');
  expect(badge.closest('span')?.className).toContain('text-[hsl(var(--success))]');
  expect(container.querySelector('dl')?.className).toContain('space-y-1');
});

it('uses a compact responsive devotion grid with independent view, edit and delete actions', () => {
  const select = vi.fn(), edit = vi.fn(), remove = vi.fn();
  const item = { id: 18, title: 'Forgive', explanation: 'Body', creatorName: 'Ada', createdOn: '2026-11-20', displayDate: '2026-11-21', isPublished: true };
  const { container } = render(<DevotionList devotions={[item]} selectedIndex={0} isAdmin onSelect={select} onEdit={edit} onDelete={remove} />);
  expect(container.firstChild).toHaveClass('grid', 'xl:grid-cols-3', '2xl:grid-cols-4');
  fireEvent.click(screen.getByRole('button', { name: 'Edit devotion' }));
  expect(edit).toHaveBeenCalledWith(item);
  expect(select).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Forgive Body' }));
  expect(select).toHaveBeenCalledWith(0);
  expect(screen.getByText('Ada')).toBeTruthy();
});
