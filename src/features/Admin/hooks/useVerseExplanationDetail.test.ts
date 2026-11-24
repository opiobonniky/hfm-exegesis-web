import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useVerseExplanationDetail } from './useVerseExplanationDetail';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  getVerse: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
  state: null as null | { id?: number | string; bookName?: string; chapter?: number; verseNumber?: number; index?: number },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ state: mocks.state }),
}));
vi.mock('@/features/Admin/services/adminApi', () => ({
  adminApi: { request: mocks.request, getVerse: mocks.getVerse },
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = { bookName: 'Ecclesiastes', chapter: 3, verseNumber: 11 };
  mocks.request.mockResolvedValue({
    returnCode: 200,
    returnData: {
      id: 42,
      bookName: 'Ecclesiastes',
      chapter: 3,
      verseNumber: 11,
      bibleVersion: 'BSB',
    },
  });
  mocks.getVerse.mockResolvedValue({ text: 'He has made everything beautiful.' });
});
afterEach(cleanup);

it('loads the passage from router state, not the URL path', async () => {
  const { result } = renderHook(useVerseExplanationDetail);

  await waitFor(() => expect(result.current.data.loading).toBe(false));

  expect(mocks.request).toHaveBeenCalledWith('bible', 'get-verse-explanation', {
    bookName: 'Ecclesiastes',
    chapter: 3,
    verseNumber: 11,
  });
  expect(result.current.data.item).toMatchObject({ id: 42, verseNumber: 11 });
  await waitFor(() =>
    expect(result.current.data.item?.verseText).toBe('He has made everything beautiful.'),
  );
  expect(mocks.navigate).not.toHaveBeenCalled();
});

it('loads by explanation id when the row passes one', async () => {
  mocks.state = { id: 42, bookName: 'Ecclesiastes', chapter: 3, verseNumber: 11, index: 4 };
  const { result } = renderHook(useVerseExplanationDetail);

  await waitFor(() => expect(result.current.data.loading).toBe(false));

  expect(mocks.request).toHaveBeenCalledExactlyOnceWith(
    'bible',
    'get-verse-explanation-for-edit',
    { id: '42' },
    { includeLanguage: false },
  );
  expect(result.current.data.item).toMatchObject({ id: 42 });

  act(() => result.current.actions.backToList());
  expect(mocks.navigate).toHaveBeenCalledWith('/admin/verse-explanations', {
    state: { restoreId: 42, restoreIndex: 4 },
  });
});

it('falls back to the passage when the id lookup fails', async () => {
  mocks.state = { id: 42, bookName: 'Ecclesiastes', chapter: 3, verseNumber: 11 };
  mocks.request
    .mockResolvedValueOnce({ returnCode: 404 })
    .mockResolvedValueOnce({ returnCode: 200, returnData: { id: 42, bookName: 'Ecclesiastes', chapter: 3, verseNumber: 11 } });
  const { result } = renderHook(useVerseExplanationDetail);

  await waitFor(() => expect(result.current.data.loading).toBe(false));

  expect(mocks.request).toHaveBeenNthCalledWith(1, 'bible', 'get-verse-explanation-for-edit', { id: '42' }, { includeLanguage: false });
  expect(mocks.request).toHaveBeenNthCalledWith(2, 'bible', 'get-verse-explanation', {
    bookName: 'Ecclesiastes',
    chapter: 3,
    verseNumber: 11,
  });
  expect(result.current.data.item).toMatchObject({ id: 42 });
});

it('returns to the list when the static detail URL is opened without a reference', async () => {
  mocks.state = null;
  const { result } = renderHook(useVerseExplanationDetail);

  await waitFor(() =>
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/verse-explanations', { replace: true }),
  );
  expect(mocks.request).not.toHaveBeenCalled();
  expect(result.current.data.item).toBeNull();
});
