import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tt } from '@/components/languages/hardcodedTranslate';
import type { AddExplanationExtrasFormProps, ExplanationForm } from '../types';
import { CrossReferencePicker } from './CrossReferencePicker';
import { parseReferences, serializeReferences } from '../helpers/editorContent';
import { TakeawayEditor } from './TakeawayEditor';

export function AddExplanationPracticalApplications({ rows, errors, sectionError, onAdd, onRemove, onChange }: {
  rows: ExplanationForm['practicalApps'];
  errors?: string[];
  sectionError?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">{tt('Practical applications')}</h3>
      {rows.map((row, index) => <div key={index} className="space-y-1">
        <div className="flex items-start gap-2">
          <Textarea data-validation-field={`practicalApps.${index}`} aria-label={`${tt('Application')} ${index + 1}`} aria-invalid={!!errors?.[index]}
            className={errors?.[index] ? 'border-destructive focus-visible:ring-destructive' : ''}
            rows={3} maxLength={5000} value={row.applicationText} onChange={e => onChange(index, e.target.value)} />
          <Remove label="Remove application" onClick={() => onRemove(index)} />
        </div>
        {errors?.[index] && <p role="status" className="text-xs text-destructive">{tt(errors[index])}</p>}
      </div>)}
      <Add label="Add application" onClick={onAdd} />
      {sectionError && <p role="status" className="text-xs text-destructive">{tt(sectionError)}</p>}
    </section>
  );
}

export function AddExplanationExtrasForm(p: AddExplanationExtrasFormProps) {
  const errors: NonNullable<AddExplanationExtrasFormProps["errors"]> = p.errors || {};
  const themeMessage = errors.themes?.find(Boolean) || '';
  return <div className="space-y-6">
    <section className="space-y-4">
      <h3 className="text-base font-semibold">{tt('Insights and Cross References')}</h3>
      <section className="space-y-3 rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold">{tt('Key themes')} {themeMessage ? '*' : ''}</h4>
        {p.themes.map((row, index) => <div key={index} className="space-y-1">
          <div className="flex gap-2">
            <Input data-validation-field={`themes.${index}`} aria-label={`${tt('Theme')} ${index + 1}`} aria-invalid={!!errors.themes?.[index]}
              className={errors.themes?.[index] ? 'border-destructive focus-visible:ring-destructive' : ''}
              value={row.themeName} onChange={e => p.updateTheme(index, e.target.value)} />
            <Remove label="Remove theme" onClick={() => p.removeTheme(index)} />
          </div>
          {errors.themes?.[index] && <p role="status" className="text-xs text-destructive">{tt(errors.themes[index])}</p>}
        </div>)}
        <Add label="Add theme" onClick={p.addTheme} />
        {errors.themesCount && <p role="status" className="text-xs text-destructive">{tt(errors.themesCount)}</p>}
      </section>
      <CrossReferencePicker value={serializeReferences(p.crossReferences)} bibleVersion={p.bibleVersion} isRtl={false} showCommentary showErrors={p.showErrors} revealErrors={p.revealRowErrors} requireAll
        onChange={value => p.onCrossReferencesChange(parseReferences(value).map((row, sortOrder) => ({ ...row, commentary: row.commentary || '', sortOrder })))} />
      {errors.crossReferencesCount && <p role="status" className="text-xs text-destructive">{tt(errors.crossReferencesCount)}</p>}
    </section>
    <label className="block space-y-2 text-sm font-semibold">{tt('Final thoughts')} *
      <Textarea data-validation-field="finalThoughts" aria-invalid={!!errors.finalThoughts}
        aria-describedby={errors.finalThoughts ? 'final-thoughts-error' : undefined}
        className={errors.finalThoughts ? 'border-destructive focus-visible:ring-destructive' : ''}
        rows={5} maxLength={10000} value={p.finalThoughts} onChange={e => p.updateFinalThoughts(e.target.value)} />
      {errors.finalThoughts && <p id="final-thoughts-error" role="status" className="text-xs text-destructive">{tt(errors.finalThoughts)}</p>}
    </label>
    <TakeawayEditor value={p.takeaways} onChange={p.updateTakeaways} errors={errors.takeaways} />
    {errors.takeawaysCount && <p role="status" className="text-xs text-destructive">{tt(errors.takeawaysCount)}</p>}
  </div>;
}

function Add({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" variant="outline" size="sm" onClick={onClick}><Plus className="mr-2 h-4 w-4" />{tt(label)}</Button>;
}
function Remove({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" size="icon" aria-label={tt(label)} onClick={onClick}><Trash2 className="h-4 w-4" /></Button>;
}
