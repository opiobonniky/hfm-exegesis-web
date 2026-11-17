import type { ReactNode } from 'react';
import { tt } from '@/components/languages/hardcodedTranslate';
import { displayDigits } from '@/services/numberLocale/format';
import { parseList, parseWordStudies } from './DailyVerseSections';
import type { DailyDevotionDetailData } from '../types';

type StudyNotes = Pick<DailyDevotionDetailData, 'explanation' | 'application' | 'verseIntroduction' | 'backgroundAuthor' | 'backgroundBook' |
  'backgroundContext' | 'wordStudies' | 'practicalApplications' | 'keyThemes' | 'crossReferences' | 'finalThoughts' | 'takeaways' | 'learnMore'>;

function Note({ title, wide = false, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return <section className={`prologue-note${wide ? ' prologue-note-wide' : ''}`}>
    <div className="prologue-note-heading"><h2>{title}</h2></div>{children}
  </section>;
}

function TextNote({ title, text }: { title: string; text?: string | null }) {
  if (!text?.trim()) return null;
  return <Note title={title} wide={text.length > 280}><p className="prologue-prose">{text}</p></Note>;
}

function ListNote({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  if (!items.length) return null;
  return <Note title={title} wide={items.join(' ').length > 280}>
    {numbered ? <ol className="prologue-numbered-list">{items.map((item, index) => <li key={index}>
      <span className="prologue-list-number" aria-hidden="true">{displayDigits(index + 1)}</span><p className="prologue-prose">{item}</p>
    </li>)}</ol> : <ul className="prologue-text-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>}
  </Note>;
}

export function DailyReadingNotes({ notes }: { notes: StudyNotes }) {
  const wordStudies = parseWordStudies(notes.wordStudies);
  const practicalApps = parseList(notes.practicalApplications);
  const keyThemes = parseList(notes.keyThemes);
  const crossRefs = parseList(notes.crossReferences);
  const takeaways = parseList(notes.takeaways);
  const hasNotes = [notes.explanation, notes.application, notes.verseIntroduction, notes.backgroundAuthor, notes.backgroundBook,
    notes.backgroundContext, notes.finalThoughts, notes.learnMore].some(text => text?.trim()) ||
    [wordStudies, practicalApps, keyThemes, crossRefs, takeaways].some(items => items.length);
  if (!hasNotes) return null;

  return <section className="devotion-notes" aria-label={tt('Reflect and explore')}>
    <div className="prologue-section-label"><span>{tt('Reflect and explore')}</span></div>
    <div className="prologue-paper"><div className="prologue-card-grid">
      <TextNote title={tt('Explanation')} text={notes.explanation} />
      <TextNote title={tt('Application')} text={notes.application} />
      <TextNote title={tt('Verse Introduction')} text={notes.verseIntroduction} />
      {(notes.backgroundAuthor || notes.backgroundBook || notes.backgroundContext) && <Note title={tt('Background')} wide>
        <dl className="devotion-background">{[
          { label: 'Author', value: notes.backgroundAuthor }, { label: 'Book', value: notes.backgroundBook }, { label: 'Context', value: notes.backgroundContext },
        ].filter(fact => fact.value).map(fact => <div key={fact.label}><dt>{tt(fact.label)}</dt><dd className="prologue-prose">{fact.value}</dd></div>)}</dl>
      </Note>}
      {!!wordStudies.length && <Note title={tt('Strong Concordance Word Study')} wide>
        <dl className="devotion-word-studies">{wordStudies.map((word, index) => <div key={index}>
          <dt>{word.word}{word.strongs && <span className="devotion-strongs">{word.strongs}</span>}</dt>
          {word.definition && <dd className="prologue-prose">{word.definition}</dd>}
        </div>)}</dl>
      </Note>}
      <ListNote title={tt('Practical Applications')} items={practicalApps} numbered />
      <ListNote title={tt('Key Themes')} items={keyThemes} />
      <ListNote title={tt('Cross References')} items={crossRefs} />
      <TextNote title={tt('Final Thoughts')} text={notes.finalThoughts} />
      <ListNote title={tt('Takeaways')} items={takeaways} numbered />
      <TextNote title={tt('Learn More')} text={notes.learnMore} />
    </div></div>
  </section>;
}
