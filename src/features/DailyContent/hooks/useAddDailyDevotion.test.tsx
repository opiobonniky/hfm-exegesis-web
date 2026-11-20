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
    id: 12, title: 'Existing title', explanation: 'Existing content', reflectionQuestions: '["Question?"]', prayer: 'Amen.', practicalApplications: '["Act"]', learningPoints: '["One","Two","Three"]', displayDate: '2026-11-18',
  } };
  const hook = renderHook(() => useAddDailyDevotion());
  if (!editing) act(() => {
    hook.result.current.actions.setTitle('New title');
    hook.result.current.actions.setExplanation('New content');
    hook.result.current.actions.setReflectionQuestions(['Question?']);
    hook.result.current.actions.setPrayer('Amen.');
    hook.result.current.actions.setPracticalApplications(['Act faithfully']);
    hook.result.current.actions.setLearningPoints(['One', 'Two', 'Three']);
  });
  await waitFor(() => expect(hook.result.current.data.saveDisabled).toBe(false));
  return hook;
}

describe('daily devotion editor', () => {
  it('saves each row as one item, preserving paragraph breaks and scripture numbers', async () => {
    const { result } = await filledForm();
    act(() => {
      result.current.actions.setReflectionQuestions(['What does 1 Corinthians teach?\nHow will you respond?']);
      result.current.actions.setPracticalApplications(['1 Corinthians 13:4 reminds us to be patient.']);
    });
    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    await act(async () => { await result.current.actions.handleSave(); });
    expect(JSON.parse(mocks.post.mock.calls[0][0].reflectionQuestions)).toEqual(['What does 1 Corinthians teach?\nHow will you respond?']);
    expect(JSON.parse(mocks.post.mock.calls[0][0].practicalApplications)).toEqual(['1 Corinthians 13:4 reminds us to be patient.']);
  });

  it('blocks blank added rows rather than silently discarding them', async () => {
    const { result } = await filledForm();
    act(() => result.current.actions.setLearningPoints(['One', 'Two', 'Three', '']));
    expect(result.current.data.saveDisabled).toBe(true);
    act(() => {
      result.current.actions.setLearningPoints(['One', 'Two', 'Three']);
      result.current.actions.setReflectionQuestions(['Question?', '']);
      result.current.actions.setPracticalApplications(['Act', ' ']);
    });
    expect(result.current.data.fieldErrors.reflectionQuestions).toBeTruthy();
    expect(result.current.data.fieldErrors.practicalApplications).toBeTruthy();
    await act(async () => { await result.current.actions.handleSave(); });
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('explains five legacy lessons, then saves a corrected edit on a new date', async () => {
    mocks.state = { devotion: { id: 42, title: 'Legacy', explanation: 'Body',
      reflectionQuestions: ['Question?'], prayer: 'Amen', practicalApplications: ['Act'],
      learningPoints: ['One', 'Two', 'Three', 'Four', 'Five'], displayDate: '2026-11-18' } };
    const { result } = renderHook(() => useAddDailyDevotion());
    act(() => result.current.actions.setSelectedDate(new Date(2026, 11, 10, 8)));
    expect(result.current.data.validationErrors).toEqual(['Exactly three non-empty learning points are required.']);
    expect(result.current.data.fieldErrors.learningPoints).toBe('Exactly three non-empty learning points are required.');
    expect(result.current.data.fieldErrors.explanation).toBeUndefined();
    await act(async () => { await result.current.actions.handleSave(); });
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Exactly three non-empty learning points are required.' }));
    act(() => result.current.actions.setLearningPoints(['One', 'Two', 'Three']));
    expect(result.current.data.validationErrors).toEqual([]);
    expect(result.current.data.fieldErrors.learningPoints).toBeUndefined();
    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    await act(async () => { await result.current.actions.handleSave(); });
    expect(mocks.post).toHaveBeenCalledWith(expect.objectContaining({ id: 42, displayDate: '2026-12-10', learningPoints: '["One","Two","Three"]' }));
  });

  it('enables Update Devotion for a complete edit even when verse preview loading fails', async () => {
    mocks.state = { devotion: {
      id: 12,
      title: 'Existing title',
      explanation: 'Existing explanation',
      reflectionQuestions: '["What must change?"]',
      prayer: 'Father, help me. Amen.',
      practicalApplications: '["Receive correction humbly."]',
      learningPoints: '["The gospel changes us.","The church pursues holiness.","Correction seeks restoration."]',
      bookName: '1 Corinthians', chapter: 5, verseNumber: 12,
      displayDate: '2026-11-18',
    } };
    mocks.getVerses.mockRejectedValue(new Error('preview unavailable'));
    mocks.getVerse.mockRejectedValue(new Error('preview unavailable'));

    const { result } = renderHook(() => useAddDailyDevotion());

    await waitFor(() => expect(result.current.data.isVerseLoading).toBe(false));
    expect(result.current.data.verseText).toBe('');
    expect(result.current.data.saveDisabled).toBe(false);
    expect(result.current.data.saveLabel).toBe('Update Devotion');
  });

  it('still blocks an edit when its Bible reference is incomplete', async () => {
    const hook = await filledForm(true);
    act(() => hook.result.current.actions.setBook('John'));
    expect(hook.result.current.data.saveDisabled).toBe(true);
  });

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
      id: 7, title: 'New title', explanation: 'New content',
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
