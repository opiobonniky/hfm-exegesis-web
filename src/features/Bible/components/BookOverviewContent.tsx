// BookOverviewContent — displays all prologue sections for a book
import { BookOpen, Info } from "lucide-react";
import type { BookPrologue } from "@/services/bookProloguesApi";

interface BookOverviewContentProps {
  bookName: string;
  prologue: BookPrologue;
  designation: string | null;
  testamentLabel: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-primary tracking-wide">{children}</h3>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <section className="space-y-1.5">
      <SectionLabel>{label}</SectionLabel>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
        {value}
      </p>
    </section>
  );
}

function BulletList({ label, items }: { label: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ScriptureList({ label, items }: { label: string; items?: Array<{ reference: string; text: string }> | null }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                {item.reference}
              </p>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StructureList({ label, items }: { label: string; items?: Array<{ range: string; title: string }> | null }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <div>
              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded me-1.5">
                {item.range}
              </span>
              <span className="text-foreground">{item.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BookOverviewContent({
  bookName,
  prologue,
  designation,
  testamentLabel,
}: BookOverviewContentProps) {
  return (
    <div className="pb-6">
      {/* Title hero section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent">
        <div className="px-4 sm:px-6 pt-8 pb-6 text-center space-y-3">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {bookName}
          </h1>
          {designation && (
            <p className="text-sm text-primary font-medium">{designation}</p>
          )}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
              {testamentLabel}
            </span>
            {prologue.chapters && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground border border-border">
                {prologue.chapters} Chapters
              </span>
            )}
          </div>
          {(prologue.author || prologue.authorDetail) && (
            <p className="text-xs text-muted-foreground">
              Written by <span className="font-medium text-foreground">{prologue.authorDetail || prologue.author}</span>
              {prologue.dateWritten && (
                <> · {prologue.dateWritten}</>
              )}
              {prologue.locationWritten && (
                <> · {prologue.locationWritten}</>
              )}
            </p>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      {/* Content sections */}
      <div className="px-4 sm:px-6 pt-6 space-y-6">
        <DetailBlock label="Overview" value={prologue.summary} />
        <DetailBlock label="Background and History" value={prologue.background} />
        <DetailBlock label="Author" value={prologue.authorDetail || prologue.author} />
        <DetailBlock label="Written To" value={prologue.audience} />
        <DetailBlock label="Purpose" value={prologue.purpose} />
        <DetailBlock
          label={`What Do We Learn From ${bookName}?`}
          value={prologue.lessons}
        />
        <BulletList label="Key Applications" items={prologue.applications} />
        <ScriptureList label="Key Scripture" items={prologue.keyScripture} />
        <StructureList label="Structure" items={prologue.structure} />
        <DetailBlock label="Key Theme" value={prologue.keyTheme} />
        <BulletList label="Main Themes" items={prologue.mainThemes} />
        <BulletList label="Key People" items={prologue.keyPeople} />
        <BulletList label="Key Verses" items={prologue.keyVerses} />
        <DetailBlock label="Connection to Christ" value={prologue.christConnection} />
      </div>
    </div>
  );
}
