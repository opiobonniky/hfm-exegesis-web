import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { tt } from '@/components/languages/hardcodedTranslate';
import { useId } from 'react';

interface Props {
  label: string;
  itemLabel: string;
  addLabel: string;
  removeLabel: string;
  emptyLabel: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  rows?: number;
  maxItems?: number;
}

/** Each row is one item: paragraph breaks must not become extra list items. */
export function DevotionListEditor({ label, itemLabel, addLabel, removeLabel, emptyLabel,
  placeholder, value, onChange, error, rows = 3, maxItems }: Props) {
  const id = useId();
  return <section aria-labelledby={`${id}-label`} className="space-y-3 rounded-xl border border-border p-4">
    <div className="flex items-center justify-between gap-2">
      <h3 id={`${id}-label`} className="text-sm font-semibold">{label} *</h3>
      <span className="text-xs text-muted-foreground">{value.filter(item => item.trim()).length}{maxItems ? ` / ${maxItems}` : ''} {tt('items')}</span>
    </div>
    {!value.length && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
    {value.map((item, index) => <div key={index} className="flex items-start gap-2">
      <span className="pt-2 text-sm text-muted-foreground">{index + 1}.</span>
      <Textarea aria-label={`${itemLabel} ${index + 1}`} aria-invalid={!!error && (!item.trim() || !!maxItems && value.length !== maxItems)}
        aria-describedby={error ? `${id}-error` : undefined} rows={rows} maxLength={5000}
        className="min-w-0 flex-1 resize-y leading-relaxed" placeholder={placeholder} value={item}
        onChange={event => onChange(value.map((row, i) => i === index ? event.target.value : row))} />
      <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label={`${removeLabel} ${index + 1}`}
        onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
    </div>)}
    {error && <p id={`${id}-error`} role="status" className="text-xs text-destructive">{error}</p>}
    <Button type="button" variant="outline" size="sm" disabled={!!maxItems && value.length >= maxItems}
      onClick={() => onChange([...value, ''])}><Plus className="mr-2 h-4 w-4" />{addLabel}</Button>
  </section>;
}
