import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DailyVerseItem } from '../types';
import UserDailyVerse from './UserDailyVerse';

const mocks = vi.hoisted(() => ({
  verse: null as DailyVerseItem | null, loading: false, refreshing: false, liked: false, isRtl: false,
  navigate: vi.fn(), refresh: vi.fn(), copy: vi.fn(), share: vi.fn(), setLiked: vi.fn(),
}));
vi.mock('../hooks', () => ({ useUserDailyVerse: () => ({
  data: { ...mocks, scrolled: false, scrollRef: { current: null } },
  actions: { handleCopy: mocks.copy, handleShare: mocks.share, refresh: mocks.refresh, setLiked: mocks.setLiked },
}) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.loading = false; mocks.refreshing = false; mocks.liked = false; mocks.isRtl = false;
  mocks.verse = {
    id: 1, bookName: 'John', chapter: 1, verseNumber: 16, bibleVersion: 'BSB', verseText: 'Grace upon grace.', reflection: 'A daily reflection.',
    displayDate: '2026-11-17', displayTime: '', createdBy: 'editor', createdOn: '', updatedBy: null, updatedOn: null, isPublished: true,
    explanation: 'Explanation text', application: 'Application text', verseIntroduction: 'Introduction text',
    backgroundAuthor: 'John the apostle', backgroundBook: 'John', backgroundContext: 'Historical context',
    wordStudies: JSON.stringify([{ word: 'Grace', strongs: 'G5485', definition: 'A gift freely given' }]),
    practicalApplications: JSON.stringify(['Show kindness']), keyThemes: 'Faith\nHope', crossReferences: 'Romans 5:1',
    finalThoughts: 'Final thought', takeaways: 'Remember grace', learnMore: 'Further reading',
  };
});

describe('editorial daily verse reader', () => {
  it('preserves the verse, reflection and every study section', () => {
    render(<UserDailyVerse />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'John 1:16' })).toHaveAttribute('translate', 'no');
    expect(screen.getByText('Grace upon grace.').closest('blockquote')).toHaveAttribute('translate', 'no');
    for (const text of ['BSB', 'A daily reflection.', 'Explanation text', 'Application text', 'Introduction text', 'John the apostle', 'Historical context', 'G5485', 'A gift freely given', 'Show kindness', 'Faith', 'Hope', 'Romans 5:1', 'Final thought', 'Remember grace', 'Further reading']) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it('keeps back, refresh, copy, share and toggle-like behavior', () => {
    const { rerender } = render(<UserDailyVerse />);
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mocks.navigate).toHaveBeenCalledWith(-1);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh verse' }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(mocks.copy).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(mocks.share).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    expect(mocks.setLiked).toHaveBeenCalledWith(true);
    mocks.liked = true; mocks.refreshing = true;
    rerender(<UserDailyVerse />);
    expect(screen.getByRole('button', { name: 'Liked' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Refresh verse' })).toBeDisabled();
  });

  it('uses legacy verse text and keeps a reflection separate', () => {
    mocks.verse = { ...mocks.verse!, verseText: null, text: 'Legacy verse text.' };
    render(<UserDailyVerse />);
    expect(screen.getByText('Legacy verse text.').tagName).toBe('BLOCKQUOTE');
    expect(screen.getByText('A daily reflection.')).toBeInTheDocument();
  });

  it('keeps a reflection-only fallback without presenting it as a Scripture quotation', () => {
    mocks.verse = { ...mocks.verse!, verseText: null, text: null };
    const { container } = render(<UserDailyVerse />);
    expect(screen.getByText('A daily reflection.')).toBeInTheDocument();
    expect(container.querySelector('blockquote')).toBeNull();
  });

  it('shows accessible loading and retains back navigation', () => {
    mocks.loading = true;
    render(<UserDailyVerse />);
    expect(screen.getByRole('status', { name: 'Loading verse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh verse' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'John 1:16' })).not.toBeInTheDocument();
  });

  it('supports empty and RTL states', () => {
    mocks.verse = null; mocks.isRtl = true;
    const { container } = render(<UserDailyVerse />);
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'No verse available today' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Go back' })[1]);
    expect(mocks.navigate).toHaveBeenCalledWith(-1);
  });
});
