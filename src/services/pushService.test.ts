import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(), deleteToken: vi.fn(), supported: vi.fn(), sendPost: vi.fn(),
  show: vi.fn(), notifications: vi.fn(), register: vi.fn(),
}));
vi.mock('firebase/messaging', () => ({ getMessaging: () => ({}), getToken: mocks.getToken, deleteToken: mocks.deleteToken,
  isSupported: mocks.supported, onMessage: vi.fn(() => () => {}) }));
vi.mock('@/firebaseConfiguration/config', () => ({ app: {}, firebaseConfig: { projectId: 'test-project' } }));
vi.mock('./api', () => ({ API_BASE_URL: 'https://backend.example', sendPostRequest: mocks.sendPost }));

let service: typeof import('./pushService');
beforeEach(async () => {
  vi.resetModules(); vi.clearAllMocks();
  vi.stubEnv('VITE_FIREBASE_VAPID_KEY', 'public-test-key');
  localStorage.clear(); localStorage.setItem('auth_token', 'test-session');
  localStorage.setItem('user_data', JSON.stringify({ id: 'reader', userRole: 2 }));
  vi.stubGlobal('Notification', { permission: 'granted', requestPermission: vi.fn().mockResolvedValue('granted') });
  const registration = { active: {}, getNotifications: mocks.notifications, showNotification: mocks.show };
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register: mocks.register, ready: Promise.resolve(registration) } });
  mocks.register.mockResolvedValue(registration); mocks.notifications.mockResolvedValue([]); mocks.show.mockResolvedValue(undefined);
  mocks.supported.mockResolvedValue(true); mocks.getToken.mockResolvedValue('browser-token'); mocks.deleteToken.mockResolvedValue(true);
  mocks.sendPost.mockResolvedValue({ returnCode: 200, returnData: { sent: 1 } });
  service = await import('./pushService');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('browser push for both account roles', () => {
  it.each([1, 2])('registers a web token for role %s', async role => {
    localStorage.setItem('user_data', JSON.stringify({ id: `role-${role}`, userRole: role }));
    await expect(service.enableWebPush()).resolves.toEqual({ enabled: true });
    expect(mocks.sendPost).toHaveBeenCalledWith('push', 'register-token', expect.objectContaining({ token: 'browser-token', platform: 'web' }));
    expect(service.isWebPushEnabled()).toBe(true);
    expect(localStorage.getItem('push_token_last:test-project:registration')).not.toContain('test-session');
  });
  it('does not claim registration succeeded when the backend rejects it', async () => {
    mocks.sendPost.mockResolvedValue({ returnCode: 503, returnMessage: 'Unavailable' });
    expect((await service.enableWebPush()).enabled).toBe(false);
    expect(service.isWebPushEnabled()).toBe(false);
  });
  it('does not register or send when browser permission is denied', async () => {
    vi.stubGlobal('Notification', { permission: 'denied', requestPermission: vi.fn().mockResolvedValue('denied') });
    expect((await service.enableWebPush()).enabled).toBe(false);
    expect(mocks.getToken).not.toHaveBeenCalled(); expect(mocks.sendPost).not.toHaveBeenCalled();
  });
  it('respects explicit disable when silently syncing on foreground or network recovery', async () => {
    await service.enableWebPush(); await service.disableWebPush(); vi.clearAllMocks();
    await service.syncPushTokenIfPermitted();
    expect(mocks.getToken).not.toHaveBeenCalled(); expect(service.isWebPushEnabled()).toBe(false);
  });
  it('can rebind after logout without permanently opting the browser out', async () => {
    await service.enableWebPush(); await service.disableWebPush(false);
    localStorage.setItem('auth_token', 'admin-session'); localStorage.setItem('user_data', JSON.stringify({ id: 'admin', userRole: 1 }));
    await service.syncPushTokenIfPermitted(); expect(service.isWebPushEnabled()).toBe(true);
  });
  it('does not let a late registration undo disabling browser alerts', async () => {
    await service.enableWebPush();
    let finish!: (token: string) => void;
    mocks.getToken.mockImplementationOnce(() => new Promise<string>(resolve => { finish = resolve; }));
    const sync = service.syncPushTokenIfPermitted();
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
    const disable = service.disableWebPush();
    finish('browser-token');
    await Promise.all([sync, disable]);
    expect(service.isWebPushEnabled()).toBe(false);
  });
  it('preserves notification ticket data and role-specific link in foreground', async () => {
    await service.showLocalNotification('Reader replied', 'Message', { kind: 'support-message', audience: 'admin', ticketId: '42', messageId: '9' });
    expect(mocks.show).toHaveBeenCalledWith('Reader replied', expect.objectContaining({
      tag: 'support-message-9', data: expect.objectContaining({ link: `${window.location.origin}/admin/support?ticketId=42&messageId=9` }),
    }));
  });
  it('avoids a duplicate when the service worker already displayed the message', async () => {
    mocks.notifications.mockResolvedValue([{ tag: 'support-message-9' }]);
    await service.showLocalNotification('Reply', 'Message', { kind: 'support-message', messageId: '9' });
    expect(mocks.show).not.toHaveBeenCalled();
  });
  it('tests actual backend delivery to web tokens rather than local display or phone tokens', async () => {
    await expect(service.sendWebPushTest()).resolves.toBe(1);
    expect(mocks.sendPost).toHaveBeenCalledWith('push', 'test', { platform: 'web' });
    expect(mocks.show).not.toHaveBeenCalled();
    mocks.sendPost.mockResolvedValue({ returnCode: 200, returnData: { sent: 0 }, returnMessage: 'No browser sent' });
    await expect(service.sendWebPushTest()).rejects.toThrow('No browser sent');
  });
});
