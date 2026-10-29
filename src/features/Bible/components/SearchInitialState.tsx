import { BookOpen, Clock, Trash2, TrendingUp, X } from "lucide-react";
import { SUGGESTIONS } from "@/hooks/useSearch";
import { tt } from "@/components/languages/hardcodedTranslate";

interface SearchInitialStateProps {
  searchHistory: string[];
  popularSearches: { query: string }[];
  versionName: string;
  showSuggestions: boolean;
  onHistoryTap: (item: string) => void;
  onRemoveHistory: (item: string) => void;
  onClearHistory: () => void;
  onClearPopular: () => void;
  onPopularTap: (item: { query: string }) => void;
  onSuggestion: (suggestion: string) => void;
}
export default function SearchInitialState(props: SearchInitialStateProps) {
  return (
    <div className="pb-8">
      {props.searchHistory.length > 0 && (
        <section className="mb-6 px-4 sm:px-6" aria-label={tt("Recent Searches")}>
          <div className="flex items-center justify-between py-2">
            <h2 className="text-xs font-bold text-muted-foreground">{tt("Recent Searches")}</h2>
            <button type="button" onClick={props.onClearHistory} className="flex items-center gap-1 text-xs"><Trash2 className="h-3 w-3" />{tt("Clear history")}</button>
          </div>
          {props.searchHistory.map(item => (
            <div key={item} className="flex items-center gap-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <button type="button" onClick={() => props.onHistoryTap(item)} className="flex-1 truncate text-start text-sm">{item}</button>
              <button type="button" onClick={() => props.onRemoveHistory(item)} aria-label={`${tt("Remove search")}: ${item}`} className="rounded p-2 hover:bg-muted"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </section>
      )}
      {props.popularSearches.length > 0 && (
        <section className="mb-6 px-4 sm:px-6" aria-label={tt("Popular")}>
          <div className="flex items-center justify-between py-2">
            <h2 className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" />{tt("Popular")}</h2>
            <button type="button" onClick={props.onClearPopular} className="flex items-center gap-1 text-xs"><Trash2 className="h-3 w-3" />{tt("Clear popular searches")}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {props.popularSearches.slice(0, 8).map(item => <button type="button" key={item.query} onClick={() => props.onPopularTap(item)}
              className="rounded-full border border-primary/20 bg-muted/50 px-3 py-1.5 text-xs hover:bg-primary/10">{item.query}</button>)}
          </div>
        </section>
      )}
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <BookOpen className="mb-5 h-12 w-12 text-primary/60" />
        <h2 className="mb-1 text-base font-bold">{tt("Search the Bible")}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{tt("Find verses across all books and chapters")}</p>
        {props.versionName && <p className="notranslate mb-5 text-xs text-muted-foreground" translate="no">{tt("Searching in:")} {props.versionName}</p>}
        {props.showSuggestions && <div className="flex max-w-md flex-wrap justify-center gap-2">
          {SUGGESTIONS.map(suggestion => <button type="button" key={suggestion} onClick={() => props.onSuggestion(suggestion)}
            className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs hover:bg-muted">{suggestion}</button>)}
        </div>}
      </div>
    </div>
  );
}
