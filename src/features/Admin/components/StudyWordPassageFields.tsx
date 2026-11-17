import { useEffect, useMemo, useRef, useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { bibleApi, type Translation, type BookInfo } from '@/services/bibleApi';
import { useLanguage } from '@/components/languages/languageProvider';
import { tt } from '@/components/languages/hardcodedTranslate';

export type WordPassage = { bookName: string; chapter: number; verse: number; translation: string; surfaceText: string };

/** Edition-aware Scripture selectors. Values come from the catalogue and the
 * selected edition's chapter data, not hard-coded English verse counts. */
export function StudyWordPassageFields({ value, onChange, locked, busy, onReady }: {
  value: WordPassage; onChange: (patch: Partial<WordPassage>) => void;
  locked: boolean; busy: boolean; onReady: (ready: boolean) => void;
}) {
  const { lang } = useLanguage();
  const [catalog, setCatalog] = useState<Translation[]>([]);
  const [language, setLanguage] = useState<string>(lang || 'en');
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [chapters, setChapters] = useState<{ chapterNumber: number; versesCount: number }[]>([]);
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const callbacks = useRef({ onChange, onReady });
  const initializedLanguage = useRef(false);
  callbacks.current = { onChange, onReady };
  const requestedKey = `${value.translation}:${value.bookName}:${value.chapter}:${value.verse}`;
  const [loadedKey, setLoadedKey] = useState('');
  const ready = loadedKey === requestedKey && !loading && !error && Boolean(verseText);

  useEffect(() => {
    let active = true;
    void bibleApi.getTranslations().then(rows => {
      if (!active) return;
      setCatalog(rows);
      const selected = rows.find(row => row.id === value.translation || (value.translation === 'BSB' && row.id === 'Berean'));
      if (locked && selected) setLanguage(selected.language || 'en');
      if (!locked && !initializedLanguage.current) {
        initializedLanguage.current = true;
        const preferred = rows.filter(row => row.language === (lang || 'en'));
        const edition = preferred.find(row => row.id === value.translation || (value.translation === 'BSB' && row.id === 'Berean')) || preferred[0];
        if (edition) callbacks.current.onChange({ translation: edition.id, surfaceText: '' });
        else if (selected) setLanguage(selected.language || 'en');
      }
    }).catch(() => { if (active) setError('Could not load Bible editions. Please try again.'); });
    return () => { active = false; };
    // Initial edition follows the interface language; user choices stay put.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry, locked]);

  useEffect(() => {
    let active = true;
    setLoading(true); setVerseText(''); setLoadedKey(''); setFrom(''); setTo(''); setError('');
    callbacks.current.onReady(false);
    const edition = value.translation === 'BSB' ? 'Berean' : value.translation;
    void (async () => {
      const availableBooks = await bibleApi.getBooks(edition);
      if (!active) return;
      setBooks(availableBooks);
      if (!availableBooks.some(book => book.bookName === value.bookName)) throw new Error('This book is not available in the selected edition.');
      const chapterData = await bibleApi.getChapters(edition, value.bookName);
      if (!active) return;
      setChapters(chapterData.chapters);
      const currentChapter = chapterData.chapters.find(chapter => chapter.chapterNumber === value.chapter);
      if (!currentChapter) throw new Error('Select a chapter available in this edition.');
      const verses = await bibleApi.getVerses(edition, value.bookName, value.chapter);
      if (!active) return;
      const verse = verses.verses.find(row => row.verseNumber === value.verse);
      if (!verse?.text) throw new Error('This verse is not available in the selected edition.');
      setVerseText(verse.text); setLoadedKey(requestedKey);
    })().catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load the selected verse.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [value.translation, value.bookName, value.chapter, value.verse, requestedKey, retry]);

  useEffect(() => { callbacks.current.onReady(ready); }, [ready]);
  const tokens = useMemo(() => [...verseText.matchAll(/\S+/gu)].map((match, index) => ({ index, text: match[0], start: match.index!, end: match.index! + match[0].length })), [verseText]);
  const chooseWords = (start: string, end: string) => {
    setFrom(start); setTo(end);
    const first = tokens[Number(start)]; const last = tokens[Number(end)];
    if (first && last) callbacks.current.onChange({ surfaceText: verseText.slice(first.start, last.end) });
  };
  const editions = catalog.filter(row => (row.language || 'en') === language);
  const languages = [...new Map(catalog.map(row => [row.language || 'en', { value: row.language || 'en', label: row.languageName || row.language || 'English' }])).values()].sort((a, b) => a.label.localeCompare(b.label));
  const maxVerse = chapters.find(chapter => chapter.chapterNumber === value.chapter)?.versesCount || 0;
  const selector = (label: string, node: React.ReactNode) => <label className="block space-y-2"><span className="text-sm font-semibold">{tt(label)}</span>{node}</label>;
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      {selector('Bible language', <Combobox width="w-full" value={language} options={languages} disabled={busy || locked || !catalog.length} placeholder={tt('Select a language')} searchPlaceholder={tt('Search languages...')} onChange={next => {
        if (!next) return;
        setLanguage(next); const edition = catalog.find(row => (row.language || 'en') === next);
        if (edition) onChange({ translation: edition.id, chapter: 1, verse: 1, surfaceText: '' });
      }} />)}
      {selector('Bible edition', <Combobox width="w-full" value={value.translation === 'BSB' ? 'Berean' : value.translation} options={editions.map(row => ({ value: row.id, label: `${row.shortName || row.name} — ${row.name}${row.year ? ` (${row.year})` : ''}` }))} disabled={busy || locked || !editions.length} placeholder={tt('Select an edition')} searchPlaceholder={tt('Search Bible editions...')} onChange={next => next && onChange({ translation: next, chapter: 1, verse: 1, surfaceText: '' })} />)}
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {selector('Book', <Combobox width="w-full" value={value.bookName} options={books.map(book => ({ value: book.bookName, label: tt(book.bookName) }))} disabled={busy || locked || !books.length} placeholder={tt('Select a book')} searchPlaceholder={tt('Search books...')} onChange={next => next && onChange({ bookName: next, chapter: 1, verse: 1, surfaceText: '' })} />)}
      {selector('Chapter', <Combobox width="w-full" value={String(value.chapter)} options={chapters.map(chapter => ({ value: String(chapter.chapterNumber), label: `${tt('Chapter')} ${chapter.chapterNumber}` }))} disabled={busy || locked || !chapters.length} placeholder={tt('Select a chapter')} searchPlaceholder={tt('Search chapters...')} onChange={next => next && onChange({ chapter: Number(next), verse: 1, surfaceText: '' })} />)}
      {selector('Verse', <Combobox width="w-full" value={String(value.verse)} options={Array.from({ length: maxVerse }, (_, index) => ({ value: String(index + 1), label: `${tt('Verse')} ${index + 1}` }))} disabled={busy || locked || !maxVerse} placeholder={tt('Select a verse')} searchPlaceholder={tt('Search verses...')} onChange={next => next && onChange({ verse: Number(next), surfaceText: '' })} />)}
    </div>
    {loading && <p role="status" className="text-sm text-muted-foreground">{tt('Loading selected verse...')}</p>}
    {error && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{tt(error)}</p><Button type="button" variant="outline" onClick={() => setRetry(previous => previous + 1)}>{tt('Try again')}</Button></div>}
    {ready && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-semibold text-primary">{value.bookName} {value.chapter}:{value.verse} · {value.translation}</p><p className="mt-2 whitespace-pre-wrap font-serif text-lg leading-relaxed" dir="auto">{verseText}</p></div>}
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{tt('Choose the first and last word of the phrase. The exact text is copied from the selected verse.')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {selector('From word', <Combobox width="w-full" value={from} options={tokens.map(token => ({ value: String(token.index), label: `${token.index + 1} · ${token.text}` }))} disabled={busy || !ready} placeholder={tt('Select the first word')} searchPlaceholder={tt('Search verse words...')} onChange={next => next && chooseWords(next, next)} />)}
        {selector('To word', <Combobox width="w-full" value={to} options={tokens.filter(token => from !== '' && token.index >= Number(from)).map(token => ({ value: String(token.index), label: `${token.index + 1} · ${token.text}` }))} disabled={busy || !ready || from === ''} placeholder={tt('Select the last word')} searchPlaceholder={tt('Search verse words...')} onChange={next => next && chooseWords(from, next)} />)}
      </div>
      <label className="block space-y-2"><span className="text-sm font-semibold">{tt('Word or phrase in this verse')}</span><Input readOnly value={value.surfaceText} placeholder={tt('Choose words from the verse above')} className="h-12 bg-muted/30 font-serif text-lg" dir="auto" /></label>
    </div>
  </div>;
}
