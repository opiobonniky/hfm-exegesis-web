import { Calendar } from 'lucide-react';
import type { DailyDevotionDetailData } from '../types';
import { fmtDate } from '../helpers';
import { tt } from '@/components/languages/hardcodedTranslate';
import { DailyReadingNotes } from './DailyReadingNotes';
import { DailyReadingActions } from './DailyReadingActions';

interface Props {
  devotion: DailyDevotionDetailData;
  liked: boolean;
  onCopy: () => void;
  onShare: () => void;
  onLike: () => void;
}

export function DevotionContent({ devotion, liked, onCopy, onShare, onLike }: Props) {
  const verseRef = devotion.bookName ? `${devotion.bookName}${devotion.chapter ? ` ${devotion.chapter}${devotion.verseNumber ? `:${devotion.verseNumber}` : ''}` : ''}` : null;
  return <main className="prologue-page-shell">
    <article>
      <header className="prologue-hero devotion-hero">
        <div className="prologue-heading-meta"><span>{tt('Daily devotion')}</span><span className="devotion-date"><Calendar aria-hidden="true" />{fmtDate(devotion.displayDate, 'long')}</span></div>
        <h1>{devotion.title}</h1>
        {verseRef && <p className="devotion-reference notranslate" translate="no">{verseRef}{devotion.bibleVersion && <span> · {devotion.bibleVersion}</span>}</p>}
      </header>
      <section className="devotion-reading prologue-paper" aria-label={tt('Today’s devotion')}>
        <div className="devotion-body">{devotion.explanation.split('\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <DailyReadingActions label={tt('Devotion actions')} liked={liked} onCopy={onCopy} onShare={onShare} onLike={onLike} />
      </section>
      <DailyReadingNotes notes={{
        reflectionQuestions: devotion.reflectionQuestions,
        prayer: devotion.prayer,
        practicalApplications: devotion.practicalApplications,
        learningPoints: devotion.learningPoints,
      }} />
      <footer className="devotion-closing">{tt('Meditate on this word today. Let it guide your thoughts and actions.')}</footer>
    </article>
  </main>;
}
