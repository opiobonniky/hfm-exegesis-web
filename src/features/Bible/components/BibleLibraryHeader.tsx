/**
 * BibleLibraryHeader — sticky header for BibleLibrary with search and tab filters.
 */
import { ReactNode, RefObject } from "react";
import { BookOpen, Search, X, Library, Scroll, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BibleLibraryHeaderProps {
  stats: { chapters: number; verses: number };
  searchRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  clearSearch: () => void;
  tabs: Array<{ value: string; label: string; count: number }>;
  covenant: string;
  selectCovenant: (v: string) => void;
}

const tabIcons: Record<string, React.ElementType> = { all: Library, ot: Scroll, nt: Bookmark };

export function BibleLibraryHeader({
  stats, searchRef, searchQuery, setSearchQuery, clearSearch, tabs, covenant, selectCovenant,
}: BibleLibraryHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-background via-background/98 to-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 flex items-center justify-center border border-indigo-500/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-card" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>The Bible</h1>
            <p className="text-[11px] text-muted-foreground/70 tracking-wider mt-0.5">
              <span className="text-indigo-500 font-semibold">66 books</span> · <span className="text-amber-500 font-semibold">{stats.chapters} chapters</span>
              {stats.verses > 0 && <> · <span className="font-semibold">{stats.verses.toLocaleString()} verses</span></>}
            </p>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <Input ref={searchRef} placeholder="Search books..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 text-sm bg-muted/40 border-border/40 rounded-xl" />
          {searchQuery && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/30">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab.value] || Library;
            return (
              <button key={tab.value} onClick={() => selectCovenant(tab.value)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all",
                  covenant === tab.value ? "bg-background text-foreground shadow-sm border border-border/40" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40")}>
                <Icon className={cn("w-3.5 h-3.5", covenant === tab.value ? "text-primary" : "text-muted-foreground/50")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.value === "all" ? "All" : tab.value === "ot" ? "OT" : "NT"}</span>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", covenant === tab.value ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground/60")}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
