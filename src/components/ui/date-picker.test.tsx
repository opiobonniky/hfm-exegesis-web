import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

const value = new Date(2026, 10, 19, 8, 15, 0);

describe('DatePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('closes immediately after a day is selected and keeps the time of day', () => {
    const onChange = vi.fn();
    render(<DatePicker value={value} onChange={onChange} />);

    fireEvent.click(screen.getByText(/November 19/));
    const grid = screen.getByRole('grid');

    fireEvent.click(within(grid).getByText('20').closest('button')!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getDate()).toBe(20);
    expect(picked.getHours()).toBe(8);
    expect(picked.getMinutes()).toBe(15);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('closes when the already-selected day is clicked', () => {
    const onChange = vi.fn();
    render(<DatePicker value={value} onChange={onChange} />);

    fireEvent.click(screen.getByText(/November 19/));
    const grid = screen.getByRole('grid');

    fireEvent.click(within(grid).getByText('19').closest('button')!);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not paint an accent square under the selected day when it is today', () => {
    const today = new Date();
    render(<DatePicker value={today} onChange={vi.fn()} />);

    fireEvent.click(screen.getByText(new RegExp(`${today.toLocaleString('en-US', { month: 'long' })}`)));
    const grid = screen.getByRole('grid');
    const selected = grid.querySelector('[aria-selected="true"]') as HTMLElement | null;
    expect(selected).not.toBeNull();

    const cell = selected!.closest('td')!;
    expect(cell.className).not.toContain('bg-accent');
    expect(selected!.className).toContain('aria-selected:bg-primary');
  });

  it('shows the placeholder when no value is set', () => {
    render(<DatePicker value={null} onChange={vi.fn()} placeholder="Choose a date" />);
    expect(screen.getByText('Choose a date')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<DatePicker value={value} onChange={vi.fn()} disabled />);

    fireEvent.click(screen.getByText(/November 19/));

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
