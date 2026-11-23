import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useAddExplanation } from './useAddExplanation';
import { AddExplanationWorkspace } from '../components/AddExplanationWorkspace';

const mocks = vi.hoisted(() => ({
  params: {} as Record<string, string>, state: null as { explanationId: number } | null,
  post: vi.fn(), navigate: vi.fn(), toast: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
  useParams: () => mocks.params, useNavigate: () => mocks.navigate, useLocation: () => ({ state: mocks.state }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ lang: 'en' }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (s: string) => s }));
vi.mock('@/components/Routes/routes', () => ({ routePaths: { adminVerseExplanations: '/admin/verse-explanations' }, routes: {} }));
vi.mock('@/services/api', () => ({ sendPostRequest: (...args: unknown[]) => mocks.post(...args) }));
vi.mock('@/services/bibleApi', () => ({ bibleApi: {
  getTranslations: vi.fn().mockResolvedValue([{ id: 'BSB', name: 'Berean', shortName: 'BSB', language: 'English' }]),
  getVerses: vi.fn().mockResolvedValue({ verses: Array.from({ length: 14 }, (_, i) => ({ verseNumber: i + 1, text: `Text ${i + 1}` })) }),
} }));
beforeEach(() => {
  vi.clearAllMocks(); mocks.params = {}; mocks.state = null;
  mocks.post.mockImplementation((_module, action) => Promise.resolve({ returnCode: action === 'get-verse-explanation' ? 404 : 200 }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('starts without errors and reveals reference validation after blur or Continue', async () => {
  function Form() {
    const { data, actions } = useAddExplanation();
    return <AddExplanationWorkspace data={data} actions={actions} />;
  }
  render(<Form />);
  const book = screen.getByRole('combobox', { name: 'Book' });
  const error = 'Select a book, chapter and verse.';
  expect(screen.queryByText(error)).toBeNull();
  fireEvent.focus(book);
  expect(screen.queryByText(error)).toBeNull();
  fireEvent.blur(book);
  expect(screen.getByText(error)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByText(error)).toBeTruthy();
  expect(screen.queryByPlaceholderText('Type the heart of the explanation here...')).toBeNull();
  await act(async () => {});
});

it('splits Learn More and Insights into two steps without changing document order', async () => {
  function Form() {
    const { data, actions } = useAddExplanation();
    return <>
      <button onClick={() => actions.setActiveTab('learnMore')}>Open study fields</button>
      <button onClick={() => actions.setActiveTab('insights')}>Open insights fields</button>
      <AddExplanationWorkspace data={data} actions={actions} />
    </>;
  }
  render(<Form />);
  const expectOrder = (labels: (string | RegExp)[]) => {
    const fields = labels.map(label => screen.getByText(label));
    fields.slice(1).forEach((field, index) => {
      expect(fields[index].compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  };
  fireEvent.click(screen.getByRole('button', { name: 'Open study fields' }));
  expectOrder([
    'Verse introduction', 'Background', 'Background — Author', 'Background — Book', 'Background — Context',
    'Strong’s Concordance Word Study', 'Practical applications',
  ]);
  expect(screen.queryByText('Insights and Cross References')).toBeNull();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Open insights fields' }));
  expectOrder(['Insights and Cross References', 'Key themes', 'Cross references', /Final thoughts/, 'Takeaways']);
  expect(screen.queryByText('Practical applications')).toBeNull();
  expect(screen.getByRole('button', { name: 'Submit explanation' })).toBeTruthy();
  await act(async () => {});
});

const savedExplanation = {
  id: 44, bookName: 'Genesis', chapter: 3, verseNumber: 6, bibleVersion: 'Berean', sharedStudyVersion: 7,
  exegesis: { explanationText: 'An existing explanation with enough detail.', applicationText: 'Saved application' },
  studyMetadata: { introduction: 'Saved introduction', backgroundAuthor: 'Saved author', backgroundBook: 'Saved book',
    backgroundContext: 'Saved context', finalThoughts: 'Saved final thoughts', takeaways: '["Saved takeaway"]' },
  wordStudies: [{ surfaceText: 'Know', strongsId: 'H3045', customDefinition: 'Know intimately' }],
  practicalApps: [{ applicationText: 'Saved practice', sortOrder: 0 }],
  crossReferences: [{ bookName: 'Romans', chapter: 5, verseNumber: 1, verseEnd: 3, commentary: 'Saved commentary' }],
  themes: [{ themeName: 'Trust', sortOrder: 0 }],
};

const fillRequiredFields = (result: any) => act(() => {
  result.current.actions.updateField('bibleVersion', 'BSB');
  result.current.actions.updateNested('exegesis', 'applicationText', 'Daily application');
  (['introduction', 'backgroundAuthor', 'backgroundBook', 'backgroundContext', 'finalThoughts'] as const)
    .forEach(key => result.current.actions.updateNested('studyMetadata', key, `Filled ${key}`));
});

it('loads the canonical explanation by ID from navigation state without a second passage lookup', async () => {
  mocks.state = { explanationId: 44 };
  mocks.post.mockResolvedValueOnce({ returnCode: 200, returnData: savedExplanation });
  const { result } = renderHook(useAddExplanation);
  expect(result.current.data.checkingExisting).toBe(true);
  await waitFor(() => expect(result.current.data.checkingExisting).toBe(false));
  expect(result.current.data.isEditMode).toBe(true);
  expect(result.current.data.lockPassage).toBe(true);
  expect(result.current.data.form.bookName).toBe('Genesis');
  expect(result.current.data.form.exegesis.explanationText).toBe(savedExplanation.exegesis.explanationText);
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith('bible', 'get-verse-explanation-for-edit', { id: '44' }, { includeLanguage: false });
});

it('does not fall back to creation when an ID-based edit cannot be loaded', async () => {
  mocks.state = { explanationId: 44 };
  mocks.post.mockResolvedValueOnce({ returnCode: 404 });
  const { result } = renderHook(useAddExplanation);
  await waitFor(() => expect(result.current.data.lookupError).toBe(true));
  expect(result.current.data.isValid).toBe(false);
});

it('loads a selected existing verse in create mode and updates its saved ID and version', async () => {
  mocks.post.mockResolvedValueOnce({ returnCode: 200, returnData: savedExplanation });
  const { result } = renderHook(() => useAddExplanation());
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
  });
  await waitFor(() => expect(result.current.data.isValid).toBe(true));
  expect(result.current.data.isEditMode).toBe(true);
  expect(result.current.data.existingFound).toBe(true);
  expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Saved explanation loaded' }));
  expect(result.current.data.form.bibleVersion).toBe('Berean');
  expect(result.current.data.form.exegesis.applicationText).toBe('Saved application');
  expect(result.current.data.form.studyMetadata.takeaways).toEqual(['Saved takeaway']);
  expect(result.current.data.form.crossReferences[0].commentary).toBe('Saved commentary');
  expect(result.current.data.form.practicalApps[0].applicationText).toBe('Saved practice');
  expect(result.current.data.form.themes[0].themeName).toBe('Trust');
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.post).toHaveBeenLastCalledWith('bible', 'add-verse-explanation', expect.objectContaining({ id: 44, sharedStudyVersion: 7 }));
  act(() => result.current.actions.updateField('verseNumber', '7'));
  await waitFor(() => expect(result.current.data.checkingExisting).toBe(false));
  expect(result.current.data.existingFound).toBe(false);
  expect(result.current.data.form.exegesis.explanationText).toBe('');
  act(() => result.current.actions.updateNested('exegesis', 'explanationText', 'New teaching for a different verse.'));
  fillRequiredFields(result);
  await waitFor(() => expect(result.current.data.isValid).toBe(true));
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.post.mock.calls.at(-1)![2]).not.toHaveProperty('id');
  expect(mocks.post.mock.calls.at(-1)![2]).not.toHaveProperty('sharedStudyVersion');
});

it('does not re-flag saved rich content while merely editing, but validates it inline after it changes', async () => {
  const incompleteReference = { bookName: 'Romans', chapter: 5, verseNumber: 0, referenceText: 'Preserved quotation', commentary: '', sortOrder: 0 };
  mocks.post.mockResolvedValueOnce({ returnCode: 200, returnData: { ...savedExplanation, crossReferences: [incompleteReference] } });
  const { result } = renderHook(() => useAddExplanation());
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
  });
  await waitFor(() => expect(result.current.data.existingFound).toBe(true));
  expect(result.current.data.richContentTouched).toBe(false);
  expect(result.current.data.richContentError).toBe('');
  expect(mocks.toast).not.toHaveBeenCalled();

  act(() => result.current.actions.updateField('crossReferences', [incompleteReference]));
  expect(result.current.data.richContentTouched).toBe(true);
  expect(result.current.data.richContentError).toBe('Cross reference 1: select verse. Your existing text is preserved.');
  expect(result.current.data.isValid).toBe(false);
  expect(mocks.toast).not.toHaveBeenCalled();
});

it('ignores late lookups when the selected verse changes', async () => {
  let resolve!: (value: unknown) => void;
  mocks.post.mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const { result } = renderHook(() => useAddExplanation());
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
  });
  expect(result.current.data.isValid).toBe(false);
  act(() => result.current.actions.updateField('verseNumber', '7'));
  await waitFor(() => expect(result.current.data.checkingExisting).toBe(false));
  await act(async () => resolve({ returnCode: 200, returnData: savedExplanation }));
  expect(result.current.data.form.verseNumber).toBe('7');
  expect(result.current.data.existingFound).toBe(false);
});

