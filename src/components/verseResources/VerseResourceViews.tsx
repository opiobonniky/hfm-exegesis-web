import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Book,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  Quote,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ResourceCard, SectionLabel } from "./shared";
import { ExpandableText } from "./ExpandableText";
import type {
  CommentaryEntry,
  DictionaryEntry,
  ExplanationSection,
  InterlinearWord,
  TranslationComparisonEntry,
  VerseReferenceEntry,
  WordStudyEntry,
} from "@/services/verseResourcesApi";
import type { Crossref } from "@/services/verseResourcesApi";

// ── Helpers ───────────────────────────────────────────────────────────────

function parsePassageRef(ref: string) {
  const match = ref?.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;
  return {
    bookName: match[1].trim(),
    chapter: Number(match[2]),
    verse: match[3] ? Number(match[3]) : 1,
  };
}

function readerUrl(bookName: string, chapter: number, verse: number) {
  return `/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verse}`;
}

/** Small copy-to-clipboard button used across views. */
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard unavailable
        }
      }}
      title={label || "Copy"}
      aria-label={label || "Copy"}
      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function Prose({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <p className="text-sm leading-7 text-foreground/80 whitespace-pre-line">{text}</p>
  );
}

// ── ExplanationView ───────────────────────────────────────────────────────

export function ExplanationView({ data }: { data: ExplanationSection }) {
  const hasBackground = Boolean(
    data.backgroundAuthor || data.backgroundBook || data.backgroundContext,
  );

  return (
    <div className="space-y-4">
      {data.explanation && (
        <ResourceCard accentColor="#4F6EF7">
          <SectionLabel icon={<Lightbulb />} label="What it means" color="#4F6EF7" />
          <Prose text={data.explanation} />
        </ResourceCard>
      )}

      {data.application && (
        <ResourceCard accentColor="#10B981">
          <SectionLabel icon={<Sparkles />} label="How to live it" color="#10B981" />
          <Prose text={data.application} />
        </ResourceCard>
      )}

      {hasBackground && (
        <ResourceCard accentColor="#F59E0B">
          <SectionLabel icon={<BookOpen />} label="Background" color="#F59E0B" />
          <dl className="space-y-2.5">
            {[
              ["Author", data.backgroundAuthor],
              ["Book", data.backgroundBook],
              ["Context", data.backgroundContext],
            ]
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-6 text-foreground/80">{value}</dd>
                </div>
              ))}
          </dl>
        </ResourceCard>
      )}

      {data.takeaways.length > 0 && (
        <ResourceCard accentColor="#8B5CF6">
          <SectionLabel
            icon={<ListChecks />}
            label="Key Takeaways"
            color="#8B5CF6"
            count={data.takeaways.length}
          />
          <ul className="space-y-2">
            {data.takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                <span className="text-sm leading-6 text-foreground/80">{takeaway}</span>
              </li>
            ))}
          </ul>
        </ResourceCard>
      )}

      {data.practicalApplications.length > 0 && (
        <ResourceCard accentColor="#0EA5E9">
          <SectionLabel
            icon={<ListChecks />}
            label="Practical Applications"
            color="#0EA5E9"
            count={data.practicalApplications.length}
          />
          <ol className="space-y-2">
            {data.practicalApplications.map((application, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-foreground/80">{application}</span>
              </li>
            ))}
          </ol>
        </ResourceCard>
      )}

      {(data.introduction || data.finalThoughts) && (
        <ResourceCard accentColor="#6366F1">
          <SectionLabel icon={<Quote />} label="Further Reflection" color="#6366F1" />
          <div className="space-y-3">
            {data.introduction && <Prose text={data.introduction} />}
            {data.finalThoughts && (
              <p className="text-sm leading-6 italic text-muted-foreground">
                {data.finalThoughts}
              </p>
            )}
          </div>
        </ResourceCard>
      )}
    </div>
  );
}

// ── CommentariesView ──────────────────────────────────────────────────────

