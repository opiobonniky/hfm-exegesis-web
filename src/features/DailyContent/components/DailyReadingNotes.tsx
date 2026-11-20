import type { ReactNode } from 'react';
import { tt } from '@/components/languages/hardcodedTranslate';
import { displayDigits } from '@/services/numberLocale/format';
import { parseList } from '../helpers/contentDetailHelpers';
import { parseWordStudies } from './DailyVerseSections';

type StudyNotes = {
  reflectionQuestions?: string | null; prayer?: string | null; learningPoints?: string | null;
  explanation?: string | null; application?: string | null; verseIntroduction?: string | null;
  backgroundAuthor?: string | null; backgroundBook?: string | null; backgroundContext?: string | null;
  wordStudies?: string | null; practicalApplications?: string | null; keyThemes?: string | null;
  crossReferences?: string | null; finalThoughts?: string | null; takeaways?: string | null; learnMore?: string | null;
};
function Note({ title, children }: { title: string; children: ReactNode }) {
  return <section className="prologue-note prologue-note-wide"><div className="prologue-note-heading"><h2>{title}</h2></div>{children}</section>;
}
function ListNote({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  if (!items.length) return null;
  return <Note title={title}>{numbered ? <ol className="prologue-numbered-list">{items.map((item, index) => <li key={index}><span className="prologue-list-number">{displayDigits(index + 1)}</span><p className="prologue-prose">{item}</p></li>)}</ol> : <ul className="prologue-text-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>}</Note>;
}
export function DailyReadingNotes({ notes }: { notes: StudyNotes }) {
  const questions = parseList(notes.reflectionQuestions);
  const applications = parseList(notes.practicalApplications);
  const lessons = parseList(notes.learningPoints);
  const wordStudies = parseWordStudies(notes.wordStudies);
  const keyThemes = parseList(notes.keyThemes);
  const crossReferences = parseList(notes.crossReferences);
  const takeaways = parseList(notes.takeaways);
  const hasLegacy = [notes.explanation, notes.application, notes.verseIntroduction, notes.backgroundAuthor, notes.backgroundBook, notes.backgroundContext, notes.finalThoughts, notes.learnMore].some(value => value?.trim()) || [wordStudies, keyThemes, crossReferences, takeaways].some(items => items.length);
  if (!questions.length && !applications.length && !lessons.length && !notes.prayer?.trim() && !hasLegacy) return null;
  return <section className="devotion-notes" aria-label={tt('Reflect and apply')}><div className="prologue-section-label"><span>{tt('Reflect and apply')}</span></div><div className="prologue-paper"><div className="prologue-card-grid">
    <ListNote title={tt('Reflection Questions')} items={questions} numbered />
    {notes.prayer?.trim() && <Note title={tt('Prayer')}><p className="prologue-prose whitespace-pre-line">{notes.prayer}</p></Note>}
    <ListNote title={tt('Practical Application')} items={applications} />
    <ListNote title={tt('We Learn Three Things From This Devotional')} items={lessons} />
    {notes.explanation?.trim() && <Note title={tt('Explanation')}><p className="prologue-prose">{notes.explanation}</p></Note>}
    {notes.application?.trim() && <Note title={tt('Application')}><p className="prologue-prose">{notes.application}</p></Note>}
    {notes.verseIntroduction?.trim() && <Note title={tt('Verse Introduction')}><p className="prologue-prose">{notes.verseIntroduction}</p></Note>}
    {(notes.backgroundAuthor || notes.backgroundBook || notes.backgroundContext) && <Note title={tt('Background')}><div className="prologue-prose">{[notes.backgroundAuthor, notes.backgroundBook, notes.backgroundContext].filter(Boolean).map((value, index) => <p key={index}>{value}</p>)}</div></Note>}
    {!!wordStudies.length && <Note title={tt('Strong Concordance Word Study')}><dl className="devotion-word-studies">{wordStudies.map((word, index) => <div key={index}><dt>{word.word}{word.strongs && <span className="devotion-strongs">{word.strongs}</span>}</dt>{word.definition && <dd className="prologue-prose">{word.definition}</dd>}</div>)}</dl></Note>}
    <ListNote title={tt('Key Themes')} items={keyThemes} />
    <ListNote title={tt('Cross References')} items={crossReferences} />
    {notes.finalThoughts?.trim() && <Note title={tt('Final Thoughts')}><p className="prologue-prose">{notes.finalThoughts}</p></Note>}
    <ListNote title={tt('Takeaways')} items={takeaways} numbered />
    {notes.learnMore?.trim() && <Note title={tt('Learn More')}><p className="prologue-prose">{notes.learnMore}</p></Note>}
  </div></div></section>;
}
