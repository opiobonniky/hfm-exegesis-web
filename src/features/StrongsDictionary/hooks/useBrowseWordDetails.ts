import { useCallback, useEffect, useRef, useState } from "react";
import { browseWordDetails } from "../services/strongsDictionaryService";
import type { StrongsWord } from "./useStrongsDictionaryPage";

type DetailState = { key: string; word?: StrongsWord; loading?: boolean; failed?: boolean };

export function useBrowseWordDetails(preview: StrongsWord) {
  const { browseBook, strongsNumber, contentLanguage } = preview;
  const key = JSON.stringify([browseBook, strongsNumber, contentLanguage]);
  const [state, setState] = useState<DetailState>();
  const active = useRef<AbortController | null>(null);
  const load = useCallback(async (offset = 0) => {
    if (!browseBook || !contentLanguage) return;
    active.current?.abort();
    const request = new AbortController();
    active.current = request;
    setState(previous => ({ key, word: previous?.key === key ? previous.word : undefined, loading: true }));
    try {
      const word = await browseWordDetails(strongsNumber, browseBook, contentLanguage, offset, request.signal);
      if (request.signal.aborted) return;
      setState(previous => ({
        key,
        word: offset > 0 && previous?.key === key && previous.word
          ? { ...word, contextualStudies: [...(previous.word.contextualStudies || []), ...(word.contextualStudies || [])] }
          : word,
      }));
    } catch {
      if (!request.signal.aborted) setState(previous => ({ ...previous, key, loading: false, failed: true }));
    }
  }, [browseBook, contentLanguage, key, strongsNumber]);
  useEffect(() => {
    void load();
    return () => active.current?.abort();
  }, [load]);
  return { ...(state?.key === key ? state : undefined), load };
}
