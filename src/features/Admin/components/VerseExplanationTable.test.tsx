// VerseExplanationTable — creator name + creation date on the bottom card row, icons left of it
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { VerseExplanationTable } from './VerseExplanationTable';
import type { VerseExplanationListItem } from '../types';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/components/languages/languageProvider', () => ({
  useLanguage: () => ({ lang: 'en', t: {}, isRtl: false }),
}));

afterEach(cleanup);

const item = {
  id: 7,
  sortOrder: 430,
  bookName: 'John',
  chapter: 3,
  verseNumber: 16,
  explanation: 'God so loved the world',
  learnMore: 'The gospel of Jesus',
  isPublished: true,
  bibleVersion: 'KJV',
  creatorName: 'Ada Lovelace',
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: null as string | null,
};

function renderTable(itemOverride: Partial<VerseExplanationListItem> = {}, handlers: Record<string, ReturnType<typeof vi.fn>> = {}) {
  return render(
    <VerseExplanationTable
      items={[{ ...item, ...itemOverride }]}
      onView={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...handlers}
    />,
  );
}

it('shows the creator name and created date at the bottom of the card', () => {
  renderTable();
  expect(screen.getAllByText(/Created by:/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Ada Lovelace/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Created date:/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Jan 1, 2026/).length).toBeGreaterThan(0);
});

it('falls back to the updated date when the creation date is missing', () => {
  renderTable({ createdOn: null, updatedOn: '2026-02-14T00:00:00.000Z', creatorName: null });
  expect(screen.getAllByText(/Created by:/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Feb 14, 2026/).length).toBeGreaterThan(0);
});

it('shows the creation label and preserves the exact timestamp when both times are equal', () => {
  const { container } = renderTable({ updatedOn: item.createdOn });
  expect(screen.getByText(/Created date:/)).toBeTruthy();
  expect(screen.queryByText(/Updated date:/)).toBeNull();
  expect(container.querySelector('time')?.dateTime).toBe(item.createdOn);
});

it('labels the legacy fallback as a study date and does not invent a date if no timestamp exists', () => {
  const date = '2026-02-14T00:00:00.000Z';
  const { container, unmount } = renderTable({ createdOn: null, studyCreatedOn: date });
  expect(screen.getByText(/Study created:/)).toBeTruthy();
  expect(container.querySelector('time')).toHaveAttribute('datetime', date);
  unmount();
  renderTable({ createdOn: null });
  expect(screen.getByText('Date not recorded')).toBeTruthy();
});

it('shows the updated date instead of the created date when it is newer', () => {
  renderTable({
    createdOn: '2026-01-01T00:00:00.000Z',
    updatedOn: '2026-03-05T00:00:00.000Z',
  });
  expect(screen.getAllByText(/Updated date:/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Mar 5, 2026/).length).toBeGreaterThan(0);
  expect(screen.queryAllByText(/Created date:/).length).toBe(0);
  expect(screen.queryAllByText(/Jan 1, 2026/).length).toBe(0);
});

it('keeps the eye, edit and delete icons on the card actions', () => {
  const onView = vi.fn();
  const { container } = renderTable({}, { onView });
  const buttons = container.querySelectorAll('button');
  fireEvent.click(buttons[0]);
  expect(onView).toHaveBeenCalledWith(item);
  expect(container.querySelectorAll('button[title="View"]')[0]).toBeTruthy();
});
