import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { tt } from '@/components/languages/hardcodedTranslate';

export function TakeawayEditor({ value, onChange, errors }: { value: string[]; onChange: (value: string[]) => void; errors?: string[] }) {
  return <section className="space-y-3 rounded-xl border border-border p-4">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold">{tt('Takeaways')}</h3>
      <span className="text-xs text-muted-foreground">{value.filter(item => item.trim()).length} {tt('items')}</span>
    </div>
    {!value.length && <p className="text-sm text-muted-foreground">{tt('No takeaways added yet.')}</p>}
    {value.map((item, index) => <div key={index} className="space-y-1">
      <div className="flex items-start gap-2">
      <span className="pt-2 text-sm text-muted-foreground">{index + 1}.</span>
      <Textarea data-validation-field={`takeaways.${index}`} aria-label={`${tt('Takeaway')} ${index + 1}`} aria-invalid={!!errors?.[index]}
        aria-describedby={errors?.[index] ? `takeaway-error-${index}` : undefined}
        className={errors?.[index] ? 'border-destructive focus-visible:ring-destructive' : ''}
        rows={2} value={item}
        placeholder={tt('Write a concise takeaway...')}
        onChange={e => onChange(value.map((row, i) => i === index ? e.target.value : row))} />
      <Button type="button" variant="ghost" size="icon" aria-label={`${tt('Remove takeaway')} ${index + 1}`}
        onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
      </div>
      {errors?.[index] && <p id={`takeaway-error-${index}`} role="status" className="text-xs text-destructive">{tt(errors[index])}</p>}
    </div>)}
    <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, ''])}><Plus className="mr-2 h-4 w-4" />{tt('Add takeaway')}</Button>
  </section>;
}
