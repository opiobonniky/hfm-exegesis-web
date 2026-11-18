import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { bibleApi, type Translation } from '@/services/bibleApi';
import { filterBibleTranslationsByLanguage, getPreferredBibleId } from '@/features/Bible/services/freeBibleTranslations';

const PREFERENCE_KEY = 'preferred_translation';
const PREFERENCE_EVENT = 'exegesis-bible-preference';
export const editionKey = (id: string) => ['BSB', 'BEREAN'].includes(id.toUpperCase()) ? 'Berean' : id;
const readPreference = () => {
  try { return localStorage.getItem(PREFERENCE_KEY) || ''; } catch { return ''; }
};
const subscribePreference = (notify: () => void) => {
  window.addEventListener('storage', notify);
  window.addEventListener(PREFERENCE_EVENT, notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener(PREFERENCE_EVENT, notify);
  };
};

/** One catalogue/default policy for edition pickers. Saved editorial editions are
 * preserved; new selections follow Settings and only offer the UI language. */
export function useBibleEditions(language = 'en', { initialVersion = '', preserveVersion = false }: {
  initialVersion?: string; preserveVersion?: boolean;
} = {}) {
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => '');
  const [catalog, setCatalog] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState(() => ({
    id: initialVersion || preference || getPreferredBibleId(language), language, preference,
  }));
  const translations = useMemo(() => filterBibleTranslationsByLanguage(catalog, language), [catalog, language]);
  const defaultVersion = translations.find(row => editionKey(row.id) === editionKey(preference))?.id
    || translations.find(row => editionKey(row.id) === editionKey(getPreferredBibleId(language)))?.id
    || translations[0]?.id || (loading ? getPreferredBibleId(language) : '');
  const contextChanged = selection.language !== language || selection.preference !== preference;
  const selected = translations.find(row => editionKey(row.id) === editionKey(selection.id));
  const version = preserveVersion ? selection.id : contextChanged || (!loading && !selected) ? defaultVersion : selected?.id || selection.id;

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    bibleApi.getTranslations().then(rows => { if (active) setCatalog(rows || []); })
      .catch(() => { if (active) setError('Unable to load Bible editions. Please retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!preserveVersion && (contextChanged || selection.id !== version)) {
      setSelection({ id: version, language, preference });
    }
  }, [version, language, preference, preserveVersion, contextChanged, selection.id]);

  const setVersion = useCallback((id: string) => {
    if (id) setSelection({ id, language, preference });
  }, [language, preference]);
  const setPreferredVersion = useCallback((id: string) => {
    if (!translations.some(row => editionKey(row.id) === editionKey(id))) return;
    try { localStorage.setItem(PREFERENCE_KEY, editionKey(id)); } catch { /* storage optional */ }
    window.dispatchEvent(new Event(PREFERENCE_EVENT));
    setVersion(id);
  }, [translations, setVersion]);
  const selectedEntry = catalog.find(row => editionKey(row.id) === editionKey(version));
  const label = (row: Translation) => editionKey(row.id) === 'Berean'
    ? 'BSB — Berean Standard Bible'
    : `${row.shortName || row.id} — ${row.name || row.id}${row.year ? ` (${row.year})` : ''}`;
  const options = translations.map(row => ({ value: editionKey(row.id) === editionKey(version) ? version : row.id, label: label(row) }));
  const selectedLabel = selectedEntry ? label(selectedEntry) : editionKey(version) === 'Berean' ? 'BSB — Berean Standard Bible' : version;
  return { version, setVersion, setPreferredVersion, translations, options, selectedLabel,
    outsideLanguage: !!version && !loading && !selected, loading, error, retry: () => setAttempt(value => value + 1) };
}
