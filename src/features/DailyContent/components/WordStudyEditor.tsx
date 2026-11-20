import { useId } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tt } from '@/components/languages/hardcodedTranslate';
import { isEmptyStudy, requiredStudyFieldErrors, studyFieldErrors, type StudyEntry } from '../helpers/editorContent';
import { useValidationFeedback } from '../hooks/useValidationFeedback';

export function WordStudyEditor({ value, onChange, showErrors = true, revealErrors = true, requireAll = false, rejectEmpty = false }: { value: StudyEntry[]; onChange: (rows: StudyEntry[]) => void; showErrors?: boolean; revealErrors?: boolean; requireAll?: boolean; rejectEmpty?: boolean }) {
  const update = (index: number, patch: Partial<StudyEntry>) => onChange(value.map((row, i) => i === index ? { ...row, ...patch } : row));
  return <section className="space-y-3 rounded-xl border border-border p-4">
    <div><h3 className="text-sm font-semibold">{tt("Strong's word studies")}</h3>
      <p className="text-xs text-muted-foreground">{tt('Add each word separately. Enter a Hebrew (H) or Greek (G) ID and write its meaning in this passage.')}</p></div>
    {value.map((row, index) => <div key={index} className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold">{tt('Word')} {index + 1}</span>
        <div className="flex gap-1">{[-1, 1].map(dir => <Button key={dir} type="button" size="icon" variant="ghost" disabled={index + dir < 0 || index + dir >= value.length}
          aria-label={tt(dir < 0 ? 'Move word up' : 'Move word down')} onClick={() => { const next = [...value]; [next[index], next[index + dir]] = [next[index + dir], next[index]]; onChange(next); }}>
          {dir < 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}</Button>)}
          <Button type="button" size="icon" variant="ghost" aria-label={tt('Remove word')} onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>
      </div>
      <StudyFields row={row} showErrors={showErrors} revealErrors={revealErrors}
        requireAll={requireAll || rejectEmpty && isEmptyStudy(row)} onChange={patch => update(index, patch)} />
    </div>)}
    {!value.length && <p className="text-sm text-muted-foreground">{tt('No word studies added yet.')}</p>}
    <Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, { surfaceText: '', strongsId: '', customDefinition: '' }])}><Plus className="mr-2 h-4 w-4" />{tt('Add word study')}</Button>
  </section>;
}

function StudyFields({ row, onChange, showErrors, revealErrors, requireAll }: { row: StudyEntry; onChange: (patch: Partial<StudyEntry>) => void; showErrors: boolean; revealErrors: boolean; requireAll?: boolean }) {
  const fieldId = useId();
  const feedback = useValidationFeedback();
  const errors = !showErrors
    ? { surfaceText: '', strongsId: '', customDefinition: '' }
    : requireAll
      ? requiredStudyFieldErrors(row)
      : studyFieldErrors(row);
  for (const key of Object.keys(errors) as (keyof typeof errors)[]) {
    if (!revealErrors && !feedback.visible(key, 'wordStudy')) errors[key] = '';
  }
  const fieldProps = (field: keyof typeof errors) => ({
    ...feedback.bind(field, 'wordStudy'),
    id: `${fieldId}-${field}`,
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `${fieldId}-${field}-error` : undefined,
    className: errors[field] ? 'border-destructive focus-visible:ring-destructive' : '',
  });
  const fieldError = (field: keyof typeof errors) => errors[field] &&
    <p id={`${fieldId}-${field}-error`} className="text-xs text-destructive">{tt(errors[field])}</p>;
  return <>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1 text-xs font-medium"><label htmlFor={`${fieldId}-surfaceText`}>{tt('Word / surface text')}</label><Input {...fieldProps('surfaceText')} value={row.surfaceText} onChange={e => onChange({ surfaceText: e.target.value })} placeholder={tt('e.g. Be still')} />{fieldError('surfaceText')}</div>
      <div className="space-y-1 text-xs font-medium"><label htmlFor={`${fieldId}-strongsId`}>{tt("Strong's ID")}</label><Input {...fieldProps('strongsId')} value={row.strongsId} onChange={e => onChange({ strongsId: e.target.value.toUpperCase() })} placeholder="H7503" />{fieldError('strongsId')}</div>
    </div>
    <div className="space-y-1 text-xs font-medium"><label htmlFor={`${fieldId}-customDefinition`}>{tt('Definition and contextual meaning')}</label><Textarea {...fieldProps('customDefinition')} value={row.customDefinition} rows={3} className={`resize-y ${fieldProps('customDefinition').className}`} onChange={e => onChange({ customDefinition: e.target.value })} placeholder={tt('Explain how this word is used in the selected passage.')} />{fieldError('customDefinition')}</div>
  </>;
}
