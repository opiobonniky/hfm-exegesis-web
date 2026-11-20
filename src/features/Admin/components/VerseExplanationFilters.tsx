// VerseExplanationFilters — book/chapter/author filters for the explanation list.
import { Search } from "lucide-react";
import { BIBLE_BOOKS } from "@/data/staticData";
import { tt } from "@/components/languages/hardcodedTranslate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function VerseExplanationFilters({
  bookName,
  chapter,
  creatorName,
  onBookChange,
  onChapterChange,
  onCreatorNameChange,
  onClear,
}: {
  bookName: string;
  chapter: string;
  creatorName: string;
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onCreatorNameChange: (value: string) => void;
  onClear: () => void;
}) {
  const hasFilters = Boolean(bookName || chapter || creatorName);
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3">
      <label className="min-w-[180px] flex-1 space-y-1 text-xs text-muted-foreground">
        {tt("Book")}
        <select
          aria-label={tt("Filter by book")}
          value={bookName}
          onChange={(event) => onBookChange(event.target.value)}
          className={fieldClass}
        >
          <option value="">{tt("All books")}</option>
          {BIBLE_BOOKS.map((book) => (
            <option key={book} value={book}>
              {tt(book)}
            </option>
          ))}
        </select>
      </label>

      <label className="w-32 space-y-1 text-xs text-muted-foreground">
        {tt("Chapter")}
        <Input
          aria-label={tt("Filter by chapter")}
          type="number"
          min="1"
          value={chapter}
          onChange={(event) => onChapterChange(event.target.value)}
          placeholder={tt("All")}
          className={fieldClass}
        />
      </label>

      <label className="min-w-[220px] flex-1 space-y-1 text-xs text-muted-foreground">
        {tt("Created by / Updated by")}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={tt("Filter by creator or updater name")}
            type="text"
            value={creatorName}
            onChange={(event) => onCreatorNameChange(event.target.value)}
            placeholder={tt("Search by name, e.g. John")}
            className={`${fieldClass} pl-9`}
          />
        </div>
      </label>

      {hasFilters && (
        <Button variant="ghost" type="button" onClick={onClear}>
          {tt("Clear filters")}
        </Button>
      )}
    </div>
  );
}
