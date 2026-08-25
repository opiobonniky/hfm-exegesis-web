import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORIES = ["all", "intro", "whole-bible", "nt", "ot", "book", "topical"];

interface Props {
  search: string;
  setSearch: (v: string) => void;
  catFilter: string;
  setCatFilter: (v: string) => void;
  t: any;
  isRtl: boolean;
}

export function ReadingPlanFilters({ search, setSearch, catFilter, setCatFilter, t, isRtl }: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plans..."
          className="pl-9"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              catFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {cat === "all" ? "All" : t.readingPlan?.[`cat${cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", "")}`] || cat}
          </button>
        ))}
      </div>
    </div>
  );
}
