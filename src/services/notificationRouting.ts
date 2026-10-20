export type WebNotificationData = Record<string, unknown>;

/** Backend audience determines the destination, including admins with their own
 * reader tickets. Never infer authorization from a notification or open an
 * external URL supplied by a payload. */
export function notificationLink(data: WebNotificationData = {}, origin = window.location.origin): string {
  if (data.kind === 'support-message' && /^[1-9]\d*$/.test(String(data.ticketId ?? ''))) {
    const path = data.audience === 'admin' || data.screen === 'AdminSupport' ? '/admin/support' : '/support';
    const url = new URL(path, origin);
    url.searchParams.set('ticketId', String(data.ticketId));
    if (/^[1-9]\d*$/.test(String(data.messageId ?? ''))) url.searchParams.set('messageId', String(data.messageId));
    return url.href;
  }
  try {
    const url = new URL(String(data.link || '/'), origin);
    return url.origin === origin ? url.href : `${origin}/`;
  } catch { return `${origin}/`; }
}

export function notificationTag(data: WebNotificationData = {}): string {
  return String(data.notificationId || (data.kind === 'support-message' && data.messageId
    ? `support-message-${data.messageId}` : data.kind || 'exegesis-push'));
}

export const PENDING_SUPPORT_LINK = 'support_notification_target';

export function isSupportNotificationPath(path: string): boolean {
  try {
    const url = new URL(path, window.location.origin);
    return url.origin === window.location.origin && ['/support', '/admin/support'].includes(url.pathname)
      && /^[1-9]\d*$/.test(url.searchParams.get('ticketId') || '');
  } catch { return false; }
}
