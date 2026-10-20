import { describe, expect, it } from 'vitest';
import { isSupportNotificationPath, notificationLink, notificationTag } from './notificationRouting';

describe('support browser notification routing', () => {
  it.each([['admin', '/admin/support'], ['user', '/support']])('routes the %s audience to the exact ticket', (audience, path) => {
    expect(notificationLink({ kind: 'support-message', audience, ticketId: '42', messageId: '9' }, 'https://app.example'))
      .toBe(`https://app.example${path}?ticketId=42&messageId=9`);
  });
  it('keeps an admin account reader-ticket notification on the reader route', () => {
    expect(notificationLink({ kind: 'support-message', audience: 'user', ticketId: '42' }, 'https://app.example'))
      .toBe('https://app.example/support?ticketId=42');
  });
  it('uses the current browser origin even if the backend link belongs to production', () => {
    expect(notificationLink({ kind: 'support-message', audience: 'admin', ticketId: '42', link: 'https://production.example/admin/support?ticketId=42' }, 'http://localhost:8080'))
      .toBe('http://localhost:8080/admin/support?ticketId=42');
  });
  it('rejects external and script notification targets', () => {
    expect(notificationLink({ link: 'https://evil.example' }, 'https://app.example')).toBe('https://app.example/');
    expect(notificationLink({ link: 'javascript:alert(1)' }, 'https://app.example')).toBe('https://app.example/');
  });
  it('uses one tag for socket and FCM delivery', () => {
    expect(notificationTag({ kind: 'support-message', messageId: '9' })).toBe('support-message-9');
    expect(notificationTag({ notificationId: 'support-message-9' })).toBe('support-message-9');
  });
  it('only retains valid same-origin support links across sign-in', () => {
    expect(isSupportNotificationPath('/admin/support?ticketId=42')).toBe(true);
    expect(isSupportNotificationPath('/support?ticketId=42')).toBe(true);
    expect(isSupportNotificationPath('/support?ticketId=-1')).toBe(false);
    expect(isSupportNotificationPath('https://evil.example/support?ticketId=42')).toBe(false);
  });
});
