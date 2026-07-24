import React, { useState, useMemo } from "react";
import { BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./shared";
import { BIBLE_BOOKS_OT, BIBLE_BOOKS_NT } from "./constants";
import type { BookPrologue } from "@/services/bookProloguesApi";

// ── BookPrologueSection ───────────────────────────────────────────────────

export function BookPrologueSection({
  prologue,
  bookName,
}: {
  prologue: BookPrologue;
  bookName: string;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <button
      onClick={() => setExpanded((p) => !p)}
      className="w-full text-left"
    >
      <ResourceCard accentColor="#6366F1" className="!p-4 transition-all hover:bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">About {bookName}</p>
            <p className="text-[11px] text-muted-foreground">Book introduction & context</p>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180",
            )}
            strokeWidth={2}
          />
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            {prologue.summary && (
              <p className="text-sm text-foreground/70 leading-6">{prologue.summary}</p>
            )}

            <div className="w-full h-px bg-border" />

            <div className="flex flex-wrap gap-2">
              {prologue.author && (
                <div className="rounded-lg bg-muted/50 border border-border px-3 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Author</p>
                  <p className="text-sm font-bold text-foreground">{prologue.author}</p>
                </div>
              )}
              {prologue.audience && (
                <div className="rounded-lg bg-muted/50 border border-border px-3 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
                  <p className="text-sm font-bold text-foreground">{prologue.audience}</p>
                </div>
              )}
              {prologue.dateWritten && (
                <div className="rounded-lg bg-muted/50 border border-border px-3 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="text-sm font-bold text-foreground">{prologue.dateWritten}</p>
                </div>
              )}
              {prologue.locationWritten && (
                <div className="rounded-lg bg-muted/50 border border-border px-3 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                  <p className="text-sm font-bold text-foreground">{prologue.locationWritten}</p>
                </div>
              )}
            </div>

            {prologue.keyTheme && (
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  Key Theme
                </p>
                <p className="text-sm font-semibold text-foreground italic">{prologue.keyTheme}</p>
              </div>
            )}

            {prologue.purpose && (
              <div>
                <p className="text-sm font-bold text-foreground mb-1.5">Purpose</p>
                <p className="text-sm text-foreground/70 leading-6">{prologue.purpose}</p>
              </div>
            )}

            {prologue.mainThemes && prologue.mainThemes.length > 0 && (
              <div>
                <p className="text-sm font-bold text-foreground mb-2">Main Themes</p>
                <div className="flex flex-wrap gap-1.5">
                  {prologue.mainThemes.map((t, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {prologue.christConnection && (
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  Connection to Christ
                </p>
                <p className="text-sm text-foreground/70 leading-6">{prologue.christConnection}</p>
              </div>
            )}
          </div>
        )}
      </ResourceCard>
    </button>
  );
}

// ── AllBooksPrologueSection ───────────────────────────────────────────────

export function AllBooksPrologueSection({
  prologues,
  loading,
  loadingMore,
  hasNext,
  total,
  onLoadMore,
}: {
  prologues: BookPrologue[];
  loading: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  total: number;
  onLoadMore: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const prologueMap = useMemo(() => {
    const map: Record<string, BookPrologue> = {};
    for (const p of prologues) map[p.bookName] = p;
    return map;
  }, [prologues]);

  const renderBookCard = (bookName: string) => {
    const p = prologueMap[bookName];
    if (!p) return null;
    const isOt = BIBLE_BOOKS_OT.includes(bookName);
    const accentColor = isOt ? "#4F6EF7" : "#8B5CF6";
    const isExpanded = expandedBook === bookName;
    const previewText = p.keyTheme || p.summary || p.purpose;

    return (
      <button
        key={bookName}
        onClick={() => setExpandedBook(isExpanded ? null : bookName)}
        className="w-full text-left"
      >
        <ResourceCard accentColor={accentColor} className="!p-3.5 transition-all hover:bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}16` }}
            >
              <BookOpen className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{bookName}</p>
              {previewText && !isExpanded && (
                <p className="text-[11px] text-muted-foreground line-clamp-2">{previewText}</p>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
              strokeWidth={2}
            />
          </div>

          {isExpanded && p && (
            <div className="mt-3 space-y-2.5">
              <div className="w-full h-px bg-border/50" />
              {p.summary && (
                <p className="text-sm text-foreground/70 leading-6">{p.summary}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {p.author && (
                  <div className="rounded-md bg-muted/50 border border-border px-2.5 py-1">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Author</p>
                    <p className="text-xs font-bold text-foreground">{p.author}</p>
                  </div>
                )}
                {p.audience && (
                  <div className="rounded-md bg-muted/50 border border-border px-2.5 py-1">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
                    <p className="text-xs font-bold text-foreground">{p.audience}</p>
                  </div>
                )}
                {p.dateWritten && (
                  <div className="rounded-md bg-muted/50 border border-border px-2.5 py-1">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
                    <p className="text-xs font-bold text-foreground">{p.dateWritten}</p>
                  </div>
                )}
              </div>
              {p.keyTheme && (
                <div
                  className="rounded-lg p-2.5 border"
                  style={{ backgroundColor: `${accentColor}0D`, borderColor: `${accentColor}24` }}
                >
                  <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: accentColor }}>
                    Key Theme
                  </p>
                  <p className="text-sm font-semibold text-foreground italic mt-0.5">{p.keyTheme}</p>
                </div>
              )}
              {p.purpose && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-1">Purpose</p>
                  <p className="text-sm text-foreground/70 leading-6">{p.purpose}</p>
                </div>
              )}
              {p.mainThemes && p.mainThemes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-1.5">Main Themes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.mainThemes.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${accentColor}12`, borderColor: `${accentColor}26`, color: accentColor }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ResourceCard>
      </button>
    );
  };

  const renderCovenantSection = (books: string[], name: string, accentColor: string) => {
    const visible = books.filter((b) => prologueMap[b]);
    if (visible.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-xs font-extrabold text-foreground tracking-tight">{name}</span>
          <span className="text-[11px] font-semibold text-muted-foreground">{visible.length} books</span>
        </div>
        <div className="space-y-2">
          {visible.map((b) => renderBookCard(b))}
        </div>
      </div>
    );
  };

  const ntCount = BIBLE_BOOKS_NT.filter((b) => prologueMap[b]).length;

  if (loading && prologues.length === 0) {
    return (
      <div className="mb-6 px-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button onClick={() => setExpanded((p) => !p)} className="w-full text-left">
        <ResourceCard accentColor="#6366F1" className="transition-all hover:bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Book Prologue Library</p>
              <p className="text-[11px] text-muted-foreground">
                {prologues.length}{total ? ` of ${total}` : ""} book introductions
              </p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                expanded && "rotate-180",
              )}
              strokeWidth={2}
            />
          </div>
        </ResourceCard>
      </button>

      {expanded && (
        <div className="mt-2 px-1">
          {renderCovenantSection(BIBLE_BOOKS_OT, "Old Testament", "#4F6EF7")}
          {ntCount > 0 && (
            <div className="w-full h-px bg-border my-2" />
          )}
          {renderCovenantSection(BIBLE_BOOKS_NT, "New Testament", "#8B5CF6")}
          {(loadingMore || hasNext) && (
            <div className="flex items-center justify-center py-3">
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <button
                  onClick={onLoadMore}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Load more books
                  <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
