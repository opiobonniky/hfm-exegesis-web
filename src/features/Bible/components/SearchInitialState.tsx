// Search initial state — history, popular searches, suggestions
import { Clock, Trash2, TrendingUp, Search, X } from "lucide-react";
import { SUGGESTIONS, type SearchScope } from "@/hooks/useSearch";

interface SearchInitialStateProps {
  scope: SearchScope;
  searchHistory: string[];
  popularSearches: { query: string; scope: SearchScope }[];
  onHistoryTap: (item: string) => void;
  onRemoveHistory: (item: string) => void;
  onClearHistory: () => void;
  onPopularTap: (item: { query: string; scope: SearchScope }) => void;
  onSuggestion: (suggestion: string) => void;
}

export default function SearchInitialState({
  scope, searchHistory, popularSearches,
  onHistoryTap, onRemoveHistory, onClearHistory, onPopularTap, onSuggestion,
}: SearchInitialStateProps) {
  return (
    <div className="pb-8">
      {/* History */}
      {searchHistory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent Searches</p>
            </div>
            <button onClick={onClearHistory} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          {searchHistory.map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 sm:px-6 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors rounded-lg mx-2"
              onClick={() => onHistoryTap(item)}>
              <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              <span className="text-sm text-foreground/80 flex-1 truncate">{item}</span>
              <button onClick={(e) => { e.stopPropagation(); onRemoveHistory(item); }}
                className="p-1 text-muted-foreground hover:text-foreground opacity-0 hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="h-px bg-border/30 mx-4 sm:mx-6 my-3" />
        </div>
      )}
      {/* Popular */}
      {popularSearches.filter((p) => p.scope === scope).length > 0 && (
        <div className="mb-6 px-4 sm:px-6">
          <div className="flex items-center gap-2 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Popular</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.filter((p) => p.scope === scope).slice(0, 8).map((p) => (
              <button key={p.query} onClick={() => onPopularTap(p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/50 border border-primary/20 hover:bg-primary/10 text-foreground transition-colors">
                <TrendingUp className="w-3 h-3 text-primary" />{p.query}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Suggestions */}
      <div className="flex flex-col items-center py-10 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 ring-1 ring-primary/5">
          <Search className="w-7 h-7 text-primary/60" />
        </div>
        <p className="text-base font-bold text-foreground mb-1">
          {scope === "bible" ? "Search the Bible" : scope === "journal" ? "Search Your Journal" : scope === "topics" ? "Explore Bible topics" : "Search Greek/Hebrew lemmas"}
        </p>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          {scope === "bible" ? "Find verses across all books and chapters" : scope === "journal" ? "Find reflections, prayers, and notes" : "Explore topics and themes"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {SUGGESTIONS[scope].map((s) => (
            <button key={s} onClick={() => onSuggestion(s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/50 border border-border hover:bg-muted transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
