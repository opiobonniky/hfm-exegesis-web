import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Book,
  Tags,
  Copy,
  Check,
  Languages,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ResourceCard, EmptyState } from "./shared";
import { ExpandableText } from "./ExpandableText";
import type { CommentaryEntry, DictionaryEntry, TranslationComparisonEntry } from "@/services/verseResourcesApi";

// ── Helpers ───────────────────────────────────────────────────────────────

function parsePassageRef(ref: string) {
  const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;
  return {
    bookName: match[1].trim(),
    chapter: Number(match[2]),
    verse: match[3] ? Number(match[3]) : 1,
  };
}

// ── CommentariesView ──────────────────────────────────────────────────────

export function CommentariesView({
  data,
  verseRef,
}: {
  data: CommentaryEntry[];
  verseRef: string;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <EmptyState title="No Commentaries" description="No commentaries available for this verse." />;
  }

  const copyCommentary = async (text: string, author: string, title: string, idx: number) => {
    const attribution = `${text}\n\n— ${author}, ${title} (commentary on ${verseRef})`;
    try {
      await navigator.clipboard.writeText(attribution);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="space-y-2.5">
      {data.map((c, i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-extrabold">{c.author.charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{c.author}</p>
                {c.title && (
                  <p className="text-[11px] text-muted-foreground italic truncate">{c.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => copyCommentary(c.text, c.author, c.title, i)}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-muted text-muted-foreground/60 hover:text-foreground"
              title="Copy with attribution"
            >
              {copiedIdx === i ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="w-full h-px bg-border/50 my-2" />
          <p className="text-sm text-foreground/80 leading-6">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── CrossReferencesView ───────────────────────────────────────────────────

export function CrossReferencesView({
  data,
}: {
  data: Array<{ ref: string; text: string }>;
}) {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return <EmptyState title="No Cross References" description="No cross-references available for this verse." />;
  }

  return (
    <div className="space-y-2.5">
      {data.map((cr, i) => {
        const parsed = parsePassageRef(cr.ref);
        return (
          <button
            key={i}
            onClick={() => {
              if (parsed) {
                navigate(`/bible-reader?book=${encodeURIComponent(parsed.bookName)}&chapter=${parsed.chapter}&verse=${parsed.verse}`);
              }
            }}
            disabled={!parsed}
            className={cn(
              "w-full text-left rounded-xl bg-card border border-border p-4 border-l-4 border-l-sky-500 transition-all",
              parsed
                ? "cursor-pointer hover:bg-muted active:scale-[0.99]"
                : "cursor-default opacity-80",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1 flex items-center gap-1.5">
                  {cr.ref}
                  {parsed && <ExternalLink className="w-3 h-3 opacity-50" />}
                </p>
                <p className="text-sm text-foreground/70 leading-6 line-clamp-3">{cr.text}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── WordStudiesView ───────────────────────────────────────────────────────

export function WordStudiesView({
  data,
}: {
  data: Array<{ word: string; transliteration: string; meaning: string; strongs?: string }>;
}) {
  if (!data || data.length === 0) {
    return <EmptyState title="No Word Studies" description="No word studies available for this verse." />;
  }

  return (
    <div className="space-y-2.5">
      {data.map((ws, i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">
                {ws.word.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{ws.word}</p>
              <p className="text-[11px] text-muted-foreground">
                {ws.transliteration}
                {ws.strongs ? `  ·  ${ws.strongs}` : ""}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/70 leading-6">{ws.meaning}</p>
        </div>
      ))}
    </div>
  );
}

// ── DictionaryView ────────────────────────────────────────────────────────

export function DictionaryView({
  data,
}: {
  data: DictionaryEntry[];
}) {
  if (!data || data.length === 0) {
    return <EmptyState title="No Dictionary Entries" description="No dictionary entries available." />;
  }

  return (
    <div className="space-y-2.5">
      {data.map((entry, i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Book className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{entry.term}</p>
              {entry.pronunciation && (
                <p className="text-[11px] italic text-muted-foreground">/{entry.pronunciation}/</p>
              )}
            </div>
          </div>
          <div className="w-full h-px bg-border/50 mb-2" />
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">{entry.definition}</p>
          <ExpandableText
            text={entry.description}
            initialLines={4}
            expandLabel="Read more"
            closeLabel="Close"
          />
        </div>
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Translations"
        description={error || "No translation comparison data available for this verse."}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {data.map((t, i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2.5 mb-3">
            <Badge
              variant="outline"
              className="text-[10px] font-black px-1.5 py-0.5 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0"
            >
              {t.abbreviation}
            </Badge>
            <span className="text-[11px] font-semibold text-muted-foreground">{t.version}</span>
          </div>
          <div className="w-full h-px bg-border/50 mb-2" />
          <p className="text-sm text-foreground/70 leading-6 italic">&ldquo;{t.text}&rdquo;</p>
        </div>
      ))}
    </div>
  );
}

// ── InterlinearView ───────────────────────────────────────────────────────

export function InterlinearView({
  data,
}: {
  data: Array<{ original?: string; strongs?: string; transliteration?: string; translation?: string }>;
}) {
  if (!data || data.length === 0) {
    return <EmptyState title="No Interlinear Data" description="No interlinear data available for this verse." />;
  }

  return (
    <ResourceCard accentColor="#EC4899" className="!p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-pink-500/20">
              <th className="text-left px-3 py-2.5 font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider text-[10px] w-[30%]">
                Original
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] w-[18%]">
                Strong's
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] w-[22%]">
                Translit.
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] w-[30%]">
                English
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((w, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border/20 last:border-0 transition-colors hover:bg-muted/30",
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                )}
              >
                <td className="px-3 py-2 font-semibold text-foreground w-[30%]" dir={w.original ? "rtl" : "ltr"}>
                  {w.original || "—"}
                </td>
                <td className="px-3 py-2 w-[18%]">
                  {w.strongs ? (
                    <span className="text-pink-600 dark:text-pink-400 font-bold text-[10px] font-mono">
                      {w.strongs}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground italic w-[22%]">{w.transliteration || "—"}</td>
                <td className="px-3 py-2 text-foreground/70 w-[30%]">{w.translation || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResourceCard>
  );
}

// ── TopicsView ────────────────────────────────────────────────────────────

export function TopicsView({
  data,
}: {
  data: Array<{ name: string }>;
}) {
  if (!data || data.length === 0) {
    return <EmptyState title="No Related Topics" description="No related topics available for this verse." />;
  }

  return (
    <ResourceCard accentColor="#6366F1">
      <div className="flex flex-wrap gap-2">
        {data.map((topic, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
            style={{
              backgroundColor: "#6366F114",
              borderColor: "#6366F128",
            }}
          >
            <Tags className="w-3 h-3 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {topic.name}
            </span>
          </div>
        ))}
      </div>
    </ResourceCard>
  );
}
