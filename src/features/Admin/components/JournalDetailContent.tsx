// JournalDetailContent — renders a journal entry in the same paper/note grid
// used by the consumer Book Overview.
"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/components/languages/languageProvider";
import { displayDate } from "@/services/numberLocale/format";
import { tt } from '@/components/languages/hardcodedTranslate';

interface JournalEntry {
  title?: string;
  content?: string;
  category?: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  mood?: string;
  isPublished: boolean;
  prayers?: string;
  gratitude?: string;
  learnings?: string;
  application?: string;
  createdOn?: string;
  updatedOn?: string;
}

function Note({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className={`prologue-note${wide ? ' prologue-note-wide' : ''}`}>
      <div className="prologue-note-heading"><h2>{title}</h2></div>
      {children}
    </section>
  );
}

function TextBlock({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  if (!value?.trim()) return null;
  return (
    <Note title={label} wide={wide ?? value.length > 280}>
      <p className="prologue-prose whitespace-pre-wrap break-words">{value}</p>
    </Note>
  );
}

export function JournalDetailContent({ item }: { item: JournalEntry }) {
  const { lang } = useLanguage();
  const reference = item.bookName
    ? `${item.bookName}${item.chapter ? ` ${item.chapter}` : ""}${item.verseNumber ? `:${item.verseNumber}` : ""}`
    : null;
  const createdLabel = item.createdOn ? displayDate(item.createdOn, lang) : null;
  const updatedLabel = item.updatedOn ? displayDate(item.updatedOn, lang) : null;

  const facts = [
    { label: 'Visibility', value: item.isPublished ? tt('Public') : tt('Private') },
    { label: 'Category', value: item.category },
    { label: 'Reference', value: reference },
    { label: 'Mood', value: item.mood },
    { label: 'Created', value: createdLabel },
    { label: 'Updated', value: updatedLabel },
  ].filter(fact => fact.value != null && fact.value !== '');

  return (
    <article className="prologue-page-shell">
      <header className="prologue-hero">
        <div className="prologue-heading-meta">
          <span>{tt('Journal entry')} / {item.category || tt('Reflection')}</span>
          <span>{item.isPublished ? tt('Public') : tt('Private')}</span>
        </div>
        <h1>{item.title || tt('Untitled')}</h1>
        {reference && <p className="prologue-deck">{reference}</p>}
        {!!facts.length && (
          <dl className="prologue-facts">
            {facts.map(fact => (
              <div key={fact.label} className={fact.label === 'Category' ? 'prologue-fact-audience' : undefined}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <section aria-label={tt('Journal entry')}>
        <div className="prologue-section-label">
          <span>{tt('Entry')}</span>
          <span>{reference || item.title || tt('Journal entry')}</span>
        </div>
        <div className="prologue-paper">
          <div className="prologue-card-grid">
            <TextBlock label={tt('Content')} value={item.content} wide />
            <TextBlock label={tt('Prayers')} value={item.prayers} />
            <TextBlock label={tt('Gratitude')} value={item.gratitude} />
            <TextBlock label={tt('Learnings')} value={item.learnings} />
            <TextBlock label={tt('Application')} value={item.application} wide />
          </div>
        </div>
      </section>
    </article>
  );
}
