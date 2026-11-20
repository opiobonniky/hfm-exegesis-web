import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useDailyVersesPage } from './useDailyVersesPage';

const mocks = vi.hoisted(() => ({ request: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock('@/features/Admin/services/adminApi', () => ({ adminApi: { request: mocks.request } }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/components/Routes/routes', () => ({ routes: {
  addDailyVerse: { path: '/add-daily-verse' }, dailyVerseDetail: { path: '/daily-verse-detail' },
} }));
beforeEach(() => { vi.clearAllMocks(); mocks.request.mockResolvedValue({ returnCode: 200, returnData: { content: [], totalElements: 0 } }); });
afterEach(cleanup);

it('loads only verses and resets pagination when the publish-date filter changes', async () => {
  const { result } = renderHook(useDailyVersesPage);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses', expect.objectContaining({ page: 0, smartDefault: false }));
  act(() => result.current.setPage(2));
  await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses', expect.objectContaining({ page: 2 })));
  act(() => result.current.changeStartDate('2026-11-10'));
  await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses', expect.objectContaining({ page: 0, startDate: '2026-11-10', listPreview: true })));
  expect(mocks.request.mock.lastCall?.[2]).not.toHaveProperty('endDate');
  act(() => result.current.changeEndDate('2026-11-21'));
  await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses', expect.objectContaining({ page: 0, startDate: '2026-11-10', endDate: '2026-11-21' })));
});

it('combines selected book and chapter with debounced general search', async () => {
  const { result } = renderHook(useDailyVersesPage);
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.changeBook('John'));
  await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses',
    expect.objectContaining({ page: 0, exactBookName: 'John' })));
  act(() => result.current.changeChapter('3'));
  await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses',
    expect.objectContaining({ exactBookName: 'John', chapter: 3 })));
  act(() => result.current.changeSearch(' Ada '));
  expect(mocks.request.mock.lastCall?.[2]).not.toHaveProperty('search');
  await waitFor(() => expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses',
    expect.objectContaining({ exactBookName: 'John', chapter: 3, search: 'Ada' })));
  await act(async () => result.current.clearFilters());
  expect(mocks.request.mock.lastCall?.[2]).toEqual({ page: 0, size: expect.any(Number), smartDefault: false, listPreview: true });
});

it('loads the full verse by ID only when opening it', async () => {
  const { result } = renderHook(useDailyVersesPage);
  await waitFor(() => expect(result.current.loading).toBe(false));
  const verse = { id: 1, displayDate: '2026-11-21', isPublished: true };
  act(() => result.current.add());
  expect(mocks.navigate).toHaveBeenLastCalledWith('/add-daily-verse');
  const fullVerse = { ...verse, wordStudies: 'Full content' };
  mocks.request.mockResolvedValue({ returnCode: 200, returnData: { content: [fullVerse] } });
  await act(() => result.current.edit(verse));
  expect(mocks.request).toHaveBeenLastCalledWith('admin', 'get-all-daily-verses', { id: 1, size: 1 }, { includeLanguage: false });
  expect(mocks.navigate).toHaveBeenLastCalledWith('/add-daily-verse', { state: { verse: fullVerse } });
  await act(() => result.current.view(verse));
  expect(mocks.navigate.mock.calls.at(-1)?.[0]).toMatch(/^\/daily-verse-detail\?verse=/);
});
