import { Combobox } from '@/components/ui/combobox';
import { tt } from '@/components/languages/hardcodedTranslate';
import { BIBLE_BOOK_CHAPTERS } from '@/features/Bible/constants';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export interface PassageSelection { bookName: string; chapter: string; verseNumber: string; verseEnd: string }
export function PassageFields({ value, onChange, verseNumbers, loading = false }: {
  value: PassageSelection; onChange: (value: PassageSelection) => void; verseNumbers: number[]; loading?: boolean;
}) {
  const [rangeMode, setRangeMode] = useState(!!value.verseEnd && Number(value.verseEnd) > Number(value.verseNumber));
  useEffect(() => {
    if (value.verseEnd && Number(value.verseEnd) > Number(value.verseNumber)) setRangeMode(true);
  }, [value.verseEnd, value.verseNumber]);
  const chapterCount = BIBLE_BOOK_CHAPTERS[value.bookName as keyof typeof BIBLE_BOOK_CHAPTERS] || 0;
  const fields = [
    { label: 'Book', value: value.bookName, options: Object.keys(BIBLE_BOOK_CHAPTERS), disabled: false,
      change: (bookName: string) => { setRangeMode(false); onChange({ bookName, chapter: '', verseNumber: '', verseEnd: '' }); } },
    { label: 'Chapter', value: value.chapter, options: Array.from({ length: chapterCount }, (_, i) => String(i + 1)), disabled: !value.bookName,
      change: (chapter: string) => { setRangeMode(false); onChange({ ...value, chapter, verseNumber: '', verseEnd: '' }); } },
    { label: rangeMode ? 'From verse' : 'Verse', value: value.verseNumber, options: verseNumbers.map(String), disabled: !value.bookName || !value.chapter || loading,
      change: (verseNumber: string) => onChange({ ...value, verseNumber, verseEnd: '' }) },
    { label: 'Through verse', value: value.verseEnd || value.verseNumber, options: verseNumbers.filter(v => v >= Number(value.verseNumber)).map(String), disabled: !value.bookName || !value.chapter || !value.verseNumber || loading,
      change: (verseEnd: string) => onChange({ ...value, verseEnd: verseEnd === value.verseNumber ? '' : verseEnd }) },
  ];
  return <div className="space-y-3">
    <div className="inline-flex gap-1 rounded-lg border border-border bg-muted/30 p-1" role="group" aria-label={tt('Passage selection mode')}>
      <Button type="button" size="sm" variant={!rangeMode ? 'secondary' : 'ghost'} aria-pressed={!rangeMode} onClick={() => { setRangeMode(false); onChange({ ...value, verseEnd: '' }); }}>{tt('Single verse')}</Button>
      <Button type="button" size="sm" variant={rangeMode ? 'secondary' : 'ghost'} aria-pressed={rangeMode} onClick={() => setRangeMode(true)}>{tt('Verse range')}</Button>
    </div>
    <div className={`grid gap-3 sm:grid-cols-2 ${rangeMode ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
    {fields.filter(field => rangeMode || field.label !== 'Through verse').map(field => <div className="space-y-1.5" key={field.label}>
      <div className="text-xs font-medium text-muted-foreground">{tt(field.label)}</div>
      <Combobox ariaLabel={tt(field.label)} value={field.value} options={field.options.map(option => ({ value: option, label: option }))}
        disabled={field.disabled} onChange={field.change} placeholder={loading && field.label.includes('verse') ? tt('Loading…') : tt(`Select ${field.label.toLowerCase()}…`)} width="w-full" />
    </div>)}
    </div>
  </div>;
}
