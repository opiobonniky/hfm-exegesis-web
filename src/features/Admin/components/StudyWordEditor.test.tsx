import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudyWordEditor } from './StudyWordEditor';

const mocks = vi.hoisted(() => ({ update: vi.fn(), attachments: vi.fn(), saveAttachment: vi.fn(), removeAttachment: vi.fn(), remove: vi.fn(), toast: vi.fn() }));
vi.mock('../services/studyToolsApi', () => ({ wordStudyApi: { ...mocks, delete: mocks.remove } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ lang: 'en' }) }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: {
  getTranslations: vi.fn(async () => [{ id: 'Berean', language: 'en', languageName: 'English', name: 'Berean Standard Bible', shortName: 'BSB' }]),
  getBooks: vi.fn(async () => [{ bookName: 'Genesis' }, { bookName: 'John' }]),
  getChapters: vi.fn(async () => ({ chapters: [{ chapterNumber: 1, versesCount: 31 }] })),
  getVerses: vi.fn(async () => ({ verses: [{ verseNumber: 1, text: 'In the beginning God created the heavens and the earth.' }] })),
} }));
vi.mock('@/components/ui/combobox', () => ({ Combobox: ({ value, onChange, options, disabled }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; disabled?: boolean }) => <select value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.attachments.mockResolvedValue({ returnCode: 200, returnData: { data: [], hasNext: false } });
});

describe('two-step study word entry', () => {
  it('saves the dictionary word first, then links it to a verse without old resource tabs', async () => {
    const saved = vi.fn();
    mocks.update.mockResolvedValue({ returnCode: 200, returnData: { strongsId: 'H7225' } });
    mocks.saveAttachment.mockResolvedValue({ returnCode: 200 });
    render(<StudyWordEditor word={null} onClose={vi.fn()} onSaved={saved} />);
    expect(screen.getByRole('heading', { name: 'Word identity' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save verse attachment' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Strong’s ID/), { target: { value: 'H7225' } });
    fireEvent.change(screen.getByLabelText(/Short definition/), { target: { value: 'beginning' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save dictionary entry' }));
    await screen.findByText('Link to a Bible verse');
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ strongsId: 'H7225', shortDefinition: 'beginning', language: 'hebrew' }));
    await screen.findByText('In the beginning God created the heavens and the earth.');
    fireEvent.change(screen.getByLabelText('From word'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('To word'), { target: { value: '2' } });
    expect(screen.getByLabelText('Word or phrase in this verse')).toHaveValue('In the beginning');
    fireEvent.change(screen.getByLabelText(/Meaning in this verse/), { target: { value: 'The beginning of creation' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save verse attachment' }));
    await waitFor(() => expect(mocks.saveAttachment).toHaveBeenCalledWith(expect.objectContaining({ strongsId: 'H7225', bookName: 'Genesis', chapter: 1, verse: 1, translation: 'Berean', surfaceText: 'In the beginning', adminExplanation: 'The beginning of creation' })));
    expect(screen.queryByRole('tab', { name: 'Resources' })).not.toBeInTheDocument();
  });

  it('keeps the editor open and reports a failed save', async () => {
    mocks.update.mockResolvedValue({ returnCode: 400, returnMessage: 'Definition required' });
    render(<StudyWordEditor word={null} onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Strong’s ID/), { target: { value: 'G3056' } });
    fireEvent.change(screen.getByLabelText(/Short definition/), { target: { value: 'word' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save dictionary entry' }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Definition required', variant: 'destructive' })));
    expect(screen.queryByRole('button', { name: 'Save verse attachment' })).not.toBeInTheDocument();
  });

  it('adds and removes cross references with passage selectors, not a text field', async () => {
    mocks.update.mockResolvedValue({ returnCode: 200, returnData: { strongsId: 'G3056' } });
    render(<StudyWordEditor word={null} onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Strong’s ID/), { target: { value: 'G3056' } });
    fireEvent.change(screen.getByLabelText(/Short definition/), { target: { value: 'word' } });
    expect(screen.queryByRole('textbox', { name: /Cross references/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add cross reference' }));
    const first = screen.getByRole('group', { name: 'Cross reference 1' });
    fireEvent.change(within(first).getByLabelText('Book'), { target: { value: 'John' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add cross reference' }));
    const second = screen.getByRole('group', { name: 'Cross reference 2' });
    fireEvent.change(within(second).getByLabelText('Book'), { target: { value: 'Genesis' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save dictionary entry' }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ crossReferences: 'John 1:1; Genesis 1:1' })));
    fireEvent.click(screen.getByRole('button', { name: 'Remove cross reference 1' }));
    expect(screen.queryByRole('group', { name: 'Cross reference 2' })).not.toBeInTheDocument();
  });
});
