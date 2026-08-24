import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryLabel, BOOK_NAMES } from "../constants";

interface Props {
  t: any; isRtl: boolean;
  search: string; setSearch: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  showFilters: boolean; viewMode: string;
  bookName: string; setBookName: (v: string) => void;
  source: string; setSource: (v: string) => void;
  strongsId: string; setStrongsId: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  hasActiveFilters: boolean; clearAllFilters: () => void;
}
export function JournalFilterBar({
  t, isRtl, search, setSearch, category, setCategory, showFilters, viewMode,
  bookName, setBookName, source, setSource, strongsId, setStrongsId,
  startDate, setStartDate, endDate, setEndDate, hasActiveFilters, clearAllFilters,
}: Props) {
  const inputCls = "h-9 text-sm rounded-xl bg-card dark:bg-stone-900 border-border dark:border-stone-800";
  const labelCls = "text-[10px] font-bold text-muted-foreground dark:text-muted-foreground/70 uppercase mb-1";
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70", isRtl ? "right-3" : "left-3")} />
          <Input placeholder={viewMode === "discover" ? "Search community entries..." : "Search entries..."} value={search} onChange={(e) => setSearch(e.target.value)}
            className={cn(inputCls, isRtl ? "pr-9" : "pl-9")} autoComplete="off" />
          {search && (
            <button onClick={() => setSearch("")} className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground", isRtl ? "left-2.5" : "right-2.5")}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className={cn(inputCls, "w-full sm:w-44")}><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{getCategoryLabel(t, c.value)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {showFilters && (
        <div className="bg-card dark:bg-stone-900/80 border border-border dark:border-stone-800 rounded-2xl p-4 mb-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-foreground/80 dark:text-muted-foreground/50 uppercase tracking-wider">Advanced Filters</p>
            {hasActiveFilters && <button onClick={clearAllFilters} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">Clear all</button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className={labelCls}>Book</p>
              <Select value={bookName || "all"} onValueChange={(v) => setBookName(v === "all" ? "" : v)}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-card dark:bg-stone-900 border-border dark:border-stone-800"><SelectValue placeholder="All books" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Books</SelectItem>{BOOK_NAMES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {viewMode === "my" && (
              <div>
                <p className={labelCls}>Source</p>
                <Select value={source || "all"} onValueChange={(v) => setSource(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-card dark:bg-stone-900 border-border dark:border-stone-800"><SelectValue placeholder="All sources" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Sources</SelectItem><SelectItem value="manual">Manual</SelectItem><SelectItem value="exegesis-lab">Exegesis Lab</SelectItem></SelectContent>
                </Select>
              </div>
            )}
                <p className={labelCls}>Strong's ID</p>
                <Input placeholder="e.g. G26, H7225" value={strongsId} onChange={(e) => setStrongsId(e.target.value)} className="h-9 text-xs rounded-xl bg-card dark:bg-stone-900 border-border dark:border-stone-800" autoComplete="off" />
              <p className={labelCls}>Start Date</p>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-xs rounded-xl bg-card dark:bg-stone-900 border-border dark:border-stone-800" />
              <p className={labelCls}>End Date</p>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-xs rounded-xl bg-card dark:bg-stone-900 border-border dark:border-stone-800" />
      )}
    </>
  );
