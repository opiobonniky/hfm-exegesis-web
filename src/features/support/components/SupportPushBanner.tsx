import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { tt } from '@/components/languages/hardcodedTranslate';
import { disableWebPush, enableWebPush, getPushPermission, isPushSupported, isWebPushEnabled, sendWebPushTest } from '@/services/pushService';

/** Explicit permission controls are available to both reader and admin roles. */
export function SupportPushBanner({ audience }: { audience: 'admin' | 'user' }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [permission, setPermission] = useState(getPushPermission());
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const available = await isPushSupported();
      if (!active) return;
      setSupported(available); setEnabled(isWebPushEnabled()); setPermission(getPushPermission());
    };
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('web-push-state-changed', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); window.removeEventListener('web-push-state-changed', refresh); };
  }, []);
  const run = async (action: 'enable' | 'disable' | 'test') => {
    setBusy(true); setNotice('');
    try {
      if (action === 'enable') {
        const result = await enableWebPush();
        setEnabled(result.enabled); setPermission(getPushPermission());
        setNotice(result.enabled ? tt('Browser alerts enabled for this account.') : result.reason || tt('Could not enable browser alerts.'));
      } else if (action === 'disable') {
        await disableWebPush(); setEnabled(false); setNotice(tt('Browser alerts disabled on this device.'));
      } else {
        await sendWebPushTest(); setNotice(tt('Firebase accepted the browser test. Check your notification panel.'));
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : tt('Browser notification request failed.')); }
    finally { setBusy(false); }
  };
  return <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4" aria-label={tt('Support browser notifications')}>
    <Bell className="h-5 w-5 shrink-0 text-primary" />
    <div className="min-w-0 flex-1">
      <h2 className="text-sm font-semibold">{tt('Support browser notifications')}</h2>
      <p className="text-xs text-muted-foreground">{!supported ? tt('Use a push-capable browser on HTTPS or localhost.')
        : permission === 'denied' ? tt('Notifications are blocked. Allow them in this browser’s site settings.')
        : enabled ? tt('Enabled here. A notification click opens the matching conversation.')
        : audience === 'admin' ? tt('Enable alerts for new reader messages, even when this tab is closed.')
        : tt('Enable alerts for support replies, even when this tab is closed.')}</p>
      {!!notice && <p className="mt-1 text-xs" role="status">{notice}</p>}
    </div>
    <button type="button" disabled={busy || !supported || permission === 'denied'} onClick={() => void run(enabled ? 'disable' : 'enable')}
      className="rounded-xl border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50">{enabled ? tt('Turn off alerts') : tt('Enable browser alerts')}</button>
    {enabled && <button type="button" disabled={busy} onClick={() => void run('test')}
      className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busy ? tt('Working…') : tt('Send backend test')}</button>}
  </section>;
}
