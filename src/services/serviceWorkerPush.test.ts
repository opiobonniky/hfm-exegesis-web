import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const script = readFileSync(`${process.cwd()}/public/sw.js`, 'utf8');
function worker() {
  const listeners = new Map<string, (event: any) => void>();
  let background!: (payload: any) => Promise<void>;
  const registration = { showNotification: vi.fn().mockResolvedValue(undefined), getNotifications: vi.fn().mockResolvedValue([]) };
  const clients = { matchAll: vi.fn().mockResolvedValue([]), openWindow: vi.fn().mockResolvedValue({}) };
  runInNewContext(script, {
    importScripts: () => {}, console, URL,
    firebase: { initializeApp: () => {}, messaging: () => ({ onBackgroundMessage: (handler: typeof background) => { background = handler; } }) },
    self: { location: { hostname: 'app.example', origin: 'https://app.example' }, registration, clients,
      addEventListener: (type: string, handler: (event: any) => void) => listeners.set(type, handler) },
  });
  return { background, registration, clients, click: async (data: any) => {
    let pending!: Promise<unknown>;
    listeners.get('notificationclick')!({ stopImmediatePropagation: vi.fn(), notification: { close: vi.fn(), data }, waitUntil: (task: Promise<unknown>) => { pending = task; } });
    await pending;
  } };
}

describe('browser background push and clicks', () => {
  it('does not show a second notification for Firebase auto-displayed payloads', async () => {
    const sw = worker(); await sw.background({ notification: { title: 'Support' }, data: { kind: 'support-message' } });
    expect(sw.registration.showNotification).not.toHaveBeenCalled();
  });
  it('displays data-only support messages with their message identity and preview', async () => {
    const sw = worker(); await sw.background({ data: { kind: 'support-message', messageId: '9', notificationTitle: 'Reader replied', notificationBody: 'Hello' } });
    expect(sw.registration.showNotification).toHaveBeenCalledWith('Reader replied', expect.objectContaining({ body: 'Hello', tag: 'support-message-9' }));
  });
  it.each([['admin', '/admin/support'], ['user', '/support']])('opens the intended %s conversation from an FCM-owned notification', async (audience, path) => {
    const sw = worker(); await sw.click({ FCM_MSG: { data: { kind: 'support-message', audience, ticketId: '42', messageId: '9' } } });
    expect(sw.clients.openWindow).toHaveBeenCalledWith(`https://app.example${path}?ticketId=42&messageId=9`);
  });
  it('navigates and focuses an existing app tab', async () => {
    const sw = worker(); const client = { url: 'https://app.example/home', navigate: vi.fn().mockResolvedValue({}), focus: vi.fn().mockResolvedValue({}) };
    sw.clients.matchAll.mockResolvedValue([client]); await sw.click({ kind: 'support-message', audience: 'admin', ticketId: '42' });
    expect(client.navigate).toHaveBeenCalledWith('https://app.example/admin/support?ticketId=42'); expect(client.focus).toHaveBeenCalled();
  });
  it('never opens an external notification URL or focuses a lookalike origin', async () => {
    const sw = worker(); const focus = vi.fn(); sw.clients.matchAll.mockResolvedValue([{ url: 'https://app.example.evil.test', focus }]);
    await sw.click({ link: 'https://evil.test/phish' });
    expect(focus).not.toHaveBeenCalled(); expect(sw.clients.openWindow).toHaveBeenCalledWith('https://app.example/');
  });
});
