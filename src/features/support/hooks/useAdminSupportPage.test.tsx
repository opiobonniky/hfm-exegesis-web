import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useAdminSupportPage } from './useAdminSupportPage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: vi.fn(),
  getTickets: vi.fn(),
  getStats: vi.fn(),
  subscribe: vi.fn(() => () => {}),
  refreshUnread: vi.fn(),
  syncThread: vi.fn(),
  adminReply: vi.fn(),
  connected: false,
}));

vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/Routes/routes', () => ({ routes: { landing: { path: '/' } } }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('../contexts/SupportRealtimeContext', () => ({
  useSupportRealtime: () => ({
    connected: mocks.connected,
    subscribe: mocks.subscribe,
    refreshUnread: mocks.refreshUnread,
    syncThread: mocks.syncThread,
  }),
}));
vi.mock('./useSupportAttachment', () => ({
  useSupportAttachment: () => ({
    data: { attachment: null, uploading: false },
    actions: { selectFile: vi.fn(), clear: vi.fn() },
  }),
}));
vi.mock('../services/support-service', () => ({
  getAdminSupportTickets: mocks.getTickets,
  getSupportStats: mocks.getStats,
  getAdminSupportTicket: vi.fn(),
  adminReplyToTicket: mocks.adminReply,
  updateSupportTicketStatus: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connected = false;
  mocks.getTickets.mockResolvedValue({ returnCode: 200, returnData: { tickets: [], totalCount: 0 } });
  mocks.getStats.mockResolvedValue({ returnCode: 200, returnData: { unreadCount: 0 } });
});

afterEach(cleanup);

describe('useAdminSupportPage initialization', () => {
  it.each(['unavailable', 'no_devices', 'failed'])('warns when the message saves but push status is %s', async status => {
    const ticket = { id: 7, userId: 'reader', messages: [], adminUnread: false } as any;
    mocks.syncThread.mockResolvedValue({ ticket, presence: { userOnline: false } });
    mocks.adminReply.mockResolvedValue({ returnCode: 200, returnData: { ...ticket, pushDelivery: { sent: 0, status } } });
    const { result } = renderHook(() => useAdminSupportPage());
    await waitFor(() => expect(result.current.data.loading).toBe(false));
    await act(async () => { await result.current.actions.openThread(ticket); });
    act(() => result.current.actions.setReply('Test reply'));
    await act(async () => { await result.current.actions.sendReply(); });
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Reply saved — phone notification not sent' }));
  });
  it('renders and loads the inbox without referencing an uninitialized callback', async () => {
    const { result } = renderHook(() => useAdminSupportPage());
    await waitFor(() => expect(result.current.data.loading).toBe(false));
    expect(mocks.getTickets).toHaveBeenCalled();
    expect(result.current.data.error).toBeNull();
  });

  it('recovers the inbox when the socket reconnects', async () => {
    const { result, rerender } = renderHook(() => useAdminSupportPage());
    await waitFor(() => expect(result.current.data.loading).toBe(false));
    const calls = mocks.getTickets.mock.calls.length;
    mocks.connected = true;
    rerender();
    await waitFor(() => expect(mocks.getTickets.mock.calls.length).toBeGreaterThan(calls));
    expect(result.current.data.connected).toBe(true);
  });
});
