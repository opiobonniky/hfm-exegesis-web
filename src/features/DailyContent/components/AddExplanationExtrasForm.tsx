import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tt } from '@/components/languages/hardcodedTranslate';
import type { AddExplanationExtrasFormProps } from '../types';
import { CrossReferencePicker } from './CrossReferencePicker';
import { parseReferences, serializeReferences } from '../helpers/editorContent';
import { TakeawayEditor } from './TakeawayEditor';

export function AddExplanationExtrasForm(p: AddExplanationExtrasFormProps) {
  return <div className="space-y-6">
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">{tt('Practical applications')}</h3>
      {p.practicalApps.map((row, index) => <div key={index} className="flex items-start gap-2">
        <Textarea aria-label={`${tt('Application')} ${index + 1}`} rows={3} maxLength={5000} value={row.applicationText} onChange={e => p.updatePracticalApp(index, e.target.value)} />
        <Remove label="Remove application" onClick={() => p.removePracticalApp(index)} />
      </div>)}
      <Add label="Add application" onClick={p.addPracticalApp} />
    </section>
    <CrossReferencePicker value={serializeReferences(p.crossReferences)} bibleVersion={p.bibleVersion} isRtl={false} showCommentary
      onChange={value => p.onCrossReferencesChange(parseReferences(value).map((row, sortOrder) => ({ ...row, commentary: row.commentary || '', sortOrder })))} />
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">{tt('Key themes')}</h3>
      {p.themes.map((row, index) => <div key={index} className="flex gap-2">
        <Input aria-label={`${tt('Theme')} ${index + 1}`} value={row.themeName} onChange={e => p.updateTheme(index, e.target.value)} />
        <Remove label="Remove theme" onClick={() => p.removeTheme(index)} />
      </div>)}
      <Add label="Add theme" onClick={p.addTheme} />
    </section>
    <TakeawayEditor value={p.takeaways} onChange={p.updateTakeaways} />
    <label className="block space-y-2 text-sm font-semibold">{tt('Final thoughts')}
      <Textarea rows={5} maxLength={10000} value={p.finalThoughts} onChange={e => p.updateFinalThoughts(e.target.value)} />
    </label>
  </div>;
}

function Add({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" variant="outline" size="sm" onClick={onClick}><Plus className="mr-2 h-4 w-4" />{tt(label)}</Button>;
}
function Remove({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" size="icon" aria-label={tt(label)} onClick={onClick}><Trash2 className="h-4 w-4" /></Button>;
}
