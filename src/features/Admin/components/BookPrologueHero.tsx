import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookPrologueDetail } from '../hooks/useBookPrologueDetail';
import { tt } from '@/components/languages/hardcodedTranslate';

export function BookPrologueHero({ item, onBack, onEdit }: { item: BookPrologueDetail; onBack: () => void; onEdit: () => void }) {
  const published = item.isPublished !== false;
  const facts = [
    { label: 'Author', value: item.author },
    { label: 'Chapters', value: item.chapters },
    { label: 'Audience', value: item.audience },
  ].filter(fact => fact.value != null && fact.value !== '');
  return <header className="prologue-hero">
    <nav aria-label={tt('Prologue actions')} className="prologue-actions">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />{tt('Back to Prologues')}</Button>
      <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 rounded-full"><Pencil className="h-3.5 w-3.5" />{tt('Edit prologue')}</Button>
    </nav>
    <div className="prologue-heading-meta"><span>{tt('Book overview')} / {item.bookName}</span><span className={`prologue-status${published ? '' : ' prologue-status-draft'}`}><span aria-hidden="true" />{tt(published ? 'Published' : 'Draft')}</span></div>
    <h1>{item.title || item.bookName}</h1>
    <p className="prologue-deck">{tt('Background, meaning and the threads that bring this book together.')}</p>
    {!!facts.length && <dl className="prologue-facts">{facts.map(fact => <div key={fact.label} className={fact.label === 'Audience' ? 'prologue-fact-audience' : undefined}><dt>{tt(fact.label)}</dt><dd>{fact.value}</dd></div>)}</dl>}
  </header>;
}
