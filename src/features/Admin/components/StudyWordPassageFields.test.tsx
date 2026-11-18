import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudyWordPassageFields, type WordPassage } from './StudyWordPassageFields';

const mocks = vi.hoisted(() => ({ catalog: vi.fn(), books: vi.fn(), chapters: vi.fn(), verses: vi.fn() }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: { getTranslations: mocks.catalog, getBooks: mocks.books, getChapters: mocks.chapters, getVerses: mocks.verses } }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ lang: 'en' }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/components/ui/combobox', () => ({ Combobox: ({ options, value, onChange, disabled, searchPlaceholder }: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; disabled?: boolean; searchPlaceholder: string }) => <select aria-label={searchPlaceholder} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}><option value="">Choose</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));

function Harness() {
  const [value, setValue] = useState<WordPassage>({ bookName: 'Genesis', chapter: 1, verse: 1, translation: 'BSB', surfaceText: '' });
  const [ready, setReady] = useState(false);
  return <><StudyWordPassageFields value={value} onChange={patch => setValue(previous => ({ ...previous, ...patch }))} locked={false} busy={false} onReady={setReady} /><button disabled={!ready || !value.surfaceText}>Save link</button></>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.catalog.mockResolvedValue([
    { id: 'Berean', shortName: 'BSB', name: 'Berean Standard Bible', language: 'en', languageName: 'English' },
    { id: 'French', shortName: 'LSG', name: 'Louis Segond', language: 'fr', languageName: 'French' },
  ]);
  mocks.books.mockResolvedValue([{ bookName: 'Genesis' }, { bookName: 'John' }]);
  mocks.chapters.mockResolvedValue({ chapters: [{ chapterNumber: 1, versesCount: 3 }] });
  mocks.verses.mockResolvedValue({ verses: [{ verseNumber: 1, text: 'In the beginning God created.' }, { verseNumber: 2, text: 'The earth was formless.' }] });
});

describe('edition-aware verse word selection', () => {
  it('uses real verse text and counts, and clears the phrase when the verse changes', async () => {
    render(<Harness />);
    await screen.findByText('In the beginning God created.');
    expect(mocks.verses).toHaveBeenCalledWith('Berean', 'Genesis', 1);
    expect(screen.getByLabelText('Search verses...').querySelectorAll('option')).toHaveLength(4);
    fireEvent.change(screen.getAllByLabelText('Search verse words...')[0], { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('To word'), { target: { value: '2' } });
    expect(screen.getByLabelText('Word or phrase in this verse')).toHaveValue('In the beginning');
    expect(screen.getByRole('button', { name: 'Save link' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Search verses...'), { target: { value: '2' } });
    await screen.findByText('The earth was formless.');
    expect(screen.getByLabelText('Word or phrase in this verse')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save link' })).toBeDisabled();
  });

  it('only offers editions in the interface language', async () => {
    render(<Harness />);
    await screen.findByText('In the beginning God created.');
    await waitFor(() => expect(screen.getByLabelText('Search Bible editions...')).toBeEnabled());
    expect(screen.getByLabelText('Search Bible editions...')).toHaveTextContent('Berean Standard Bible');
    expect(screen.getByLabelText('Search Bible editions...')).not.toHaveTextContent('Louis Segond');
  });

  it('prevents saving a failed verse fetch and allows retry', async () => {
    mocks.verses.mockRejectedValue(new Error('Verse unavailable'));
    render(<Harness />);
    await screen.findByText('Verse unavailable');
    expect(screen.getByRole('button', { name: 'Save link' })).toBeDisabled();
    mocks.verses.mockResolvedValue({ verses: [{ verseNumber: 1, text: 'Recovered verse.' }] });
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('Recovered verse.');
  });
});
