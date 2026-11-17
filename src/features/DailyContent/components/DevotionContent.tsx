import type { ReactNode } from 'react';
import { Calendar, Heart, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseList, parseWordStudies } from './DailyVerseSections';
import type { DailyDevotionDetailData } from '../types';
import { fmtDate } from '../helpers';
import { tt } from '@/components/languages/hardcodedTranslate';
import { displayDigits } from '@/services/numberLocale/format';

interface Props {
  devotion: DailyDevotionDetailData;
  liked: boolean;
  onCopy: () => void;
  onShare: () => void;
  onLike: () => void;
}

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

export function DevotionContent({ devotion, liked, onCopy, onShare, onLike }: Props) {
  const verseRef = devotion.bookName ? `${devotion.bookName}${devotion.chapter ? ` ${devotion.chapter}${devotion.verseNumber ? `:${devotion.verseNumber}` : ''}` : ''}` : null;
  const wordStudies = parseWordStudies(devotion.wordStudies);
  const practicalApps = parseList(devotion.practicalApplications);
  const keyThemes = parseList(devotion.keyThemes);
  const crossRefs = parseList(devotion.crossReferences);
  const takeaways = parseList(devotion.takeaways);
  const hasNotes = [devotion.explanation, devotion.application, devotion.verseIntroduction, devotion.backgroundAuthor, devotion.backgroundBook,
    devotion.backgroundContext, devotion.finalThoughts, devotion.learnMore].some(text => text?.trim()) ||
    [wordStudies, practicalApps, keyThemes, crossRefs, takeaways].some(items => items.length);

  return <main className="prologue-page-shell">
    <article>
      <header className="prologue-hero devotion-hero">
        <div className="prologue-heading-meta"><span>{tt('Daily devotion')}</span><span className="devotion-date"><Calendar aria-hidden="true" />{fmtDate(devotion.displayDate, 'long')}</span></div>
        <h1>{devotion.title}</h1>
        {verseRef && <p className="devotion-reference notranslate" translate="no">{verseRef}{devotion.bibleVersion && <span> · {devotion.bibleVersion}</span>}</p>}
      </header>

      <section className="devotion-reading prologue-paper" aria-label={tt('Today’s devotion')}>
        <div className="devotion-body">{devotion.content.split('\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <div className="devotion-actions" role="group" aria-label={tt('Devotion actions')}>
          <Button variant="outline" size="sm" onClick={onCopy}><Copy aria-hidden="true" />{tt('Copy')}</Button>
          <Button variant="outline" size="sm" onClick={onShare}><Share2 aria-hidden="true" />{tt('Share')}</Button>
          <Button variant="outline" size="sm" onClick={onLike} aria-pressed={liked} className={liked ? 'devotion-liked' : undefined}>
            <Heart aria-hidden="true" className={liked ? 'fill-current' : undefined} />{tt(liked ? 'Liked' : 'Like')}
          </Button>
        </div>
      </section>

      {hasNotes && <section className="devotion-notes" aria-label={tt('Reflect and explore')}>
        <div className="prologue-section-label"><span>{tt('Reflect and explore')}</span></div>
        <div className="prologue-paper"><div className="prologue-card-grid">
          <TextNote title={tt('Explanation')} text={devotion.explanation} />
          <TextNote title={tt('Application')} text={devotion.application} />
          <TextNote title={tt('Verse Introduction')} text={devotion.verseIntroduction} />
          {(devotion.backgroundAuthor || devotion.backgroundBook || devotion.backgroundContext) && <Note title={tt('Background')} wide>
            <dl className="devotion-background">{[
              { label: 'Author', value: devotion.backgroundAuthor }, { label: 'Book', value: devotion.backgroundBook }, { label: 'Context', value: devotion.backgroundContext },
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
          <TextNote title={tt('Final Thoughts')} text={devotion.finalThoughts} />
          <ListNote title={tt('Takeaways')} items={takeaways} numbered />
          <TextNote title={tt('Learn More')} text={devotion.learnMore} />
        </div></div>
      </section>}
      <footer className="devotion-closing">{tt('Meditate on this word today. Let it guide your thoughts and actions.')}</footer>
    </article>
  </main>;
}
