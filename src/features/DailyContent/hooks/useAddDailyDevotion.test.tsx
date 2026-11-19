import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddDailyDevotion } from './useAddDailyDevotion';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(), toast: vi.fn(), post: vi.fn(),
  getVerses: vi.fn(), getVerse: vi.fn(),
  state: undefined as Record<string, unknown> | undefined,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ state: mocks.state }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/languageProvider', async () => {
  const { default: t } = await import('@/components/languages/en.json');
  return { useLanguage: () => ({ t, isRtl: false, lang: 'en' }) };
});
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (s: string) => s }));
vi.mock('@/hooks/useBibleEditions', () => ({
  useBibleEditions: () => ({ version: 'BSB', setVersion: vi.fn(), options: [] }),
}));
vi.mock('../services/add-daily-content-service', () => ({
  saveDailyDevotion: (...args: unknown[]) => mocks.post(...args),
  getDailyDevotionVerses: (...args: unknown[]) => mocks.getVerses(...args),
  getDailyDevotionVerse: (...args: unknown[]) => mocks.getVerse(...args),
}));
vi.mock('@/components/Routes/routes', () => ({ routes: {
  dailyDevotions: { path: '/daily-devotions' },
} }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = undefined;
  mocks.post.mockResolvedValue({ returnCode: 404 });
  mocks.getVerses.mockResolvedValue({ verses: [] });
  mocks.getVerse.mockResolvedValue({ text: 'Verse text' });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

async function filledForm(editing = false) {
  if (editing) mocks.state = { devotion: {
    id: 12, title: 'Existing title', content: 'Existing content', displayDate: '2026-11-18',
  } };
  const hook = renderHook(() => useAddDailyDevotion());
  if (!editing) act(() => {
    hook.result.current.actions.setTitle('New title');
    hook.result.current.actions.setContent('New content');
  });
  await waitFor(() => expect(hook.result.current.data.saveDisabled).toBe(false));
  return hook;
}

describe('daily devotion editor', () => {
  it('fetches and shows the selected verse text from the chapter response', async () => {
    mocks.getVerses.mockResolvedValue({
      verses: [
        { verseNumber: 15, text: 'Verse fifteen' },
        { verseNumber: 16, text: 'For God so loved the world.' },
      ],
    });
    const { result } = renderHook(() => useAddDailyDevotion());

    act(() => result.current.actions.setBook('John'));
    act(() => result.current.actions.setChapter('3'));
    await waitFor(() => expect(result.current.data.verseNumbers).toHaveLength(16));
    act(() => result.current.actions.setVerseNumber('16'));

    await waitFor(() => expect(result.current.data.verseText).toBe('For God so loved the world.'));
    expect(mocks.getVerses).toHaveBeenCalledWith('BSB', 'John', 3);
  });

  it('offers view or replace when the chosen date is already taken', async () => {
    const existing = {
      id: 7, title: 'Existing devotion', displayDate: '2026-11-18T00:00:00.000Z',
      bookName: 'John', chapter: 3, verseNumber: 16,
    };
    const { result } = await filledForm();
    mocks.post.mockResolvedValueOnce({
      returnCode: 409,
      returnData: { conflicts: [{ type: 'date', existing }] },
    });

    await act(async () => { await result.current.actions.handleSave(); });

    expect(result.current.data.conflictDialog.open).toBe(true);
    expect(result.current.data.conflictDialog.conflict?.existing).toEqual(existing);
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('replaces the conflicting devotion by id and returns to Daily Devotions', async () => {
    const { result } = await filledForm();
    mocks.post.mockResolvedValueOnce({
      returnCode: 409,
      returnData: { conflicts: [{ type: 'date', existing: { id: 7 } }] },
    });
    await act(async () => { await result.current.actions.handleSave(); });

    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    await act(async () => { await result.current.actions.handleConflictUpdate(); });

    expect(mocks.post.mock.calls.at(-1)![0]).toMatchObject({
      id: 7, title: 'New title', content: 'New content',
    });
    expect(result.current.data.conflictDialog.open).toBe(false);
    expect(mocks.navigate).toHaveBeenCalledWith('/daily-devotions');
  });

  it('keeps the stale-content message when a 409 is not a date conflict', async () => {
    const { result } = await filledForm();
    mocks.post.mockResolvedValueOnce({
      returnCode: 409,
      returnMessage: 'Shared study changed; reload before saving',
      returnData: { issues: ['version'] },
    });

    await act(async () => { await result.current.actions.handleSave(); });

    expect(result.current.data.conflictDialog.open).toBe(false);
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Content changed',
      variant: 'destructive',
    }));
  });
});
