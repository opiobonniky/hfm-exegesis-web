import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddBookPrologueBasicForm } from './AddBookPrologueBasicForm';
import { useAddBookPrologue } from '../hooks/useAddBookPrologue';
import { prologueToForm } from '../services/bookProloguesApi';

const mocks = vi.hoisted(() => ({ params: {} as { bookName?: string }, save: vi.fn(), fetch: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate, useParams: () => mocks.params }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ lang: 'en' }) }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: { getTranslations: vi.fn().mockResolvedValue([{ id: 'Berean', language: 'en', name: 'Berean Standard Bible', shortName: 'BSB' }]) } }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('../services/bookProloguesApi', async importOriginal => ({ ...await importOriginal<typeof import('../services/bookProloguesApi')>(), fetchBookPrologue: mocks.fetch, upsertBookPrologue: mocks.save }));
vi.mock('@/components/ui/combobox', () => ({ Combobox: ({ options, value, onChange, disabled, searchPlaceholder }: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; disabled: boolean; searchPlaceholder: string }) => <select aria-label={searchPlaceholder} value={value} onChange={event => onChange(event.target.value)} disabled={disabled}><option value="">Select a Bible book</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));

function Editor() {
  const { data, actions } = useAddBookPrologue();
  return <><AddBookPrologueBasicForm state={{ ...data, ...actions }} /><button disabled={!data.isValid} onClick={actions.handleSave}>Save prologue</button></>;
}

beforeEach(() => {
  vi.clearAllMocks(); mocks.params = {};
  mocks.save.mockResolvedValue({ ok: true });
});

describe('prologue title input and book selection', () => {
  it('adds using a selected canonical book and saves the typed title', async () => {
    render(<Editor />);
    const books = screen.getByRole('combobox', { name: 'Search Bible books...' });
    expect(screen.getByRole('option', { name: 'Psalms' })).toHaveValue('Psalms');
    expect(screen.queryByPlaceholderText('Search for a book...')).not.toBeInTheDocument();
    fireEvent.change(books, { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'The Gospel of John' } });
    fireEvent.change(screen.getByPlaceholderText('Brief overview of the book...'), { target: { value: 'A book about life in Christ.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save prologue' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ bookName: 'John', title: 'The Gospel of John' })));
  });

  it('loads the saved title, allows changing it, and keeps the book fixed when editing', async () => {
    mocks.params = { bookName: 'John' };
    mocks.fetch.mockResolvedValue(prologueToForm({ bookName: 'John', title: 'The Gospel of John', summary: 'An overview' }));
    render(<Editor />);
    await screen.findByDisplayValue('The Gospel of John');
    expect(screen.getByRole('combobox', { name: 'Search Bible books...' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Life in His Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save prologue' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ bookName: 'John', title: 'Life in His Name' })));
  });
});
