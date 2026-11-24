// VerseExplanationFilters — searchable book/chapter/author filters for the list.
import { ArrowDownNarrowWide, Search, SlidersHorizontal, X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_BOOK_CHAPTERS } from "@/features/Bible/constants";
import { tt } from "@/components/languages/hardcodedTranslate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function VerseExplanationFilters({
  bookName,
  chapter,
  creatorName,
  onBookChange,
  onChapterChange,
  onCreatorNameChange,
  onClear,
  searchLabel,
  searchPlaceholder,
  hasAdditionalFilters = false,
  search,
  children,
}: {
  bookName: string;
  chapter: string;
  creatorName: string;
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onCreatorNameChange: (value: string) => void;
  onClear: () => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  hasAdditionalFilters?: boolean;
  search?: { value: string; onChange: (value: string) => void };
  children?: ReactNode;
}) {
  const hasFilters = Boolean(bookName || chapter || creatorName || hasAdditionalFilters || search?.value);
  const chapterCount =
    BIBLE_BOOK_CHAPTERS[bookName as keyof typeof BIBLE_BOOK_CHAPTERS] || 0;

  return (
    <section aria-label={tt("Filters")} className="rounded-xl border border-border bg-card p-3 sm:p-4">
      {search && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
            {tt("Search and filters")}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <ArrowDownNarrowWide className="h-3.5 w-3.5" aria-hidden="true" />
              {tt("Latest activity first")}
            </span>
            {hasFilters && <Button variant="ghost" type="button" size="sm" onClick={onClear} className="gap-1.5">
              <X className="h-4 w-4" aria-hidden="true" />
              {tt("Clear filters")}
            </Button>}
          </div>
        </div>
      )}
      <div className={cn("items-end gap-3", search
        ? "grid grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.65fr)_minmax(0,1fr)]"
        : "flex flex-wrap")}>
      {search && (
        <label className="col-span-2 block min-w-0 space-y-1.5 text-xs font-medium text-muted-foreground lg:col-span-1">
          <span>{tt("Search explanations")}</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
            <Input type="search" value={search.value} onChange={event => search.onChange(event.target.value)}
              placeholder={tt("Search by book, text, or name")} className="h-10 bg-background ps-9" />
          </span>
        </label>
      )}
      <div className={cn("space-y-1.5", search ? "min-w-0" : "min-w-[200px] flex-1")}>
        <div className="text-xs font-medium text-muted-foreground">{tt("Book")}</div>
        <Combobox
          ariaLabel={tt("Filter by book")}
          value={bookName}
          onChange={onBookChange}
          options={Object.keys(BIBLE_BOOK_CHAPTERS).map((book) => ({
            value: book,
            label: tt(book),
          }))}
          placeholder={tt("All books")}
          searchPlaceholder={tt("Search books...")}
          width="w-full"
        />
      </div>

      <div className={cn("space-y-1.5", search ? "min-w-0" : "w-40")}>
        <div className="text-xs font-medium text-muted-foreground">{tt("Chapter")}</div>
        <Combobox
          ariaLabel={tt("Filter by chapter")}
          value={chapter}
          onChange={onChapterChange}
          disabled={!bookName}
          options={Array.from({ length: chapterCount }, (_, index) => ({
            value: String(index + 1),
            label: String(index + 1),
          }))}
          placeholder={bookName ? tt("All chapters") : tt("Select Book")}
          searchPlaceholder={tt("Search chapters...")}
          width="w-full"
        />
      </div>

      <label className={cn("block space-y-1.5 text-xs font-medium text-muted-foreground",
        search ? "col-span-2 min-w-0 lg:col-span-1" : "min-w-[220px] flex-1")}>
        {searchLabel || tt("Created by / Updated by")}
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label={searchLabel || tt("creator or updater name")}
            type="text"
            value={creatorName}
            onChange={(event) => onCreatorNameChange(event.target.value)}
            placeholder={searchPlaceholder || tt("Search by name, e.g. John")}
            className="h-10 w-full bg-background ps-9 mt-1"
          />
        </div>
      </label>

      {children}
      {!search && hasFilters && (
        <Button variant="ghost" type="button" onClick={onClear}>
          {tt("Clear filters")}
        </Button>
      )}
      </div>
    </section>
  );
}
