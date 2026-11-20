import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DailyDevotionDetailData } from '../types';
import UserDevotions from './UserDevotions';

const mocks = vi.hoisted(() => ({
  devotion: null as DailyDevotionDetailData | null, loading: false, refreshing: false, liked: false, isRtl: false,
  navigate: vi.fn(), refresh: vi.fn(), copy: vi.fn(), share: vi.fn(), setLiked: vi.fn(),
}));
vi.mock('../hooks', () => ({ useUserDevotions: () => ({
  data: { ...mocks, scrolled: false, scrollRef: { current: null } },
  actions: { handleCopy: mocks.copy, handleShare: mocks.share, refresh: mocks.refresh, setLiked: mocks.setLiked },
}) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.loading = false; mocks.refreshing = false; mocks.liked = false; mocks.isRtl = false;
  mocks.devotion = {
    id: 1, title: 'Grace for today', displayDate: '2026-11-17', isPublished: true,
    bookName: 'John', chapter: 1, verseNumber: 16, bibleVersion: 'BSB', explanation: 'First reflection.\n\nSecond reflection.',
    reflectionQuestions: JSON.stringify(['Where do I need grace?']), prayer: 'Father, help me walk in grace. Amen.',
    practicalApplications: JSON.stringify(['Show kindness']), learningPoints: JSON.stringify(['Grace is a gift', 'Faith responds', 'Hope remains']),
  };
});

describe('consumer devotion reader', () => {
  it('preserves the devotion and all optional study content', () => {
    render(<UserDevotions />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Grace for today' })).toBeInTheDocument();
    for (const text of ['First reflection.', 'Second reflection.', 'Where do I need grace?', 'Father, help me walk in grace. Amen.', 'Show kindness', 'Grace is a gift', 'Faith responds', 'Hope remains']) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.getByText(/John 1:16/)).toHaveAttribute('translate', 'no');
  });

  it('preserves back, refresh, copy, share and like actions', () => {
    const { rerender } = render(<UserDevotions />);
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mocks.navigate).toHaveBeenCalledWith(-1);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh devotion' }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(mocks.copy).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(mocks.share).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    expect(mocks.setLiked).toHaveBeenCalledWith(true);
    mocks.liked = true; mocks.refreshing = true;
    rerender(<UserDevotions />);
    expect(screen.getByRole('button', { name: 'Liked' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Refresh devotion' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Liked' }));
    expect(mocks.setLiked).toHaveBeenCalledWith(false);
  });

  it('omits absent notes and incomplete verse numbers', () => {
    mocks.devotion = { id: 1, title: 'A quiet moment', explanation: 'Reflection', displayDate: '2026-11-17', isPublished: true, bookName: 'John' };
    render(<UserDevotions />);
    expect(screen.queryByRole('region', { name: 'Reflect and apply' })).not.toBeInTheDocument();
    expect(screen.getByText('John')).not.toHaveTextContent('undefined');
  });

  it('shows loading with back navigation and prevents refresh during loading', () => {
    mocks.loading = true;
    render(<UserDevotions />);
    expect(screen.getByRole('status', { name: 'Loading devotion' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh devotion' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Grace for today' })).not.toBeInTheDocument();
  });

  it('supports an empty state and RTL reading', () => {
    mocks.devotion = null; mocks.isRtl = true;
    const { container } = render(<UserDevotions />);
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'No devotion available today' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Go back' })[1]);
    expect(mocks.navigate).toHaveBeenCalledWith(-1);
  });
});
