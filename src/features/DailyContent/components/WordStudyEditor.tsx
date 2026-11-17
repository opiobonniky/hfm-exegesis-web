import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getStrongsEntry } from '@/services/strongsApi';
import { tt } from '@/components/languages/hardcodedTranslate';
import type { StudyEntry } from '../helpers/editorContent';

export function WordStudyEditor({ value, onChange }: { value: StudyEntry[]; onChange: (rows: StudyEntry[]) => void }) {
  const update = (index: number, patch: Partial<StudyEntry>) => onChange(value.map((row, i) => i === index ? { ...row, ...patch } : row));
  return <section className="space-y-3 rounded-xl border border-border p-4">
    <div><h3 className="text-sm font-semibold">{tt("Strong's word studies")}</h3>
      <p className="text-xs text-muted-foreground">{tt('Add each word separately. Look up a Hebrew (H) or Greek (G) ID, then write its meaning in this passage.')}</p></div>
    {value.map((row, index) => <div key={index} className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold">{tt('Word')} {index + 1}</span>
        <div className="flex gap-1">{[-1, 1].map(dir => <Button key={dir} type="button" size="icon" variant="ghost" disabled={index + dir < 0 || index + dir >= value.length}
          aria-label={tt(dir < 0 ? 'Move word up' : 'Move word down')} onClick={() => { const next = [...value]; [next[index], next[index + dir]] = [next[index + dir], next[index]]; onChange(next); }}>
          {dir < 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}</Button>)}
          <Button type="button" size="icon" variant="ghost" aria-label={tt('Remove word')} onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>
      </div>
      <StudyFields row={row} onChange={patch => update(index, patch)} />
    </div>)}
    {!value.length && <p className="text-sm text-muted-foreground">{tt('No word studies added yet.')}</p>}
    <Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, { surfaceText: '', strongsId: '', customDefinition: '' }])}><Plus className="mr-2 h-4 w-4" />{tt('Add word study')}</Button>
  </section>;
}

function StudyFields({ row, onChange }: { row: StudyEntry; onChange: (patch: Partial<StudyEntry>) => void }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const current = useRef({ row, onChange }); current.current = { row, onChange };
  const request = useRef(0);
  const lookup = async () => {
    const id = row.strongsId.trim().toUpperCase();
    if (!/^[HG][1-9]\d*$/.test(id)) { setStatus('Use one valid ID, for example H7503 or G2112.'); return; }
    const ticket = ++request.current;
    setLoading(true); setStatus('');
    try {
      const entry = await getStrongsEntry(id);
      if (ticket !== request.current || current.current.row.strongsId.trim().toUpperCase() !== id) return;
      if (!entry) { setStatus('No dictionary entry found. Your own definition is preserved.'); return; }
      const latest = current.current.row;
      current.current.onChange({ strongsId: id,
        ...(!latest.surfaceText.trim() ? { surfaceText: [entry.originalWord, entry.transliteration].filter(Boolean).join(' · ') } : {}),
        ...(!latest.customDefinition.trim() ? { customDefinition: entry.fullDefinition || entry.shortDefinition || '' } : {}),
      });
      setStatus([entry.originalWord, entry.transliteration, entry.shortDefinition].filter(Boolean).join(' · '));
    } catch { if (ticket === request.current) setStatus('Dictionary lookup failed. Please retry.'); }
    finally { if (ticket === request.current) setLoading(false); }
  };
  return <>
    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-1 text-xs font-medium">{tt('Word / surface text')}<Input value={row.surfaceText} onChange={e => onChange({ surfaceText: e.target.value })} placeholder={tt('e.g. Be still')} /></label>
      <label className="space-y-1 text-xs font-medium">{tt("Strong's ID")}<div className="flex gap-2"><Input aria-label={tt("Strong's ID")} value={row.strongsId} onChange={e => { request.current++; setLoading(false); setStatus(''); onChange({ strongsId: e.target.value.toUpperCase() }); }} placeholder="H7503" />
        <Button type="button" variant="outline" disabled={loading || !row.strongsId.trim()} onClick={lookup}><Search className="mr-1 h-4 w-4" />{tt(loading ? 'Loading…' : 'Look up')}</Button></div></label>
    </div>
    {status && <p role="status" className="text-xs text-muted-foreground">{tt(status)}</p>}
    <label className="block space-y-1 text-xs font-medium">{tt('Definition and contextual meaning')}<Textarea value={row.customDefinition} rows={3} className="resize-y" onChange={e => onChange({ customDefinition: e.target.value })} placeholder={tt('Explain how this word is used in the selected passage.')} /></label>
  </>;
}
