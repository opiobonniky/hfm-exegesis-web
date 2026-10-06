// BookOverviewContent — displays all prologue sections for a book
import { BookOpen, CalendarDays, MapPin, PenLine } from "lucide-react";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { tt } from '@/components/languages/hardcodedTranslate';

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
    <div className="mx-auto w-full max-w-3xl pb-6">
      {/* Title hero section */}
      <section className="relative isolate overflow-hidden border-b border-border/70 bg-card">
        <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative px-5 py-9 text-center sm:px-8 sm:py-12">
          <div className="mx-auto mb-5 flex size-14 rotate-3 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm sm:size-16">
            <BookOpen className="size-7 -rotate-3 text-primary sm:size-8" aria-hidden="true" />
          </div>

          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary/30" aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              {tt("Book overview")}
            </p>
            <span className="h-px w-8 bg-primary/30" aria-hidden="true" />
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl">
            {bookName}
          </h1>

          {designation && (
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              {designation}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {testamentLabel}
            </span>
            {prologue.chapters && (
              <span className="inline-flex items-center rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
                {prologue.chapters} {tt("Chapters")}
              </span>
            )}
          </div>

          {(prologue.author || prologue.authorDetail) && (
            <div className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/70 pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <PenLine className="size-3.5 text-primary/70" aria-hidden="true" />
                {tt("Written by")}{" "}
                <span className="font-semibold text-foreground">
                  {prologue.author || prologue.authorDetail}
                </span>
              </span>
              {prologue.dateWritten && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-primary/70" aria-hidden="true" />
                  {prologue.dateWritten}
                </span>
              )}
              {prologue.locationWritten && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary/70" aria-hidden="true" />
                  {prologue.locationWritten}
                </span>
              )}
            </div>
          )}
        </div>
      </section>
      {/* Content sections */}
      <div className="px-4 sm:px-6 pt-6 space-y-6">
        <DetailBlock label={tt("Overview")} value={prologue.summary} />
        <DetailBlock label={tt("Background and History")} value={prologue.background} />
        <DetailBlock label={tt("Author")} value={prologue.authorDetail || prologue.author} />
        <DetailBlock label={tt("Written To")} value={prologue.audience} />
        <DetailBlock label={tt("Purpose")} value={prologue.purpose} />
        <DetailBlock
          label={`What Do We Learn From ${bookName}?`}
          value={prologue.lessons}
        />
        <BulletList label={tt("Key Applications")} items={prologue.applications} />
        <ScriptureList label={tt("Key Scripture")} items={prologue.keyScripture} />
        <StructureList label={tt("Structure")} items={prologue.structure} />
        <DetailBlock label={tt("Key Theme")} value={prologue.keyTheme} />
        <BulletList label={tt("Main Themes")} items={prologue.mainThemes} />
        <BulletList label={tt("Key People")} items={prologue.keyPeople} />
        <BulletList label={tt("Key Verses")} items={prologue.keyVerses} />
        <DetailBlock label={tt("Connection to Christ")} value={prologue.christConnection} />
      </div>
    </div>
  );
}