it('blocks saving on lookup failure and allows retry without losing new notes', async () => {
  mocks.post.mockRejectedValueOnce(new Error('offline'));
  const { result } = renderHook(() => useAddExplanation());
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
    result.current.actions.updateNested('exegesis', 'explanationText', 'Keep these unsaved editorial notes.');
  });
  fillRequiredFields(result);
  await waitFor(() => expect(result.current.data.lookupError).toBe(true));
  expect(result.current.data.isValid).toBe(false);
  act(() => result.current.actions.retryExisting());
  await waitFor(() => expect(result.current.data.isValid).toBe(true));
  expect(result.current.data.form.exegesis.explanationText).toBe('Keep these unsaved editorial notes.');
});

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
  fillRequiredFields(result);
  await waitFor(() => expect(result.current.data.selectedVerseText).toContain('10. Text 10'));
  expect(result.current.data.isValid).toBe(true);
  act(() => result.current.actions.updateField('crossReferences', [{ bookName: 'Genesis', chapter: 3, verseNumber: 0, referenceText: 'Keep quotation', commentary: '', sortOrder: 0 }]));
  expect(result.current.data.isValid).toBe(false);
  expect(result.current.data.richContentError).toContain('Cross reference 1: select verse');
  act(() => result.current.actions.addWordStudy());
  expect(result.current.data.isValid).toBe(false);
  act(() => result.current.actions.removeWordStudy(0));
  // An added but empty row must be filled or removed before saving.
  act(() => result.current.actions.updateField('crossReferences', [{ bookName: '', chapter: 0, verseNumber: 0, referenceText: '', commentary: '', sortOrder: 0 }]));
  expect(result.current.data.isValid).toBe(false);
  act(() => result.current.actions.updateField('crossReferences', []));
  expect(result.current.data.isValid).toBe(true);
  vi.useFakeTimers();
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.post).toHaveBeenCalledWith('bible', 'add-verse-explanation', expect.objectContaining({ verseNumber: 6, verseEnd: 10 }));
  expect(mocks.post.mock.calls.at(-1)![2].crossReferences).toEqual([]);
  act(() => vi.advanceTimersByTime(500));
  expect(mocks.navigate).toHaveBeenCalledWith('/admin/verse-explanations');
  act(() => result.current.actions.updateField('bookName', 'Exodus'));
  expect(result.current.data.form.chapter).toBe('');
  expect(result.current.data.form.verseEnd).toBe('');
  expect(result.current.data.selectedVerseText).toBe('');
});

