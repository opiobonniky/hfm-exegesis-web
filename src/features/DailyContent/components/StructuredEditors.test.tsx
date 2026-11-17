import { useState } from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CrossReferencePicker } from './CrossReferencePicker';
import { WordStudyEditor } from './WordStudyEditor';
import { usePassagePreview } from '../hooks/usePassagePreview';
import type { StudyEntry } from '../helpers/editorContent';

const mocks = vi.hoisted(() => ({ verses: vi.fn(), strongs: vi.fn() }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: { getVerses: (...args: unknown[]) => mocks.verses(...args) } }));
vi.mock('@/services/strongsApi', () => ({ getStrongsEntry: (...args: unknown[]) => mocks.strongs(...args) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (s: string) => s }));
vi.mock('@/components/ui/combobox', () => ({ Combobox: (p: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; disabled: boolean; ariaLabel: string }) =>
  <select aria-label={p.ariaLabel} value={p.value || ''} disabled={p.disabled} onChange={e => p.onChange(e.target.value)}><option value="">Select</option>{p.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>,
}));
const chapter = { verses: Array.from({ length: 14 }, (_, i) => ({ verseNumber: i + 1, text: `Text ${i + 1}` })) };
beforeEach(() => { vi.clearAllMocks(); mocks.verses.mockResolvedValue(chapter); });

describe('passage previews', () => {
  it('automatically quotes every verse in Genesis 3:6-10', async () => {
    const { result } = renderHook(() => usePassagePreview('Genesis', 3, 6, 10, 'BSB'));
    await waitFor(() => expect(result.current.text).toBe('6. Text 6\n7. Text 7\n8. Text 8\n9. Text 9\n10. Text 10'));
    expect(mocks.verses).toHaveBeenCalledWith('BSB', 'Genesis', 3);
  });
  it('ignores late responses after book/translation changes', async () => {
    let resolve!: (value: typeof chapter) => void;
    mocks.verses.mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    const { result, rerender } = renderHook(({ book, version }) => usePassagePreview(book, 3, 1, undefined, version), { initialProps: { book: 'Genesis', version: 'BSB' } });
    rerender({ book: 'Exodus', version: 'KJV' });
    await waitFor(() => expect(result.current.text).toBe('Text 1'));
    await act(async () => resolve({ verses: [{ verseNumber: 1, text: 'Old request' }] }));
    expect(result.current.text).toBe('Text 1');
    rerender({ book: '', version: 'KJV' });
    expect(result.current.text).toBe('');
  });
  it('shows errors and retries instead of quoting the wrong translation', async () => {
    mocks.verses.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => usePassagePreview('Genesis', 3, 6, 10, 'BSB'));
    await waitFor(() => expect(result.current.error).toContain('Unable to load'));
    expect(result.current.text).toBe('');
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.text).toContain('10. Text 10'));
  });
});

describe('cross reference editor', () => {
  function Harness({ initial = 'Psalm 46:1 – Keep this original quotation' }: { initial?: string }) {
    const [value, setValue] = useState(initial);
    return <CrossReferencePicker value={value} onChange={setValue} bibleVersion="BSB" isRtl={false} />;
  }
  it('hydrates existing dropdowns and preserves the quotation on mount', async () => {
    render(<Harness />);
    expect(screen.getByLabelText('Book')).toHaveValue('Psalms');
    expect(screen.getByLabelText('Chapter')).toHaveValue('46');
    await waitFor(() => expect(screen.getByLabelText('Verse')).toHaveValue('1'));
    expect(screen.queryByLabelText('Through verse')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Keep this original quotation');
  });
  it('resets dependent fields, disables premature typing and auto-fills a range', async () => {
    render(<Harness initial="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add reference' }));
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByLabelText('Chapter')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Book'), { target: { value: 'Genesis' } });
    fireEvent.change(screen.getByLabelText('Chapter'), { target: { value: '3' } });
    await waitFor(() => expect(screen.getByLabelText('Verse')).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Verse range' }));
    fireEvent.change(screen.getByLabelText('From verse'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Through verse'), { target: { value: '10' } });
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('6. Text 6\n7. Text 7\n8. Text 8\n9. Text 9\n10. Text 10'));
    fireEvent.click(screen.getByRole('button', { name: 'Single verse' }));
    expect(screen.queryByLabelText('Through verse')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Verse')).toHaveValue('6');
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('Text 6'));
    fireEvent.change(screen.getByLabelText('Book'), { target: { value: 'Exodus' } });
    expect(screen.getByLabelText('Chapter')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
  it('loads duplicate references independently and clears externally reset values', async () => {
    const { rerender } = render(<CrossReferencePicker value={'Psalm 46:1 – One\nPsalm 46:2 – Two'} onChange={vi.fn()} bibleVersion="BSB" isRtl={false} />);
    await waitFor(() => expect(screen.getAllByLabelText('Verse')[1]).toHaveValue('2'));
    rerender(<CrossReferencePicker value="" onChange={vi.fn()} bibleVersion="BSB" isRtl={false} />);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });
  it('opens existing saved ranges in range mode without changing their quotation', async () => {
    render(<Harness initial="Genesis 3:6-10 – Saved range quotation" />);
    await waitFor(() => expect(screen.getByLabelText('Through verse')).toHaveValue('10'));
    expect(screen.getByLabelText('From verse')).toHaveValue('6');
    expect(screen.getByRole('button', { name: 'Verse range' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox')).toHaveValue('Saved range quotation');
  });
});

it('looks up Strong’s data without overwriting editorial text', async () => {
  mocks.strongs.mockResolvedValue({ originalWord: 'רָפָה', transliteration: 'raphah', shortDefinition: 'Let go', fullDefinition: 'Cease striving' });
  function Harness() {
    const [value, setValue] = useState<StudyEntry[]>([{ surfaceText: 'Be still', strongsId: 'H7503', customDefinition: 'My contextual definition' }]);
    return <WordStudyEditor value={value} onChange={setValue} />;
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Look up' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('raphah'));
  expect(screen.getByDisplayValue('My contextual definition')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Be still')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add word study' }));
  expect(screen.getAllByRole('textbox')).toHaveLength(6);
});
