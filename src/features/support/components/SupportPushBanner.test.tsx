import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportPushBanner } from './SupportPushBanner';

const mocks = vi.hoisted(() => ({ enable: vi.fn(), disable: vi.fn(), test: vi.fn(), permission: vi.fn() }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/services/pushService', () => ({
  enableWebPush: mocks.enable, disableWebPush: mocks.disable, sendWebPushTest: mocks.test,
  getPushPermission: mocks.permission, isPushSupported: async () => true, isWebPushEnabled: () => false,
}));
beforeEach(() => {
  vi.clearAllMocks(); mocks.permission.mockReturnValue('granted');
  mocks.enable.mockResolvedValue({ enabled: true }); mocks.test.mockResolvedValue(1);
});
afterEach(cleanup);

describe('support push controls', () => {
  it.each(['admin', 'user'] as const)('offers opt-in and a backend browser test to %s', async audience => {
    render(<SupportPushBanner audience={audience} />);
    const enable = screen.getByRole('button', { name: 'Enable browser alerts' });
    await waitFor(() => expect(enable).toBeEnabled());
    expect(mocks.enable).not.toHaveBeenCalled();
    fireEvent.click(enable);
    const test = await screen.findByRole('button', { name: 'Send backend test' });
    fireEvent.click(test);
    await waitFor(() => expect(mocks.test).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Firebase accepted the browser test.'));
  });
  it('explains blocked permission rather than repeatedly prompting', async () => {
    mocks.permission.mockReturnValue('denied'); render(<SupportPushBanner audience="user" />);
    expect(screen.getByRole('button', { name: 'Enable browser alerts' })).toBeDisabled();
    await screen.findByText('Notifications are blocked. Allow them in this browser’s site settings.');
    expect(mocks.enable).not.toHaveBeenCalled();
  });
});
