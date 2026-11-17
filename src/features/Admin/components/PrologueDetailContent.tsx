import type { ReactNode } from 'react';
import { BookOpen, Church, GraduationCap, Landmark, Layers, Lightbulb, MessageCircle, Target, User, Users } from 'lucide-react';
import type { BookPrologueDetail } from '../hooks/useBookPrologueDetail';
import { tt } from '@/components/languages/hardcodedTranslate';

/** Quiet editorial cards: one paper panel, with a responsive grid of sections.
 * All authored content stays intact; only the presentation changes. */
export function PrologueDetailContent({ item }: { item: BookPrologueDetail }) {
  const sections = [
    { title: 'Summary', text: item.summary, icon: MessageCircle },
    { title: 'Purpose', text: item.purpose, icon: Target },
    { title: 'About the Author', text: item.authorDetail, icon: User },
    { title: 'Historical Background', text: item.background, icon: Landmark },
    { title: 'Key Theme', text: item.keyTheme, icon: Layers },
    { title: 'Key Lessons', text: item.lessons, icon: GraduationCap },
    { title: 'Christ Connection', text: item.christConnection, icon: Church },
  ].filter(section => section.text?.trim());
  const hasContent = sections.length || item.applications?.length || item.keyScripture?.length ||
    item.mainThemes?.length || item.keyPeople?.length || item.keyVerses?.length || item.structure?.length;
  if (!hasContent) return <p className="prologue-empty">{tt('No study notes have been added for this book yet.')}</p>;

  return <section aria-label={tt('Book study notes')}>
    <div className="prologue-section-label"><span>{tt('Explore the book')}</span><span>{item.bookName}</span></div>
    <div className="prologue-paper">
      <div className="prologue-card-grid">
        {sections.map(({ title, text, icon: Icon }) => <EditorialCard key={title} title={tt(title)} icon={<Icon />} wide={(text?.length || 0) > 280}>
          <p className="prologue-prose">{text}</p>
        </EditorialCard>)}
        {!!item.applications?.length && <EditorialCard title={tt('Key Applications for Today')} icon={<Lightbulb />} wide>
          <ol className="prologue-numbered-list">{item.applications.map((application, index) => <li key={index}><span className="prologue-list-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p className="prologue-prose">{application}</p></li>)}</ol>
        </EditorialCard>}
        {!!item.keyScripture?.length && <EditorialCard title={tt('Key Scripture')} icon={<BookOpen />} wide>
          <div className="prologue-scriptures">{item.keyScripture.map((verse, index) => <figure key={index}>
            <blockquote>{verse.text}</blockquote><figcaption>{verse.reference}</figcaption>
          </figure>)}</div>
        </EditorialCard>}
        {!!item.mainThemes?.length && <EditorialCard title={tt('Main Themes')} icon={<Layers />}><TextList items={item.mainThemes} /></EditorialCard>}
        {!!item.keyPeople?.length && <EditorialCard title={tt('Key People')} icon={<Users />}><TextList items={item.keyPeople} /></EditorialCard>}
        {!!item.keyVerses?.length && <EditorialCard title={tt('Key Verses')} icon={<BookOpen />} wide><TextList items={item.keyVerses} /></EditorialCard>}
        {!!item.structure?.length && <EditorialCard title={tt('Book Structure')} icon={<Layers />} wide>
          <ol className="prologue-structure">{item.structure.map((part, index) => <li key={index}><span className="prologue-range">{part.range}</span><p className="prologue-prose">{part.title}</p></li>)}</ol>
        </EditorialCard>}
      </div>
    </div>
  </section>;
}

function EditorialCard({ title, icon, wide, children }: { title: string; icon: ReactNode; wide?: boolean; children: ReactNode }) {
  return <section className={`prologue-note${wide ? ' prologue-note-wide' : ''}`}>
    <div className="prologue-note-heading"><span className="prologue-note-icon" aria-hidden="true">{icon}</span><h2>{title}</h2></div>
    {children}
  </section>;
}

function TextList({ items }: { items: string[] }) {
  return <ul className="prologue-text-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}
