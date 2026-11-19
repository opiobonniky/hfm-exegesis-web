import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddDailyVerse } from './useAddDailyVerse';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(), toast: vi.fn(), post: vi.fn(),
  state: undefined as Record<string, unknown> | undefined,
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate, useLocation: () => ({ state: mocks.state }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/languageProvider', async () => {
  const { default: t } = await import('@/components/languages/en.json');
  return { useLanguage: () => ({ t, isRtl: false }) };
});
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (s: string) => s }));
vi.mock('@/services/api', () => ({ sendPostRequest: (...args: unknown[]) => mocks.post(...args) }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: {
  getTranslations: vi.fn().mockResolvedValue([{ id: 'BSB', shortName: 'BSB', name: 'Berean Standard Bible', language: 'en' }]),
  getVerses: vi.fn().mockResolvedValue({ verses: Array.from({ length: 12 }, (_, i) => ({ verseNumber: i + 1, text: `Text ${i + 1}` })) }),
  getVerse: vi.fn().mockResolvedValue({ text: 'In the beginning.' }),
} }));

// Avoid loading the application route registry in a hook unit test.
vi.mock('@/components/Routes/routes', () => ({ routes: {
  adminDailyContent: { path: '/admin/daily-content' },
} }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = undefined;
  mocks.post.mockResolvedValue({ returnCode: 404 });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

async function filledForm(editing = false) {
  if (editing) mocks.state = { verse: {
    id: 9, testament: 'Old', bookName: 'Genesis', chapter: 1, verseNumber: 1,
    sharedStudyVersion: 3,
    explanation: 'Explanation', application: 'Application', verseIntroduction: 'Introduction',
    learnMore: 'Legacy content must not be submitted by the removed field',
  } };
  const hook = renderHook(() => useAddDailyVerse());
  if (!editing) act(() => {
    const a = hook.result.current.actions;
    a.setTestament('Old'); a.setBook('Genesis'); a.setChapter('1'); a.setVerseNumber('1');
    a.setExplanation('Explanation'); a.setApplication('Application'); a.setVerseIntroduction('Introduction');
  });
  await waitFor(() => expect(hook.result.current.data.saveDisabled).toBe(false));
  return hook;
}

describe('daily verse editor', () => {
  it('saves each takeaway as one item and omits empty optional cross-reference rows', async () => {
    const { result } = await filledForm();
    act(() => {
      result.current.actions.setTakeaways(JSON.stringify(['First\nsecond paragraph', '', 'Another takeaway']));
      result.current.actions.setCrossReferences(JSON.stringify([{ bookName: '', chapter: 0, verseNumber: 0, referenceText: '' }]));
    });
    expect(result.current.data.saveDisabled).toBe(false);
    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    vi.useFakeTimers();
    await act(async () => { await result.current.actions.handleSave(); });
    const payload = mocks.post.mock.calls.at(-1)![2];
    expect(JSON.parse(payload.takeaways)).toEqual(['First\nsecond paragraph', 'Another takeaway']);
    expect(payload.crossReferences).toBe('');
  });
  it('saves a selected range and clears downstream values when changing books', async () => {
    const { result } = await filledForm();
    act(() => result.current.actions.setVerseNumber('6'));
    act(() => result.current.actions.setVerseEnd('10'));
    await waitFor(() => expect(result.current.data.verseText).toBe('6. Text 6\n7. Text 7\n8. Text 8\n9. Text 9\n10. Text 10'));
    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    vi.useFakeTimers();
    await act(async () => { await result.current.actions.handleSave(); });
    expect(mocks.post.mock.calls.at(-1)![2]).toMatchObject({ verseNumber: 6, verseEnd: 10 });
    act(() => result.current.actions.setBook('Exodus'));
    expect(result.current.data.chapter).toBe('');
    expect(result.current.data.verseNumber).toBe('');
    expect(result.current.data.verseEnd).toBe('');
    expect(result.current.data.verseText).toBe('');
    expect(result.current.data.saveDisabled).toBe(true);
  });
  it.each([false, true])('saves without Learn More and returns to Daily Content (editing: %s)', async editing => {
    const { result } = await filledForm(editing);
    expect(result.current.data).not.toHaveProperty('learnMore');
    expect(result.current.actions).not.toHaveProperty('setLearnMore');
    expect(result.current.data.validateStep(0)).toBe(true);
    expect(result.current.data.validateStep(1)).toBe(true);
    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    vi.useFakeTimers();
    await act(async () => { await result.current.actions.handleSave(); });
    const [area, action, payload] = mocks.post.mock.calls.at(-1)!;
    expect([area, action]).toEqual(['admin', 'add-daily-verse']);
    expect(payload).toMatchObject({ bookName: 'Genesis', chapter: 1, verseNumber: 1, explanation: 'Explanation' });
    expect(payload).not.toHaveProperty('learnMore');
    if (editing) expect(payload.id).toBe(9);
    // Daily verses are independent from shared PassageStudy records.
    expect(payload).not.toHaveProperty('sharedStudyVersion');
    act(() => vi.advanceTimersByTime(2000));
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/daily-content');
  });

  it('keeps required content validation after removing the optional field', async () => {
    const { result } = await filledForm();
    act(() => result.current.actions.setApplication(''));
    expect(result.current.data.saveDisabled).toBe(true);
    expect(result.current.data.validateStep(1)).toBe(false);
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
  });

  it('opens existing conflicts in Daily Content', async () => {
    const { result } = await filledForm();
    mocks.post.mockResolvedValueOnce({ returnCode: 409, returnData: { conflicts: [{ existing: { id: 7 } }] } });
    await act(async () => { await result.current.actions.handleSave(); });
    expect(result.current.data.conflictDialog.open).toBe(true);
    act(() => result.current.actions.viewExisting());
    expect(result.current.data.conflictDialog.open).toBe(false);
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/daily-content');
  });

  it('updates a conflicting verse without Learn More and returns to Daily Content', async () => {
    const { result } = await filledForm();
    mocks.post.mockResolvedValueOnce({ returnCode: 409, returnData: { conflicts: [{ existing: { id: 7 } }] } });
    await act(async () => { await result.current.actions.handleSave(); });
    mocks.post.mockResolvedValueOnce({ returnCode: 200 });
    vi.useFakeTimers();
    await act(async () => { await result.current.actions.handleConflictUpdate(); });
    expect(mocks.post.mock.calls.at(-1)![2]).toMatchObject({ id: 7 });
    expect(mocks.post.mock.calls.at(-1)![2]).not.toHaveProperty('learnMore');
    act(() => vi.advanceTimersByTime(2000));
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/daily-content');
  });

  it('shows a reload message instead of the date-conflict dialog for a stale shared study', async () => {
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
      description: 'Shared study changed; reload before saving',
      variant: 'destructive',
    }));
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('opens the conflict prompt as soon as a taken date is selected', async () => {
    const existing = {
      id: 7, bookName: 'John', chapter: 3, verseNumber: 16,
      displayDate: '2026-11-20T00:00:00.000Z',
    };
    mocks.post.mockImplementation((_area: string, action: string) =>
      Promise.resolve(action === 'check-daily-verse-date'
        ? { returnCode: 200, returnData: { existing } }
        : { returnCode: 404 }));
    const { result } = await filledForm();

    act(() => result.current.actions.setSelectedDate(new Date(2026, 10, 20, 8, 0, 0)));

    await waitFor(() => expect(result.current.data.conflictDialog.open).toBe(true));
    expect(result.current.data.conflictDialog).toMatchObject({
      conflict: { type: 'date', existing },
      payload: null,
    });
    expect(mocks.post).toHaveBeenCalledWith('admin', 'check-daily-verse-date', {
      date: '2026-11-20',
    });
  });

  it('keeps the dialog closed when the picked date is available', async () => {
    mocks.post.mockImplementation((_area: string, action: string) =>
      Promise.resolve(action === 'check-daily-verse-date'
        ? { returnCode: 200, returnData: { existing: null } }
        : { returnCode: 404 }));
    const { result } = await filledForm();

    act(() => result.current.actions.setSelectedDate(new Date(2026, 10, 21, 8, 0, 0)));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith(
      'admin', 'check-daily-verse-date', { date: '2026-11-21' },
    ));
    await act(async () => {});
    expect(result.current.data.conflictDialog.open).toBe(false);
  });

  it('replaces the confirmed preflight target on the next save', async () => {
    const existing = {
      id: 7, bookName: 'John', chapter: 3, verseNumber: 16,
      displayDate: '2026-11-20T00:00:00.000Z',
    };
    mocks.post.mockImplementation((_area: string, action: string) =>
      Promise.resolve(action === 'check-daily-verse-date'
        ? { returnCode: 200, returnData: { existing } }
        : { returnCode: 200 }));
    const { result } = await filledForm();

    act(() => result.current.actions.setSelectedDate(new Date(2026, 10, 20, 8, 0, 0)));
    await waitFor(() => expect(result.current.data.conflictDialog.open).toBe(true));

    await act(async () => { await result.current.actions.handleConflictUpdate(); });
    expect(result.current.data.conflictDialog.open).toBe(false);

    await act(async () => { await result.current.actions.handleSave(); });
    const [area, action, payload] = mocks.post.mock.calls.at(-1)!;
    expect([area, action]).toEqual(['admin', 'add-daily-verse']);
    expect(payload.id).toBe(7);
  });
});
