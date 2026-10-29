import { useCallback, useEffect, useRef, useState } from "react";
import { bibleApi, mapTranslationId, type Translation } from "@/services/bibleApi";
import { filterBibleTranslationsByLanguage, getPreferredBibleId } from "../services/freeBibleTranslations";

/** Use the reader's saved edition and authoritative catalogue, never a static English list. */
export function useSearchTranslation(language: string, requested: string | null) {
  const [catalog, setCatalog] = useState<Array<Translation & { abbreviation?: string }>>([]);
  const [translation, setTranslationState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  const initialLanguage = useRef(language);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setTranslationState(null);
    bibleApi.getTranslations().then(items => {
      if (cancelled) return;
      setCatalog(items);
      const local = filterBibleTranslationsByLanguage(items, language);
      let stored = "";
      try { stored = localStorage.getItem("preferred_translation") || ""; } catch { /* optional */ }
      const explicit = language === initialLanguage.current && requested ? mapTranslationId(requested) : "";
      if (explicit && !items.some(item => item.id === explicit)) throw new Error("The requested Bible edition is unavailable. Please select an available edition.");
      const selected = items.find(item => item.id === explicit)
        || local.find(item => item.id === mapTranslationId(stored))
        || local.find(item => item.id === mapTranslationId(getPreferredBibleId(language)))
        || local[0];
      if (!selected) throw new Error("No Bible edition is available for this language.");
      setTranslationState(selected.id);
    }).catch(cause => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load Bible editions.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [language, requested, retryToken]);
  const setTranslation = useCallback((id: string) => {
    if (!catalog.some(item => item.id === id)) return;
    setTranslationState(id); setError(null);
    try { localStorage.setItem("preferred_translation", id); } catch { /* optional */ }
  }, [catalog]);
  const entry = catalog.find(item => item.id === translation);
  const translations = filterBibleTranslationsByLanguage(catalog, language);
  if (entry && !translations.some(item => item.id === entry.id)) translations.unshift(entry);
  const abbreviation = entry?.abbreviation || entry?.shortName || entry?.id || "";
  const versionLabel = entry?.language && entry.language !== "en"
    ? `${entry.languageName || entry.language} · ${abbreviation}` : abbreviation;
  return { translation, setTranslation, translations, versionLabel, versionName: entry?.name || "", showSuggestions: entry?.language === "en", error, loading, retry: () => setRetryToken(value => value + 1) };
}
