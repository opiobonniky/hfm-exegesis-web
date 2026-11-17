import { Calendar } from 'lucide-react';
import { fmtDate, isToday } from '../helpers';
import { tt } from '@/components/languages/hardcodedTranslate';
import type { DailyVerseItem } from '../types';
import { DailyReadingNotes } from './DailyReadingNotes';
import { DailyReadingActions } from './DailyReadingActions';

interface Props {
  verse: DailyVerseItem;
  liked: boolean;
  onCopy: () => void;
  onShare: () => void;
  onLike: () => void;
}

export function VerseContent({ verse, liked, onCopy, onShare, onLike }: Props) {
  const text = verse.verseText || verse.text;
  return <main className="prologue-page-shell">
    <article>
      <header className="prologue-hero">
        <div className="prologue-heading-meta"><span>{tt(isToday(verse.displayDate) ? 'Today’s Verse' : 'Daily verse')}</span>
          <span className="devotion-date"><Calendar aria-hidden="true" />{fmtDate(verse.displayDate, 'long')}</span>
        </div>
        <h1 className="notranslate" translate="no">{verse.bookName} {verse.chapter}:{verse.verseNumber}</h1>
        {verse.bibleVersion && <p className="devotion-reference notranslate" translate="no">{verse.bibleVersion}</p>}
      </header>
      <section className="devotion-reading prologue-paper" aria-label={tt('Daily verse')}>
        {text ? <blockquote className="daily-verse-quotation notranslate" translate="no">{text}</blockquote> :
          <p className="prologue-prose">{verse.reflection || tt('Verse text not available')}</p>}
        {text && verse.reflection && verse.reflection !== text && <section className="daily-verse-reflection" aria-label={tt('Reflection')}>
          <h2>{tt('Reflection')}</h2><p className="prologue-prose">{verse.reflection}</p>
        </section>}
        <DailyReadingActions label={tt('Verse actions')} liked={liked} onCopy={onCopy} onShare={onShare} onLike={onLike} />
      </section>
      <DailyReadingNotes notes={verse} />
      <footer className="devotion-closing">{tt('Meditate on this verse today.')}</footer>
    </article>
  </main>;
}
