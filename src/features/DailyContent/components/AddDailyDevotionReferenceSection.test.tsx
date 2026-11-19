import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddDailyDevotionReferenceSection } from './AddDailyDevotionReferenceSection';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

const props = {
  book: 'John',
  chapter: '3',
  verseNumber: '16',
  bibleVersion: 'BSB',
  verseNumbers: [15, 16, 17],
  verseText: 'For God so loved the world.',
  isVerseLoading: false,
  bibleVersionOptions: [{ value: 'BSB', label: 'BSB' }],
  setBook: vi.fn(),
  setChapter: vi.fn(),
  setVerseNumber: vi.fn(),
  setBibleVersion: vi.fn(),
};

describe('AddDailyDevotionReferenceSection', () => {
  it('starts with searchable book, chapter, and verse selectors without Testament', () => {
    render(<AddDailyDevotionReferenceSection {...props} />);

    expect(screen.queryByText('Testament')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Book' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Chapter' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Verse' })).toBeInTheDocument();
  });

  it('shows the fetched selected verse text', () => {
    render(<AddDailyDevotionReferenceSection {...props} />);

    expect(screen.getByText('John 3:16 · BSB')).toBeInTheDocument();
    expect(screen.getByText('For God so loved the world.')).toBeInTheDocument();
  });
});
