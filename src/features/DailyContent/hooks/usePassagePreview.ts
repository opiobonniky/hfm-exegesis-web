import { useEffect, useState } from 'react';
import { bibleApi } from '@/services/bibleApi';
import { canonicalBook, validPassage } from '../helpers/editorContent';

export function usePassagePreview(book: string, chapter: string | number, start: string | number, end?: string | number | null, version = 'BSB') {
  const key = `${version}:${book}:${chapter}`;
  const [result, setResult] = useState<{ key: string; verses: { verseNumber: number; text: string }[]; error: string }>({ key: '', verses: [], error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    if (!book || !Number(chapter) || !version) return;
    bibleApi.getVerses(version, canonicalBook(book), Number(chapter)).then(data => {
      if (!active) return;
      const verses = data?.verses || [];
      setResult({ key, verses, error: verses.length ? '' : 'No verses available for this chapter and translation.' });
    }).catch(() => { if (active) setResult({ key, verses: [], error: 'Unable to load this passage. Please retry.' }); });
    return () => { active = false; };
  }, [key, book, chapter, version, retry]);
  const current = result.key === key;
  const verses = current ? result.verses : [];
  const selected = validPassage(book, chapter, start, end);
  const last = Number(end || start);
  const range = selected ? verses.filter(v => v.verseNumber >= Number(start) && v.verseNumber <= last) : [];
  const complete = selected && range.length === last - Number(start) + 1;
  return {
    verses, verseNumbers: verses.map(v => v.verseNumber),
    text: complete ? range.map(v => range.length > 1 ? `${v.verseNumber}. ${v.text}` : v.text).join('\n') : '',
    loading: !!book && !!Number(chapter) && !current,
    error: current ? result.error || (selected && !complete && verses.length ? 'Select a valid verse range within this chapter.' : '') : '',
    retry: () => { setResult({ key: '', verses: [], error: '' }); setRetry(n => n + 1); },
  };
}
