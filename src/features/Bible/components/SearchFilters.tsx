// Search filters — scope tabs, book picker, covenant filter
import { BookOpen, FileText, BookmarkCheck, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchScope } from "@/services/searchApi";

const SCOPES: SearchScope[] = ["bible", "strongs", "journal", "topics", "lemma"];
const SCOPE_LABELS: Record<SearchScope, string> = {
  bible: "Bible",
  strongs: "Strong's",
  journal: "Journal",
  topics: "Topics",
  lemma: "Lemma",
};
function ScopeIcon({ scope }: { scope: SearchScope }) {
  switch (scope) {
    case "bible": return <BookOpen className="w-3.5 h-3.5" />;
    case "strongs": return <Search className="w-3.5 h-3.5" />;
    case "journal": return <FileText className="w-3.5 h-3.5" />;
    case "topics": return <BookmarkCheck className="w-3.5 h-3.5" />;
    case "lemma": return <Search className="w-3.5 h-3.5" />;
  }
}
interface SearchFiltersProps {
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  bookFilter: string;
  onBookFilterChange: (book: string) => void;
  books: string[];
  covenant: string;
  onCovenantChange: (covenant: string) => void;
  locked?: boolean;
}
export default function SearchFilters({
  scope, onScopeChange, bookFilter, onBookFilterChange, books, covenant, onCovenantChange, locked,
}: SearchFiltersProps) {
  const filteredBooks = covenant === "ot" ? books.slice(0, 39)
    : covenant === "nt" ? books.slice(39)
    : books;
  return (
    <div className="space-y-3">
      {/* Scope tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl">
        {SCOPES.map((s) => (
          <button
            key={s}
            onClick={() => onScopeChange(s)}
            disabled={locked && (s === "topics" || s === "lemma")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center",
              scope === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              locked && (s === "topics" || s === "lemma") && "opacity-40 cursor-not-allowed",
            )}
          >
            <ScopeIcon scope={s} />
            <span className="hidden sm:inline">{SCOPE_LABELS[s]}</span>
          </button>
        ))}
      </div>
      {/* Book filter (bible scope only) */}
      {scope === "bible" && (
        <div className="flex items-center gap-2">
          {/* Covenant filter */}
          <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
            {["all", "ot", "nt"].map((c) => (
              <button
                key={c}
                onClick={() => onCovenantChange(c)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all uppercase",
                  covenant === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {c === "all" ? "All" : c === "ot" ? "OT" : "NT"}
              </button>
            ))}
          </div>
          {/* Book select */}
          <select
            value={bookFilter}
            onChange={(e) => onBookFilterChange(e.target.value)}
            className="flex-1 h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="">All Books</option>
            {filteredBooks.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
