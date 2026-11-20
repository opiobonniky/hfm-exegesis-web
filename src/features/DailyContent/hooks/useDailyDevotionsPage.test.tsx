import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useDailyDevotionsPage } from './useDailyDevotionsPage';

const mocks = vi.hoisted(() => ({ post: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock('@/services/api', () => ({ sendPostRequest: mocks.post }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ t: {}, isRtl: false }) }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ userInfo: { userRole: 1 } }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.post.mockResolvedValue({ returnCode: 200, returnData: {
    content: [], totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  } });
});
afterEach(cleanup);

it('re-fetches immediately when a date is selected and resets the page', async () => {
  const { result } = renderHook(useDailyDevotionsPage);
  await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
  act(() => result.current.actions.setPage(2));
  await waitFor(() => expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions',
    expect.objectContaining({ page: 2 })));
  act(() => result.current.actions.changeFromDate('2026-11-01'));
  await waitFor(() => expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions',
    expect.objectContaining({ page: 0, startDate: '2026-11-01' })));
  act(() => result.current.actions.changeToDate('2026-11-20'));
  await waitFor(() => expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions',
    expect.objectContaining({ page: 0, endDate: '2026-11-20' })));
});

it('debounces the text search and clears every filter together', async () => {
  const { result } = renderHook(useDailyDevotionsPage);
  await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
  act(() => result.current.actions.changeSearch('Ada'));
  expect(result.current.data.search).toBe('Ada');
  await waitFor(() => expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions',
    expect.objectContaining({ search: 'Ada' })), { timeout: 1500 });
  act(() => result.current.actions.clearFilter());
  expect(result.current.data.search).toBe('');
  expect(result.current.data.isFiltered).toBe(false);
  await waitFor(() => expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions',
    expect.not.objectContaining({ search: expect.anything(), startDate: expect.anything() })));
});

it('applies presets without an extra Apply action', async () => {
  const { result } = renderHook(useDailyDevotionsPage);
  await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
  act(() => result.current.actions.applyPreset('last_7'));
  expect(result.current.data.activePreset).toBe('last_7');
  await waitFor(() => expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions',
    expect.objectContaining({ startDate: expect.any(String), endDate: expect.any(String) })));
});

it('requests lean cards, then loads the full canonical devotion by ID when editing', async () => {
  const { result } = renderHook(useDailyDevotionsPage);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  expect(mocks.post.mock.lastCall?.[2]).toEqual({ page: 0, size: 12, listPreview: true });
  const item = { id: 18, title: 'Forgive', displayDate: '2026-11-20', isPublished: true };
  const devotion = { ...item, explanation: 'Full devotional explanation', prayer: 'Full prayer' };
  mocks.post.mockResolvedValueOnce({ returnCode: 200, returnData: { content: [devotion] } });
  await act(() => result.current.actions.openEdit(item));
  expect(mocks.post).toHaveBeenLastCalledWith('admin', 'get-all-daily-devotions', { id: 18, size: 1 }, { includeLanguage: false });
  expect(mocks.navigate).toHaveBeenLastCalledWith('/add-daily-devotion', { state: { devotion } });
});
