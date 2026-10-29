import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLanguage } from '@/components/languages/languageProvider';
import { tt } from '@/components/languages/hardcodedTranslate';
import { getPublicPackState, subscribePublicPacks, syncPublicPack } from '@/services/publicReadingPacks';
import { bibleApi, type Translation } from '@/services/bibleApi';
import { installOfflineBible, loadOfflineBible, removeOfflineBible } from '@/services/offlineBibles';
import { Button } from '@/components/ui/button';

function PackCard({ kind, language, title }: { kind: 'ui' | 'books' | 'overview'; language: string; title: string }) {
  const state = useSyncExternalStore(subscribePublicPacks, () => getPublicPackState(kind, language));
  const busy = state.stage === 'checking' || state.stage === 'downloading';
  const missing = state.pack && 'missingBooks' in state.pack ? state.pack.missingBooks.length : 0;
  return <section className="rounded-xl border p-4 space-y-2">
    <h2 className="font-semibold">{title}</h2>
    <p role="status">{state.pack ? tt('Installed') : tt('Not installed')} · {language} · {tt(state.stage)}</p>
    {state.pack && <p className="text-sm text-muted-foreground">{tt('Revision')}: {state.pack.revision}</p>}
    {kind === 'ui' && <p className="text-sm text-muted-foreground">{tt('Uncovered web copy remains in English. Installed does not mean every web string is translated.')}</p>}
    {missing > 0 && <p className="text-sm">{missing} {tt('books have no published overview source.')}</p>}
    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    <Button variant="outline" disabled={busy} onClick={() => void syncPublicPack(kind, language, true)}>{tt('Download / update')}</Button>
  </section>;
}

export default function Downloads() {
  const { lang } = useLanguage();
  const [catalog, setCatalog] = useState<Translation[]>([]);
  const [selected, setSelected] = useState('');
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    bibleApi.getTranslations().then(items => {
      if (!active) return;
      setCatalog(items);
      setSelected(items.find(item => item.language === lang)?.id || items[0]?.id || '');
    }).catch(() => { if (active) setMessage(tt('Edition catalog unavailable. Reconnect and retry.')); });
    return () => { active = false; };
  }, [lang]);
  useEffect(() => {
    let active = true;
    setInstalled(false);
    if (selected) void loadOfflineBible(selected).then(data => { if (active) setInstalled(!!data); });
    return () => { active = false; };
  }, [selected]);
  const download = async () => {
    setBusy(true); setMessage('');
    try { await installOfflineBible(selected); setInstalled(true); setMessage(tt('Bible installed and verified for offline reading.')); }
    catch (error) { setMessage(error instanceof Error ? error.message : tt('Download failed')); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await removeOfflineBible(selected); setInstalled(false); setMessage(tt('Download removed.')); }
    catch { setMessage(tt('Could not remove download.')); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-3xl p-5 space-y-5">
    <h1 className="text-2xl font-bold">{tt('Offline downloads')}</h1>
    <p>{tt('Keep selected reading content on this browser. Browser storage may be cleared by your device; private account data is not stored in these packs.')}</p>
    <PackCard kind="ui" language={lang} title={tt('Interface copy')} />
    <PackCard kind="books" language="en" title={tt('Book names and chapter metadata')} />
    <PackCard kind="overview" language={lang} title={tt('Book overviews')} />
    <section className="rounded-xl border p-4 space-y-3">
      <h2 className="font-semibold">{tt('Bible editions')}</h2>
      <label className="block" htmlFor="offline-edition">{tt('Edition')}</label>
      <select id="offline-edition" className="w-full rounded border bg-background p-2" disabled={busy} value={selected} onChange={event => { setSelected(event.target.value); setMessage(''); }}>
        {catalog.map(item => <option key={item.id} value={item.id}>{item.name} ({item.language})</option>)}
      </select>
      {catalog.find(item => item.id === selected)?.attribution && <p className="text-sm">{catalog.find(item => item.id === selected)?.attribution}</p>}
      <p>{installed ? tt('Installed') : tt('Not installed')}</p>
      <div className="flex gap-3">
        <Button disabled={busy || !selected} onClick={() => void download()}>{busy ? tt('Working…') : tt('Download / update')}</Button>
        {installed && <Button variant="outline" disabled={busy} onClick={() => void remove()}>{tt('Remove download')}</Button>}
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  </div>;
}
