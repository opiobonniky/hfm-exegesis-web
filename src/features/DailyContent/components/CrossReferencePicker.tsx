import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { tt } from '@/components/languages/hardcodedTranslate';
import { PassageFields } from './PassageFields';
import { usePassagePreview } from '../hooks/usePassagePreview';
import { parseReferences, serializeReferences, referenceLabel, referenceError, type ReferenceEntry } from '../helpers/editorContent';

let nextId = 0;
const rowsFrom = (value: string) => parseReferences(value).map(row => ({ ...row, key: ++nextId }));

export function CrossReferencePicker({ value, onChange, bibleVersion, isRtl, showCommentary = false }: {
  value: string; onChange: (value: string) => void; bibleVersion: string; isRtl: boolean; showCommentary?: boolean;
}) {
  const [rows, setRows] = useState(() => rowsFrom(value));
  const emitted = useRef(value);
  useLayoutEffect(() => {
    if (value !== emitted.current) { emitted.current = value; setRows(rowsFrom(value)); }
  }, [value]);
  const update = (next: typeof rows) => {
    setRows(next);
    emitted.current = serializeReferences(next.map(({ key: _key, ...row }) => row));
    onChange(emitted.current);
  };
  return <section className="space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
    <div><h3 className="text-sm font-semibold">{tt('Cross references')}</h3>
      <p className="text-xs text-muted-foreground">{tt('Select a passage or verse range to quote it automatically. Existing quotations are preserved until you change the passage.')}</p></div>
    {rows.map((row, index) => <ReferenceRow key={row.key} row={row} version={bibleVersion} showCommentary={showCommentary} error={referenceError(row, index)}
      onChange={patch => update(rows.map(item => item.key === row.key ? { ...item, ...patch } : item))}
      onRemove={() => update(rows.filter(item => item.key !== row.key))} />)}
    {!rows.length && <p className="text-sm text-muted-foreground">{tt('No cross references added yet.')}</p>}
    <Button type="button" variant="outline" size="sm" onClick={() => update([...rows, { key: ++nextId, bookName: '', chapter: 0, verseNumber: 0, referenceText: '' }])}>
      <Plus className="mr-2 h-4 w-4" />{tt('Add reference')}</Button>
  </section>;
}

function ReferenceRow({ row, version, onChange, onRemove, showCommentary, error }: {
  row: ReferenceEntry; version: string; onChange: (patch: Partial<ReferenceEntry>) => void; onRemove: () => void; showCommentary: boolean; error: string;
}) {
  const preview = usePassagePreview(row.bookName, row.chapter, row.verseNumber, row.verseEnd, version);
  const [autoFill, setAutoFill] = useState(false);
  const changeRef = useRef(onChange); changeRef.current = onChange;
  const lastVersion = useRef(version);
  useEffect(() => {
    if (lastVersion.current !== version) {
      lastVersion.current = version;
      setAutoFill(true);
      changeRef.current({ referenceText: '' });
    }
  }, [version]);
  useEffect(() => {
    if (autoFill && preview.text) { changeRef.current({ referenceText: preview.text }); setAutoFill(false); }
  }, [autoFill, preview.text]);
  return <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium">{row.bookName && row.verseNumber ? referenceLabel(row) : tt('New reference')}</span>
      <Button type="button" size="icon" variant="ghost" aria-label={tt('Remove cross reference')} onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
    </div>
    <PassageFields value={{ bookName: row.bookName, chapter: row.chapter ? String(row.chapter) : '', verseNumber: row.verseNumber ? String(row.verseNumber) : '', verseEnd: row.verseEnd ? String(row.verseEnd) : '' }}
      verseNumbers={preview.verseNumbers} loading={preview.loading}
      onChange={next => { setAutoFill(true); onChange({ bookName: next.bookName, chapter: Number(next.chapter), verseNumber: Number(next.verseNumber), verseEnd: next.verseEnd ? Number(next.verseEnd) : undefined, referenceText: '' }); }} />
    {preview.error && <p role="alert" className="text-sm text-destructive">{tt(preview.error)} <Button type="button" variant="link" onClick={preview.retry}>{tt('Retry')}</Button></p>}
    <label className="block space-y-1 text-xs font-medium">{tt('Quoted passage')}
      <Textarea value={row.referenceText} onChange={e => { setAutoFill(false); onChange({ referenceText: e.target.value }); }}
        disabled={!row.bookName || !row.chapter || !row.verseNumber || preview.loading} rows={3} className="resize-y font-serif"
        placeholder={preview.loading ? tt('Loading…') : tt('Select a passage to fill its text.')} /></label>
    {!row.bookName && row.referenceText && <p className="text-xs text-amber-600">{tt('Legacy text preserved. Select its passage before editing the quotation.')}</p>}
    {error && <p role="alert" className="text-xs text-destructive">{tt(error)}</p>}
    {(showCommentary || row.commentary) && <label className="block space-y-1 text-xs font-medium">{tt('Commentary')}<Textarea value={row.commentary || ''} rows={3} maxLength={8000} onChange={e => onChange({ commentary: e.target.value })} /></label>}
  </div>;
}
