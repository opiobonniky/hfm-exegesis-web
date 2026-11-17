import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookPrologue } from '@/services/bookProloguesApi';
import BookOverview from './BookOverview';

const mocks = vi.hoisted(() => ({ back: vi.fn(), start: vi.fn(), loading: false, resumeChapter: null as number | null, hasReturnUrl: false, prologue: null as BookPrologue | null }));
vi.mock('../hooks/useBookOverview', () => ({ useBookOverview: () => ({
  data: { bookName: 'Genesis', prologue: mocks.prologue, loading: mocks.loading, resumeChapter: mocks.resumeChapter, designation: 'The First Book of the Bible', testamentLabel: 'Old Testament', hasReturnUrl: mocks.hasReturnUrl },
  actions: { onBack: mocks.back, onStartReading: mocks.start },
}) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ isRtl: false }) }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.loading = false; mocks.resumeChapter = null; mocks.hasReturnUrl = false;
  mocks.prologue = {
    bookName: 'Genesis', title: 'Beginnings and Covenant', author: 'Moses', chapters: 50, audience: 'The people of Israel',
    summary: 'Overview text', background: 'Historical context', authorDetail: 'Author details', purpose: 'Purpose text', lessons: 'Lessons text',
    dateWritten: 'Ancient Israel', locationWritten: 'Wilderness', applications: ['Trust God'],
    keyScripture: [{ reference: 'Genesis 1:1', text: 'In the beginning.' }], structure: [{ range: '1–11', title: 'Early history' }],
    keyTheme: 'Covenant', mainThemes: ['Creation'], keyPeople: ['Abraham'], keyVerses: ['Genesis 12:1'], christConnection: 'Christ connection',
  };
});

describe('consumer editorial book overview', () => {
  it('preserves authored content, facts and Scripture without admin controls', () => {
    render(<BookOverview />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Beginnings and Covenant' })).toBeInTheDocument();
    for (const text of ['Moses', '50', 'The people of Israel', 'Overview text', 'Historical context', 'Author details', 'Purpose text', 'Lessons text', 'Ancient Israel', 'Wilderness', 'Trust God', 'In the beginning.', 'Genesis 1:1', 'Early history', 'Covenant', 'Creation', 'Abraham', 'Genesis 12:1', 'Christ connection']) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.getByText('In the beginning.').closest('[translate="no"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mocks.back).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Start Reading' }));
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it('falls back to the book name and omits absent sections', () => {
    mocks.prologue = { bookName: 'Genesis', summary: 'Brief overview' };
    render(<BookOverview />);
    expect(screen.getByRole('heading', { name: 'Genesis' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Key Scripture' })).not.toBeInTheDocument();
  });

  it('retains the resume action and chapter', () => {
    mocks.resumeChapter = 12;
    render(<BookOverview />);
    fireEvent.click(screen.getByRole('button', { name: /Continue Reading.*Chapter 12/ }));
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it('retains the return-to-reader action', () => {
    mocks.hasReturnUrl = true;
    render(<BookOverview />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Reader' }));
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it('shows an accessible loading state', () => {
    mocks.loading = true;
    render(<BookOverview />);
    expect(screen.getByRole('status', { name: 'Loading overview' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Beginnings and Covenant' })).not.toBeInTheDocument();
  });

  it('allows reading when no overview is available', () => {
    mocks.prologue = null;
    render(<BookOverview />);
    expect(screen.getByText('Ready to read?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start Reading' }));
    expect(mocks.start).toHaveBeenCalledOnce();
  });
});