it('reopens and saves ranges and structured studies without losing existing IDs or commentary', async () => {
  mocks.params = { bookName: 'Genesis', chapter: '3', verseNumber: '6' };
  mocks.post.mockResolvedValueOnce({ returnCode: 200, returnData: {
    id: 44, bookName: 'Genesis', chapter: 3, verseNumber: 6, verseEnd: 10, bibleVersion: 'BSB',
    sharedStudyVersion: 7,
    exegesis: { explanationText: 'An existing explanation with enough detail.', applicationText: 'Saved application' },
    studyMetadata: { introduction: 'Saved introduction', backgroundAuthor: 'Saved author', backgroundBook: 'Saved book',
      backgroundContext: 'Saved context', finalThoughts: 'Saved final thoughts' },
    wordStudies: [{ surfaceText: 'Know', strongsId: null, strongsIds: ['H3045', 'H03045A'], strongs: null, customDefinition: 'Know intimately', sortOrder: 0 }],
    crossReferences: [{ bookName: 'Romans', chapter: 5, verseNumber: 1, verseEnd: 3, referenceText: 'Original quote', commentary: 'Editorial commentary' }],
  } });
  const { result } = renderHook(() => useAddExplanation());
  await waitFor(() => expect(result.current.data.isValid).toBe(true));
  expect(result.current.data.form.verseEnd).toBe('10');
  expect(result.current.data.form.crossReferences[0].commentary).toBe('Editorial commentary');
  expect(result.current.data.form.wordStudies).toEqual([
    { surfaceText: 'Know', strongsId: 'H3045/H03045A', customDefinition: 'Know intimately', sortOrder: 0 },
  ]);
  vi.useFakeTimers();
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.post).toHaveBeenLastCalledWith('bible', 'add-verse-explanation', expect.objectContaining({ id: 44, sharedStudyVersion: 7, verseEnd: 10,
    crossReferences: [expect.objectContaining({ verseEnd: 3, commentary: 'Editorial commentary' })],
    wordStudies: [expect.objectContaining({ strongsId: 'H3045/H03045A', customDefinition: 'Know intimately' })],
  }));
  act(() => vi.advanceTimersByTime(500)); // flush the pending redirect before the next test
});

