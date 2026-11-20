import { Combobox } from '@/components/ui/combobox';
import { tt } from '@/components/languages/hardcodedTranslate';
import { BIBLE_BOOK_CHAPTERS } from '@/features/Bible/constants';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export interface PassageSelection { bookName: string; chapter: string; verseNumber: string; verseEnd: string }
type PassageFieldKey = keyof PassageSelection;
export function PassageFields({ value, onChange, verseNumbers, loading = false, allowRange = true, errors }: {
  value: PassageSelection; onChange: (value: PassageSelection) => void; verseNumbers: number[]; loading?: boolean; allowRange?: boolean;
  errors?: Partial<Record<PassageFieldKey, string>>;
}) {
  const [rangeMode, setRangeMode] = useState(!!value.verseEnd && Number(value.verseEnd) > Number(value.verseNumber));
  useEffect(() => {
    if (value.verseEnd && Number(value.verseEnd) > Number(value.verseNumber)) setRangeMode(true);
  }, [value.verseEnd, value.verseNumber]);
  useEffect(() => {
    setRangeMode(!!value.verseEnd && Number(value.verseEnd) > Number(value.verseNumber));
  }, [value.bookName, value.chapter]); // Reset when a different passage is loaded externally.
  const chapterCount = BIBLE_BOOK_CHAPTERS[value.bookName as keyof typeof BIBLE_BOOK_CHAPTERS] || 0;
  const fields = [
    { key: 'bookName' as const, label: 'Book', value: value.bookName, options: Object.keys(BIBLE_BOOK_CHAPTERS), disabled: false,
      change: (bookName: string) => { setRangeMode(false); onChange({ bookName, chapter: '', verseNumber: '', verseEnd: '' }); } },
    { key: 'chapter' as const, label: 'Chapter', value: value.chapter, options: Array.from({ length: chapterCount }, (_, i) => String(i + 1)), disabled: !value.bookName,
      change: (chapter: string) => { setRangeMode(false); onChange({ ...value, chapter, verseNumber: '', verseEnd: '' }); } },
    { key: 'verseNumber' as const, label: rangeMode ? 'From verse' : 'Verse', value: value.verseNumber, options: verseNumbers.map(String), disabled: !value.bookName || !value.chapter || loading,
      change: (verseNumber: string) => onChange({ ...value, verseNumber, verseEnd: '' }) },
    { key: 'verseEnd' as const, label: 'Through verse', value: value.verseEnd || value.verseNumber, options: verseNumbers.filter(v => v >= Number(value.verseNumber)).map(String), disabled: !value.bookName || !value.chapter || !value.verseNumber || loading,
      change: (verseEnd: string) => onChange({ ...value, verseEnd: verseEnd === value.verseNumber ? '' : verseEnd }) },
  ];
  return <div className="space-y-3">
    <div className={`grid gap-3 sm:grid-cols-2 ${rangeMode ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
    {fields.slice(0, 2).map(field => renderField(field))}
    {allowRange && value.bookName && value.chapter && <div className="col-span-full" role="group" aria-label={tt('Passage selection mode')}>
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <Button type="button" size="sm" variant={!rangeMode ? 'secondary' : 'ghost'} aria-pressed={!rangeMode} onClick={() => { setRangeMode(false); onChange({ ...value, verseEnd: '' }); }}>{tt('Single verse')}</Button>
        <Button type="button" size="sm" variant={rangeMode ? 'secondary' : 'ghost'} aria-pressed={rangeMode} onClick={() => setRangeMode(true)}>{tt('Verse range')}</Button>
      </div>
    </div>}
    {fields.slice(2).filter(field => rangeMode || field.label !== 'Through verse').map(field => renderField(field))}
    </div>
  </div>;

  function renderField(field: typeof fields[number]) {
    const error = errors?.[field.key];
    return <div className="space-y-1.5" key={field.label} data-validation-field={field.key}>
      <div className="text-xs font-medium text-muted-foreground">{tt(field.label)}</div>
      <Combobox ariaLabel={tt(field.label)} value={field.value} options={field.options.map(option => ({ value: option, label: option }))}
        disabled={field.disabled} invalid={!!error} onChange={field.change} placeholder={loading && field.label.includes('verse') ? tt('Loading…') : tt(`Select ${field.label.toLowerCase()}…`)} width="w-full" />
      {error && <p role="status" className="text-xs text-destructive">{tt(error)}</p>}
    </div>;
  }
}
