import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@/components/languages/en.json';
import { VerseReferenceSection } from './VerseReferenceSection';

vi.mock('./PassageFields', () => ({ PassageFields: () => <div /> }));
vi.mock('@/components/ui/combobox', () => ({
  Combobox: () => <div data-testid="combobox" />,
}));

const props = {
  book: 'John',
  setBook: vi.fn(),
  chapter: '3',
  setChapter: vi.fn(),
  verseNumber: '16',
  setVerseNumber: vi.fn(),
  verseEnd: '',
  setVerseEnd: vi.fn(),
  verseNumbers: [16, 17],
  bibleVersion: 'BSB',
  setBibleVersion: vi.fn(),
  bibleVersionOptions: [],
  selectedDate: new Date(2026, 10, 19, 8, 0, 0),
  setSelectedDate: vi.fn(),
  selectedTime: '08:00',
  handleTimeChange: vi.fn(),
  t: en as any,
  isRtl: false,
};

describe('daily verse date picker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('closes the calendar immediately after a date is selected', () => {
    render(<VerseReferenceSection {...props} />);

    fireEvent.click(screen.getByText(/November 19/));
    const day = screen.getByText('20').closest('button');
    expect(day).not.toBeNull();

    fireEvent.click(day!);

    expect(props.setSelectedDate).toHaveBeenCalledTimes(1);
    const picked = props.setSelectedDate.mock.calls[0][0] as Date;
    expect(picked.getDate()).toBe(20);
    expect(picked.getHours()).toBe(8);
    expect(screen.queryByText('20')).not.toBeInTheDocument();
  });

  it('closes the calendar when the already-selected day is clicked', () => {
    render(<VerseReferenceSection {...props} />);

    fireEvent.click(screen.getByText(/November 19/));
    const grid = screen.getByRole('grid');
    const selectedDay = within(grid).getByText('19').closest('button');
    expect(selectedDay).not.toBeNull();

    fireEvent.click(selectedDay!);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
