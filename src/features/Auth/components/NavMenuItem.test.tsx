import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookOpen } from 'lucide-react';
import { NavMenuItem } from './NavMenuItem';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

describe('public desktop submenu', () => {
  it('opens with the keyboard, selects a destination, and restores focus on Escape', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(<NavMenuItem item={{ label: 'About Us', icon: BookOpen, subItems: [{ label: 'Our mission', href: '/our-mission' }] }} scrolled={false} active={false} onMenuClick={navigate} />);
    const trigger = screen.getByRole('button', { name: 'About Us' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const destination = await screen.findByRole('menuitem', { name: 'Our mission' });
    expect(destination).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledWith('/our-mission');
    await user.click(trigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
