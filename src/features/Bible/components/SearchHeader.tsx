import type { RefObject } from "react";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { Translation } from "@/services/bibleApi";
import type { Covenant } from "@/hooks/useSearch";
import SearchFilters from "./SearchFilters";

interface SearchHeaderProps {
  isRtl: boolean;
  inputRef: RefObject<HTMLInputElement>;
  query: string;
  onChange: (query: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack: () => void;
  translation: string | null;
  translations: Translation[];
  versionLabel: string;
  onTranslationChange: (id: string) => void;
  versionLoading: boolean;
  bookName?: string;
  books: string[];
  onBookChange: (book?: string) => void;
  covenant: Covenant;
  onCovenantChange: (covenant: Covenant) => void;
}

export function SearchHeader(props: SearchHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <button type="button" onClick={props.onBack} aria-label={tt("Back")} className="rounded-lg p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className={cn("h-5 w-5", props.isRtl && "rotate-180")} />
        </button>
        <h1 className="text-base font-bold text-foreground">{tt("Search the Bible")}</h1>
      </div>
      <div className="px-4 sm:px-6 pb-3 space-y-3">
        <form className="relative" role="search" onSubmit={event => { event.preventDefault(); props.onSubmit(); }}>
          <SearchIcon className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none", props.isRtl ? "right-3" : "left-3")} />
          <input ref={props.inputRef} value={props.query} onChange={event => props.onChange(event.target.value)}
            aria-label={tt("Search the Bible")} placeholder={tt("Search the Bible...")}
            dir={props.isRtl ? "rtl" : "ltr"}
            className="notranslate w-full h-11 px-10 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30" translate="no"
            autoCapitalize="none" autoCorrect="off" autoComplete="off" />
          {props.query.length > 0 && (
            <button type="button" onClick={props.onClear} aria-label={tt("Clear search")}
              className={cn("absolute top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted", props.isRtl ? "left-2.5" : "right-2.5")}>
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="search-bible-edition">{tt("Select Bible version")}</label>
          <select id="search-bible-edition" value={props.translation || ""} onChange={event => props.onTranslationChange(event.target.value)}
            disabled={props.versionLoading} title={props.versionLabel}
            className="notranslate h-9 max-w-full rounded-lg border border-border bg-background px-2 text-xs" translate="no">
            {!props.translation && <option value="">{props.versionLoading ? tt("Loading...") : tt("Select Bible version")}</option>}
            {props.translations.map(item => <option key={item.id} value={item.id}>{item.languageName ? `${item.languageName} · ` : ""}{item.name}</option>)}
          </select>
          <SearchFilters bookFilter={props.bookName || ""} onBookFilterChange={book => props.onBookChange(book || undefined)}
            books={props.books} covenant={props.covenant} onCovenantChange={props.onCovenantChange} />
        </div>
      </div>
    </header>
  );
}
