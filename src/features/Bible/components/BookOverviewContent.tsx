import type { ReactNode } from 'react';
import type { BookPrologue } from '@/services/bookProloguesApi';
import { tt } from '@/components/languages/hardcodedTranslate';

interface BookOverviewContentProps {
  bookName: string;
  prologue: BookPrologue;
  designation: string | null;
  testamentLabel: string;
}

function Note({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return <section className={`prologue-note${wide ? ' prologue-note-wide' : ''}`}>
    <div className="prologue-note-heading"><h2>{title}</h2></div>
    {children}
  </section>;
}

function DetailBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return <Note title={label} wide={value.length > 280}><p className="prologue-prose">{value}</p></Note>;
}

function BulletList({ label, items }: { label: string; items?: string[] | null }) {
  if (!items?.length) return null;
  return <Note title={label} wide={items.join(' ').length > 280}>
    <ul className="prologue-text-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
  </Note>;
}

export default function BookOverviewContent({ bookName, prologue, designation, testamentLabel }: BookOverviewContentProps) {
  const facts = [
    { label: 'Author', value: prologue.author },
    { label: 'Chapters', value: prologue.chapters },
    { label: 'Date Written', value: prologue.dateWritten },
    { label: 'Location Written', value: prologue.locationWritten },
    { label: 'Audience', value: prologue.audience },
  ].filter(fact => fact.value != null && fact.value !== '');

  return <article className="prologue-page-shell">
    <header className="prologue-hero">
      <div className="prologue-heading-meta"><span>{tt('Book overview')} / {bookName}</span><span>{tt(testamentLabel)}</span></div>
      <h1>{prologue.title?.trim() || bookName}</h1>
      {designation && <p className="prologue-deck">{designation}</p>}
      {!!facts.length && <dl className="prologue-facts">{facts.map(fact => <div key={fact.label} className={fact.label === 'Audience' ? 'prologue-fact-audience' : undefined}>
        <dt>{tt(fact.label)}</dt><dd>{fact.value}</dd>
      </div>)}</dl>}
    </header>

    <section aria-label={tt('Book study notes')}>
      <div className="prologue-section-label"><span>{tt('Explore the book')}</span><span>{bookName}</span></div>
      <div className="prologue-paper"><div className="prologue-card-grid">
        <DetailBlock label={tt('Overview')} value={prologue.summary} />
        <DetailBlock label={tt('Background and History')} value={prologue.background} />
        <DetailBlock label={tt('About the Author')} value={prologue.authorDetail} />
        <DetailBlock label={tt('Purpose')} value={prologue.purpose} />
        <DetailBlock label={tt('What Do We Learn From {book}?').replace('{book}', bookName)} value={prologue.lessons} />
        <BulletList label={tt('Key Applications')} items={prologue.applications} />
        {!!prologue.keyScripture?.length && <Note title={tt('Key Scripture')} wide>
          <div className="prologue-scriptures notranslate" translate="no">{prologue.keyScripture.map((verse, index) => <figure key={index}>
            {verse.text && <blockquote>{verse.text}</blockquote>}<figcaption>{verse.reference}</figcaption>
          </figure>)}</div>
        </Note>}
        {!!prologue.structure?.length && <Note title={tt('Structure')} wide>
          <ol className="prologue-structure">{prologue.structure.map((part, index) => <li key={index}><span className="prologue-range">{part.range}</span><p className="prologue-prose">{part.title}</p></li>)}</ol>
        </Note>}
        <DetailBlock label={tt('Key Theme')} value={prologue.keyTheme} />
        <BulletList label={tt('Main Themes')} items={prologue.mainThemes} />
        <BulletList label={tt('Key People')} items={prologue.keyPeople} />
        <BulletList label={tt('Key Verses')} items={prologue.keyVerses} />
        <DetailBlock label={tt('Connection to Christ')} value={prologue.christConnection} />
      </div></div>
    </section>
  </article>;
}
