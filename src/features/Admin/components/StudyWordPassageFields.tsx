import { useEffect, useMemo, useRef, useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { bibleApi, type BookInfo } from '@/services/bibleApi';
import { useBibleEditions, editionKey } from '@/hooks/useBibleEditions';
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
  const editions = useBibleEditions(lang);
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [chapters, setChapters] = useState<{ chapterNumber: number; versesCount: number }[]>([]);
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const callbacks = useRef({ onChange, onReady });
  callbacks.current = { onChange, onReady };
  const requestedKey = `${value.translation}:${value.bookName}:${value.chapter}:${value.verse}`;
  const [loadedKey, setLoadedKey] = useState('');
  const ready = loadedKey === requestedKey && !loading && !error && Boolean(verseText)
    && !editions.loading && !editions.error && (locked || editionKey(value.translation) === editionKey(editions.version));

  useEffect(() => {
    if (!locked && !editions.loading && editionKey(value.translation) !== editionKey(editions.version)) {
      callbacks.current.onChange({ translation: editions.version, surfaceText: '' });
    }
  }, [editions.version, editions.loading, locked]);

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
  const maxVerse = chapters.find(chapter => chapter.chapterNumber === value.chapter)?.versesCount || 0;
  const selector = (label: string, node: React.ReactNode) => <label className="block space-y-2"><span className="text-sm font-semibold">{tt(label)}</span>{node}</label>;
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      {selector('Bible language', <Input readOnly value={editions.translations[0]?.languageName || lang || 'en'} />)}
      {selector('Bible edition', <Combobox width="w-full" value={value.translation === 'BSB' ? 'Berean' : value.translation} options={editions.options} disabled={busy || locked || !editions.options.length} placeholder={value.translation || tt('Select an edition')} searchPlaceholder={tt('Search Bible editions...')} onChange={next => {
        if (!next) return;
        editions.setVersion(next);
        onChange({ translation: next, chapter: 1, verse: 1, surfaceText: '' });
      }} />)}
    </div>
    {editions.error && <p role="alert" className="text-sm text-destructive">{tt(editions.error)} <Button type="button" variant="outline" onClick={editions.retry}>{tt('Try again')}</Button></p>}
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
