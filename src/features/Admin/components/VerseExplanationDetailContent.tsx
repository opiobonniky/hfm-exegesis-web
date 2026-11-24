// VerseExplanationDetail — read-only view laid out like the consumer Book
// Overview (same hero, fact list, paper and note grid).
"use client";

import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { displayDate } from "@/services/numberLocale/format";
import { bibleVersionFullName } from "../utils";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  item: any;
}

const parseTakeaways = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parseTakeaways(parsed);
    } catch {
      // ignore and fall through to a single-item array
    }

    return [trimmed];
  }

  return [];
};

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

function BulletList({ label, items }: { label: string; items?: string[] | null }) {
  if (!items?.length) return null;
  return (
    <Note title={label} wide={items.join(' ').length > 280}>
      <ul className="prologue-text-list">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </Note>
  );
}

export function VerseExplanationDetailContent({ item }: Props) {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  if (!item) return null;

  const {
    id,
    bookName,
    chapter,
    verseNumber,
    verseEnd,
    bibleVersion,
    isPublished,
    exegesis,
    studyMetadata,
    wordStudies,
    practicalApps,
    crossReferences,
    themes,
  } = item;
  const takeaways = parseTakeaways(studyMetadata?.takeaways ?? item.takeaways);
  const reference = `${bookName} ${chapter}:${verseNumber}${verseEnd ? `–${verseEnd}` : ''}`;
  const versionName = bibleVersionFullName(bibleVersion);

  // Use the same id first, so a list that was filtered/ordered differently
  // still returns to this exact record.
  const edit = () => navigate("/admin/add-verse-explanation", { state: { explanationId: id } });

  const background = [
    studyMetadata?.backgroundAuthor && `${tt("Author")}: ${studyMetadata.backgroundAuthor}`,
    studyMetadata?.backgroundBook && `${tt("Book")}: ${studyMetadata.backgroundBook}`,
    studyMetadata?.backgroundContext,
  ].filter(Boolean).join('\n\n');

  const createdLabel = item.createdOn ? displayDate(item.createdOn, lang) : null;
  const updatedLabel = item.updatedOn ? displayDate(item.updatedOn, lang) : null;

  const facts = [
    { label: 'Version', value: versionName },
    { label: 'Status', value: isPublished !== false ? tt('Published') : tt('Draft') },
    { label: 'Themes', value: themes?.map((theme: any) => theme.themeName).filter(Boolean).join(' · ') },
    { label: 'Created', value: createdLabel },
    { label: 'Updated', value: updatedLabel },
  ].filter(fact => fact.value != null && fact.value !== '');

  return (
    <article className="prologue-page-shell">
      <header className="prologue-hero">
        <div className="prologue-heading-meta">
          <span>{tt('Verse explanation')} / {bookName}</span>
          <span>{versionName}</span>
        </div>
        <h1>{reference}</h1>
        {item.verseText && (
          <blockquote className="prologue-deck notranslate" translate="no">
            {item.verseText}
          </blockquote>
        )}
        {!!facts.length && (
          <dl className="prologue-facts">
            {facts.map(fact => (
              <div key={fact.label} className={fact.label === 'Themes' ? 'prologue-fact-audience' : undefined}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <section aria-label={tt('Explanation study notes')}>
        <div className="prologue-section-label">
          <span>{tt('Explore the explanation')}</span>
          <span>{reference}</span>
        </div>
        <div className="prologue-paper">
          <div className="prologue-card-grid">
            <TextBlock label={tt('Theological Explanation')} value={exegesis?.explanationText} wide />
            <TextBlock label={tt('Application')} value={exegesis?.applicationText} wide />
            <TextBlock label={tt('Introduction')} value={studyMetadata?.introduction} />
            <TextBlock label={tt('Background and History')} value={background} wide />

            {wordStudies?.length > 0 && (
              <Note title={`${tt("Strong's Word Studies")} (${wordStudies.length})`} wide>
                <div className="prologue-card-grid">
                  {wordStudies.map((study: any, index: number) => (
                    <div key={index} className="prologue-note">
                      <p className="prologue-prose"><strong>{study.surfaceText}</strong>{study.strongsId ? ` · ${study.strongsId}` : ''}</p>
                      {study.customDefinition && <p className="prologue-prose">{study.customDefinition}</p>}
                    </div>
                  ))}
                </div>
              </Note>
            )}

            {crossReferences?.length > 0 && (
              <Note title={`${tt('Cross References')} (${crossReferences.length})`} wide>
                <ul className="prologue-text-list">
                  {crossReferences.map((crossReference: any, index: number) => {
                    const crReference = `${crossReference.bookName} ${crossReference.chapter}:${crossReference.verseNumber}${crossReference.verseEnd ? `–${crossReference.verseEnd}` : ''}`;
                    return (
                      <li key={index}>
                        <strong>{crReference}</strong>
                        {crossReference.referenceText && <p className="prologue-prose">{crossReference.referenceText}</p>}
                        {crossReference.commentary && <p className="prologue-prose">{crossReference.commentary}</p>}
                      </li>
                    );
                  })}
                </ul>
              </Note>
            )}

            <BulletList
              label={tt('Practical Applications')}
              items={practicalApps?.map((application: any) => application.applicationText).filter(Boolean)}
            />
            <TextBlock label={tt('Final Thoughts')} value={studyMetadata?.finalThoughts} wide />
            <BulletList label={tt('Takeaways')} items={takeaways} />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={edit} className="gap-2 rounded-full">
          <Edit2 className="h-3.5 w-3.5" />
          {tt('Edit explanation')}
        </Button>
      </div>
    </article>
  );
}
