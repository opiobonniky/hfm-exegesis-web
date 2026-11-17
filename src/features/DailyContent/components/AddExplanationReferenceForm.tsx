import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { tt } from '@/components/languages/hardcodedTranslate';
import type { AddExplanationReferenceFormProps } from '../types';
import { PassageFields } from './PassageFields';

export function AddExplanationReferenceForm(p: AddExplanationReferenceFormProps) {
  return <div className="space-y-5">
    <label className="block space-y-2 text-sm font-medium">{tt('Bible version')}
      <Combobox options={p.sortedTranslationOptions} value={p.bibleVersion} onChange={v => p.updateField('bibleVersion', v)} placeholder={tt('Select a Bible version')} width="w-full" />
    </label>
    <PassageFields value={{ bookName: p.bookName, chapter: p.chapter, verseNumber: p.verseNumber, verseEnd: p.verseEnd }}
      verseNumbers={p.verseOptions} loading={p.verseOptionsLoading} onChange={next => {
        if (next.bookName !== p.bookName) p.updateField('bookName', next.bookName);
        else if (next.chapter !== p.chapter) p.updateField('chapter', next.chapter);
        else if (next.verseNumber !== p.verseNumber) p.updateField('verseNumber', next.verseNumber);
        else p.updateField('verseEnd', next.verseEnd);
      }} />
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
      <h3 className="text-sm font-semibold">{tt('Selected passage text')}</h3>
      {p.passageError ? <p role="alert" className="text-sm text-destructive">{tt(p.passageError)} <Button type="button" variant="link" onClick={p.retryPassage}>{tt('Retry')}</Button></p> :
        <p className="whitespace-pre-wrap font-serif text-sm leading-7">{p.selectedVerseText || tt(p.verseTextLoading ? 'Loading…' : 'Select a book, chapter and verse or range to preview the passage.')}</p>}
    </div>
  </div>;
}
