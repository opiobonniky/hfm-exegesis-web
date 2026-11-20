import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RequiredContentFields } from './RequiredContentFields';
import { AddDailyVerseHeader } from './AddDailyVerseHeader';
import { routes } from '@/components/Routes/routes';
import t from '@/components/languages/en.json';
import type { AddDailyVersePageViewModel } from '../hooks/useAddDailyVerse';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

describe('daily verse content editor', () => {
  it('renders only explanation, application and introduction, without Learn More', () => {
    const setExplanation = vi.fn(), setApplication = vi.fn(), setVerseIntroduction = vi.fn();
    render(<RequiredContentFields explanation="Explanation" application="Application" verseIntroduction="Introduction"
      setExplanation={setExplanation} setApplication={setApplication} setVerseIntroduction={setVerseIntroduction}
      isRtl={false} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('Explanation'), { target: { value: 'New explanation' } });
    fireEvent.change(screen.getByDisplayValue('Application'), { target: { value: 'New application' } });
    fireEvent.change(screen.getByDisplayValue('Introduction'), { target: { value: 'New introduction' } });
    expect(setExplanation).toHaveBeenCalledWith('New explanation');
    expect(setApplication).toHaveBeenCalledWith('New application');
    expect(setVerseIntroduction).toHaveBeenCalledWith('New introduction');
  });

  it('keeps RTL direction on the remaining fields', () => {
    render(<RequiredContentFields explanation="" application="" verseIntroduction=""
      setExplanation={vi.fn()} setApplication={vi.fn()} setVerseIntroduction={vi.fn()} isRtl />);
    for (const field of screen.getAllByRole('textbox')) expect(field).toHaveAttribute('dir', 'rtl');
  });

  it('returns from the editor header to the independent Daily Verses list', () => {
    render(<MemoryRouter><AddDailyVerseHeader model={{ isEditing: false,
      t,
    } as unknown as AddDailyVersePageViewModel} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Back/ })).toHaveAttribute('href', routes.adminDailyVerses.path);
  });

  it('removes the duplicate admin page while retaining editor and reader routes', () => {
    expect(Object.values(routes).some(route => route.path === '/daily-verse')).toBe(false);
    expect(routes).not.toHaveProperty('dailyVerse');
    expect(routes.adminDailyVerses.path).toBe('/admin/daily-verses');
    expect(routes.addDailyVerse.path).toBe('/add-daily-verse');
    expect(routes.userDailyVerse).toBeDefined();
  });
});
