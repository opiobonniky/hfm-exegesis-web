import { BookText, Globe, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  viewMode: string; setViewMode: (v: string) => void;
  showFilters: boolean; setShowFilters: (v: boolean) => void;
  hasActiveFilters: boolean;
}

export function JournalSegmentControl({ viewMode, setViewMode, showFilters, setShowFilters, hasActiveFilters }: Props) {
  return (
    <div className="border-b border-border/60 dark:border-stone-800/60 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("my")} className={cn("inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
            viewMode === "my" ? "bg-foreground/10 text-foreground border-border shadow-sm" : "bg-card dark:bg-stone-900 text-muted-foreground dark:text-muted-foreground/70 border-border dark:border-stone-800 hover:bg-muted dark:hover:bg-stone-800",
          )}><BookText className="w-3.5 h-3.5" />My Ledger</button>
          <button onClick={() => setViewMode("discover")} className={cn("inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
            viewMode === "discover" ? "bg-foreground/10 text-foreground border-border shadow-sm" : "bg-card dark:bg-stone-900 text-muted-foreground dark:text-muted-foreground/70 border-border dark:border-stone-800 hover:bg-muted dark:hover:bg-stone-800",
          )}><Globe className="w-3.5 h-3.5" />Community</button>
          <div className="flex-1" />
          <button onClick={() => setShowFilters(!showFilters)} className={cn("inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all",
            showFilters || hasActiveFilters ? "bg-foreground/10 text-foreground border-border" : "bg-card dark:bg-stone-900 text-muted-foreground dark:text-muted-foreground/70 border-border dark:border-stone-800 hover:bg-muted dark:hover:bg-stone-800",
          )}>
            <Filter className="w-3.5 h-3.5" />Filters{hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </button>
        </div>
      </div>
    </div>
  );
}
