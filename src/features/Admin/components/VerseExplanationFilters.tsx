// VerseExplanationFilters — searchable book/chapter/author filters for the list.
import { Search } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_BOOK_CHAPTERS } from "@/features/Bible/constants";
import { tt } from "@/components/languages/hardcodedTranslate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

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
  children?: ReactNode;
}) {
  const hasFilters = Boolean(bookName || chapter || creatorName || hasAdditionalFilters);
  const chapterCount =
    BIBLE_BOOK_CHAPTERS[bookName as keyof typeof BIBLE_BOOK_CHAPTERS] || 0;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-[200px] flex-1 space-y-1.5">
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

      <div className="w-40 space-y-1.5">
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
          placeholder={bookName ? tt("All chapters") : tt("Select a book first")}
          searchPlaceholder={tt("Search chapters...")}
          width="w-full"
        />
      </div>

      <label className="min-w-[220px] flex-1 space-y-1 text-xs text-muted-foreground">
        {searchLabel || tt("Created by / Updated by")}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={searchLabel || tt("Filter by creator or updater name")}
            type="text"
            value={creatorName}
            onChange={(event) => onCreatorNameChange(event.target.value)}
            placeholder={searchPlaceholder || tt("Search by name, e.g. John")}
            className="min-h-11 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </label>

      {children}
      {hasFilters && (
        <Button variant="ghost" type="button" onClick={onClear}>
          {tt("Clear filters")}
        </Button>
      )}
    </div>
  );
}
