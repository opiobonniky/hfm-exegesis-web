import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useAddExplanation } from './useAddExplanation';

const mocks = vi.hoisted(() => ({ params: {} as Record<string, string>, post: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock('react-router-dom', () => ({ useParams: () => mocks.params, useNavigate: () => mocks.navigate }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (s: string) => s }));
vi.mock('@/components/Routes/routes', () => ({ routePaths: { adminDailyContent: '/admin/daily-content' }, routes: {} }));
vi.mock('@/services/api', () => ({ sendPostRequest: (...args: unknown[]) => mocks.post(...args) }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: {
  getTranslations: vi.fn().mockResolvedValue([{ id: 'BSB', name: 'Berean', shortName: 'BSB', language: 'English' }]),
  getVerses: vi.fn().mockResolvedValue({ verses: Array.from({ length: 14 }, (_, i) => ({ verseNumber: i + 1, text: `Text ${i + 1}` })) }),
} }));
beforeEach(() => { vi.clearAllMocks(); mocks.params = {}; mocks.post.mockResolvedValue({ returnCode: 200 }); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('creates a range explanation and validates its required reference and study rows', async () => {
  const { result } = renderHook(() => useAddExplanation());
  expect(result.current.data.isValid).toBe(false);
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
    result.current.actions.updateField('verseEnd', '10');
    result.current.actions.updateNested('exegesis', 'explanationText', 'An explanation with enough context and detail.');
  });
  await waitFor(() => expect(result.current.data.selectedVerseText).toContain('10. Text 10'));
  expect(result.current.data.isValid).toBe(true);
  act(() => result.current.actions.updateField('crossReferences', [{ bookName: 'Genesis', chapter: 3, verseNumber: 0, referenceText: 'Keep quotation', commentary: '', sortOrder: 0 }]));
  expect(result.current.data.isValid).toBe(false);
  expect(result.current.data.richContentError).toContain('Cross reference 1: select verse');
  act(() => result.current.actions.addWordStudy());
  expect(result.current.data.isValid).toBe(false);
  act(() => result.current.actions.removeWordStudy(0));
  act(() => result.current.actions.updateField('crossReferences', [{ bookName: '', chapter: 0, verseNumber: 0, referenceText: '', commentary: '', sortOrder: 0 }]));
  expect(result.current.data.isValid).toBe(true);
  vi.useFakeTimers();
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.post).toHaveBeenCalledWith('bible', 'add-verse-explanation', expect.objectContaining({ verseNumber: 6, verseEnd: 10 }));
  expect(mocks.post.mock.calls.at(-1)![2].crossReferences).toEqual([]);
  act(() => vi.advanceTimersByTime(500));
  expect(mocks.navigate).toHaveBeenCalledWith('/admin/daily-content');
  act(() => result.current.actions.updateField('bookName', 'Exodus'));
  expect(result.current.data.form.chapter).toBe('');
  expect(result.current.data.form.verseEnd).toBe('');
  expect(result.current.data.selectedVerseText).toBe('');
});

it('reopens and saves ranges and structured studies without losing existing IDs or commentary', async () => {
  mocks.params = { bookName: 'Genesis', chapter: '3', verseNumber: '6' };
  mocks.post.mockResolvedValueOnce({ returnCode: 200, returnData: {
    id: 44, bookName: 'Genesis', chapter: 3, verseNumber: 6, verseEnd: 10, bibleVersion: 'BSB',
    exegesis: { explanationText: 'An existing explanation with enough detail.', applicationText: '' },
    wordStudies: [{ surfaceText: 'Know', strongsId: 'H3045', customDefinition: 'Know intimately', sortOrder: 0 }],
    crossReferences: [{ bookName: 'Romans', chapter: 5, verseNumber: 1, verseEnd: 3, referenceText: 'Original quote', commentary: 'Editorial commentary' }],
  } });
  const { result } = renderHook(() => useAddExplanation());
  await waitFor(() => expect(result.current.data.isValid).toBe(true));
  expect(result.current.data.form.verseEnd).toBe('10');
  expect(result.current.data.form.crossReferences[0].commentary).toBe('Editorial commentary');
  vi.useFakeTimers();
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.post).toHaveBeenLastCalledWith('bible', 'add-verse-explanation', expect.objectContaining({ id: 44, verseEnd: 10,
    crossReferences: [expect.objectContaining({ verseEnd: 3, commentary: 'Editorial commentary' })],
    wordStudies: [expect.objectContaining({ strongsId: 'H3045', customDefinition: 'Know intimately' })],
  }));
});