it('gates Continue until the current step fields and added rows are filled', async () => {
  const { result } = renderHook(() => useAddExplanation());
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
  });
  await waitFor(() => expect(result.current.data.referenceComplete).toBe(true));

  act(() => result.current.actions.setActiveTab('exegesis'));
  expect(result.current.data.canAdvanceFromCurrent).toBe(false);
  expect(result.current.data.fieldErrors.applicationText).toBeTruthy();
  act(() => {
    result.current.actions.updateNested('exegesis', 'explanationText', 'An explanation with enough context and detail.');
    result.current.actions.updateNested('exegesis', 'applicationText', 'Daily application');
  });
  expect(result.current.data.canAdvanceFromCurrent).toBe(true);

  act(() => result.current.actions.goNext());
  expect(result.current.data.currentStep).toBe('learnMore');
  expect(result.current.data.canAdvanceFromCurrent).toBe(false);
  fillRequiredFields(result);
  expect(result.current.data.canAdvanceFromCurrent).toBe(true);
  act(() => result.current.actions.addWordStudy());
  expect(result.current.data.canAdvanceFromCurrent).toBe(false);
  expect(result.current.data.fieldErrors.wordStudies[0]).toContain('Word study 1');
  act(() => result.current.actions.removeWordStudy(0));
  expect(result.current.data.canAdvanceFromCurrent).toBe(true);
  act(() => result.current.actions.updateNested('studyMetadata', 'finalThoughts', ''));
  expect(result.current.data.canAdvanceFromCurrent).toBe(true);
  act(() => result.current.actions.goNext());
  expect(result.current.data.currentStep).toBe('insights');
  expect(result.current.data.isValid).toBe(false);
  expect(result.current.data.stepCompletion.insights).toBe(false);
});

it('keeps the editor open with a reload message when the shared study version is stale', async () => {
  const { result } = renderHook(() => useAddExplanation());
  act(() => {
    result.current.actions.updateField('bookName', 'Genesis');
    result.current.actions.updateField('chapter', '3');
    result.current.actions.updateField('verseNumber', '6');
    result.current.actions.updateNested('exegesis', 'explanationText', 'An explanation with enough context and detail.');
  });
  fillRequiredFields(result);
  await waitFor(() => expect(result.current.data.isValid).toBe(true));
  mocks.post.mockResolvedValueOnce({ returnCode: 409, returnMessage: 'Shared study changed; reload before saving' });
  mocks.navigate.mockClear(); // ignore redirects scheduled by earlier tests
  await act(async () => { await result.current.actions.handleSave(); });
  expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Content changed',
    description: 'Shared study changed; reload before saving',
    variant: 'destructive',
  }));
  expect(mocks.navigate).not.toHaveBeenCalled();
});