export function CommentariesView({
  data,
  verseRef,
}: {
  data: CommentaryEntry[];
  verseRef: string;
}) {
  return (
    <div className="space-y-3">
      {data.map((commentary, index) => (
        <ResourceCard key={index} accentColor="#2563EB">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
              {commentary.author.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight text-foreground">
                {commentary.author}
              </p>
              {commentary.title && (
                <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                  {commentary.title}
                </p>
              )}
            </div>
            <CopyButton
              text={`${commentary.text}\n\n— ${commentary.author}, ${commentary.title} (on ${verseRef})`}
              label="Copy with attribution"
            />
          </div>
          <div className="my-3 h-px w-full bg-border/50" />
          <ExpandableText text={commentary.text} initialLines={6} />
        </ResourceCard>
      ))}
    </div>
  );
}

// ── CrossReferencesView ───────────────────────────────────────────────────

export function CrossReferencesView({ data }: { data: Crossref[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {data.map((reference, index) => {
        const parsed =
          reference.bookName && reference.chapter
            ? {
                bookName: reference.bookName,
                chapter: reference.chapter,
                verse: reference.verse || 1,
              }
            : parsePassageRef(reference.ref);
        const label =
          reference.ref ||
          (parsed ? `${parsed.bookName} ${parsed.chapter}:${parsed.verse}` : "");
        const context = reference.contextVerses ?? [];
        const open = () =>
          parsed && navigate(readerUrl(parsed.bookName, parsed.chapter, parsed.verse));

        return (
          <div
            key={index}
            className="rounded-xl border border-border border-l-4 border-l-sky-500 bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                {index + 1}
              </span>
              <button
                onClick={open}
                disabled={!parsed}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400",
                  parsed && "hover:underline",
                )}
              >
                <span className="truncate">{label}</span>
                {parsed && <ExternalLink className="size-3 shrink-0 opacity-60" />}
              </button>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <CopyButton
                  text={
                    context.length > 0
                      ? `${label}\n\n${context
                          .map((entry) => `${entry.verse} ${entry.text}`)
                          .join("\n")}`
                      : `${label}\n\n${reference.verseText || reference.text}`
                  }
                  label={`Copy ${label}`}
                />
                {parsed && (
                  <button
                    onClick={open}
                    title={`Open ${label} in the reader`}
                    aria-label={`Open ${label} in the reader`}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className="size-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* The referenced verse shown inside its surrounding passage, so
                the connection can be read in context rather than isolated. */}
            {context.length > 0 ? (
              <div className="mt-3 space-y-1">
                {context.map((entry) => (
                  <div
                    key={entry.verse}
                    className={cn(
                      "flex items-start gap-2 rounded-lg px-2 py-1.5",
                      entry.isFocus
                        ? "border-l-2 border-sky-500 bg-sky-500/5"
                        : "opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px w-4 shrink-0 text-right font-mono text-[10px] tabular-nums",
                        entry.isFocus
                          ? "font-bold text-sky-600 dark:text-sky-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {entry.verse}
                    </span>
                    <p
                      className={cn(
                        "font-serif leading-6",
                        entry.isFocus
                          ? "text-[13.5px] font-medium text-foreground"
                          : "text-xs text-muted-foreground",
                      )}
                    >
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              (reference.verseText || reference.text) && (
                <p className="mt-3 border-l-2 border-sky-500/30 pl-3 font-serif text-sm leading-6 italic text-foreground/75">
                  &ldquo;{reference.verseText || reference.text}&rdquo;
                </p>
              )
            )}

            {reference.commentary && (
              <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {reference.commentary}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── WordStudiesView ───────────────────────────────────────────────────────

export function WordStudiesView({ data }: { data: WordStudyEntry[] }) {
  return (
    <div className="space-y-3">
      {data.map((study, index) => (
        <ResourceCard key={index} accentColor="#8B5CF6">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {study.originalWord && (
              <span className="font-serif text-xl font-bold text-foreground" dir="auto">
                {study.originalWord}
              </span>
            )}
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
              {study.transliteration || study.word}
            </span>
            {study.strongs && (
              <Badge
                variant="outline"
                className="border-violet-500/25 bg-violet-500/10 text-[9px] font-bold font-mono text-violet-600 dark:text-violet-400"
              >
                {study.strongs}
              </Badge>
            )}
            {study.partOfSpeech && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {study.partOfSpeech}
              </span>
            )}
          </div>

          {study.definition && (
            <p className="mt-2 text-sm font-semibold text-foreground">{study.definition}</p>
          )}

          {study.meaning && (
            <p className="mt-2 text-sm leading-6 text-foreground/75">{study.meaning}</p>
          )}

          {study.fullDefinition && study.fullDefinition !== study.definition && (
            <ExpandableText
              text={study.fullDefinition}
              initialLines={5}
              expandLabel="Full definition"
            />
          )}
        </ResourceCard>
      ))}
    </div>
  );
}

// ── DictionaryView ────────────────────────────────────────────────────────

export function DictionaryView({ data }: { data: DictionaryEntry[] }) {
  return (
    <div className="space-y-3">
      {data.map((entry, index) => (
        <ResourceCard key={index} accentColor="#10B981">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Book className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{entry.term}</p>
              {entry.pronunciation && (
                <p className="text-[11px] italic text-muted-foreground">/{entry.pronunciation}/</p>
              )}
            </div>
          </div>
          <div className="my-3 h-px w-full bg-border/50" />
          {entry.definition && (
            <p className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {entry.definition}
            </p>
          )}
          <ExpandableText text={entry.description} initialLines={4} />
        </ResourceCard>
      ))}
    </div>
  );
}

// ── TranslationComparisonView ─────────────────────────────────────────────

export function TranslationComparisonView({
  data,
  loading,
  error,
}: {
  data: TranslationComparisonEntry[] | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <Languages className="mx-auto mb-2 size-6 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">No translations</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error || "No translation comparison data available for this verse."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((translation, index) => (
        <ResourceCard key={index} accentColor="#F59E0B">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className="shrink-0 border-amber-500/20 bg-amber-500/10 text-[10px] font-black text-amber-600 dark:text-amber-400"
            >
              {translation.abbreviation}
            </Badge>
            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-muted-foreground">
              {translation.version}
            </span>
            <CopyButton text={translation.text} label={`Copy ${translation.abbreviation}`} />
          </div>
          <div className="my-3 h-px w-full bg-border/50" />
          <p className="font-serif text-sm leading-6 text-foreground/80 italic">
            &ldquo;{translation.text}&rdquo;
          </p>
        </ResourceCard>
      ))}
    </div>
  );
}

// ── InterlinearView ───────────────────────────────────────────────────────

export function InterlinearView({ data }: { data: InterlinearWord[] }) {
  return (
    <ResourceCard accentColor="#EC4899" className="!overflow-hidden !p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-pink-500/20">
              <th className="w-[28%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Original
              </th>
              <th className="w-[18%] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Strong&apos;s
              </th>
              <th className="w-[22%] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Translit.
              </th>
              <th className="w-[32%] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                English
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((word, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-border/20 transition-colors last:border-0 hover:bg-muted/30",
                  index % 2 === 1 && "bg-muted/10",
                )}
              >
                <td className="px-3 py-2 font-semibold text-foreground" dir="auto">
                  {word.original || "—"}
                </td>
                <td className="px-3 py-2">
                  {word.strongs ? (
                    <span className="font-mono text-[10px] font-bold text-pink-600 dark:text-pink-400">
                      {word.strongs}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-3 py-2 italic text-muted-foreground">
                  {word.transliteration || "—"}
                </td>
                <td className="px-3 py-2 text-foreground/70">
                  {word.translation || "—"}
                  {word.grammar && (
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground/70">
                      {word.grammar}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResourceCard>
  );
}

// ── TopicsView ────────────────────────────────────────────────────────────

export function TopicsView({ data }: { data: string[] }) {
  return (
    <ResourceCard accentColor="#6366F1">
      <div className="flex flex-wrap gap-2">
        {data.map((topic, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400"
          >
            {topic}
          </span>
        ))}
      </div>
    </ResourceCard>
  );
}

// ── VerseReferencesView ───────────────────────────────────────────────────

export function VerseReferencesView({ data }: { data: VerseReferenceEntry[] }) {
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const map = new Map<string, { word: VerseReferenceEntry; refs: VerseReferenceEntry[] }>();
    for (const entry of data) {
      const key = entry.strongs || entry.transliteration || "unknown";
      if (!map.has(key)) map.set(key, { word: entry, refs: [] });
      map.get(key)!.refs.push(entry);
    }
    return [...map.values()];
  }, [data]);

  return (
    <div className="space-y-3">
      {groups.map(({ word, refs }, index) => (
        <ResourceCard key={index} accentColor="#14B8A6">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {word.originalWord && (
              <span className="font-serif text-lg font-bold text-foreground" dir="auto">
                {word.originalWord}
              </span>
            )}
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
              {word.transliteration || word.surfaceText}
            </span>
            {word.strongs && (
              <Badge
                variant="outline"
                className="border-teal-500/25 bg-teal-500/10 text-[9px] font-bold font-mono text-teal-600 dark:text-teal-400"
              >
                {word.strongs}
              </Badge>
            )}
            <span className="ml-auto text-[10px] font-bold tabular-nums text-muted-foreground">
              {refs.length} verse{refs.length === 1 ? "" : "s"}
            </span>
          </div>

          {word.definition && (
            <p className="mt-1.5 text-xs text-muted-foreground">{word.definition}</p>
          )}

          <div className="mt-3 space-y-1">
            {refs.slice(0, 12).map((entry, refIndex) => (
              <button
                key={refIndex}
                onClick={() => navigate(readerUrl(entry.bookName, entry.chapter, entry.verse))}
                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
              >
                <span className="shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400">
                  {entry.bookName} {entry.chapter}:{entry.verse}
                </span>
                {entry.surfaceText && (
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {entry.surfaceText}
                  </span>
                )}
                <ChevronRight className="mt-0.5 size-3 shrink-0 text-muted-foreground/50" />
              </button>
            ))}
            {refs.length > 12 && (
              <p className="px-2 pt-1 text-[11px] font-semibold text-muted-foreground">
                +{refs.length - 12} more occurrences
              </p>
            )}
          </div>
        </ResourceCard>
      ))}
    </div>
  );
}
