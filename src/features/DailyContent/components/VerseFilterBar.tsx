import { Search, X, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { PRESETS, formatDisplayDate } from "../constants";

interface Props {
  fromDate: string;
  toDate: string;
  activePreset: string | null;
  filterError: string;
  isFiltered: boolean;
  futureCount: number;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  onPreset: (preset: string) => void;
}

export default function VerseFilterBar({
  fromDate, toDate, activePreset, filterError, isFiltered, futureCount,
  onFromChange, onToChange, onApply, onClear, onPreset,
}: Props) {
  const { t } = useLanguage();
  const presets = PRESETS(t);

  return (
    <div className="space-y-3">
      <div className="border border-border rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Quick Range
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => onPreset(p.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                activePreset === p.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="border-t border-border" />
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => onFromChange(e.target.value)}
              className="h-9 text-sm"
            />
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => onToChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" onClick={onApply} className="gap-1.5">
              <Search className="w-3.5 h-3.5" />Apply
            </Button>
            {isFiltered && (
              <Button variant="outline" size="sm" onClick={onClear} className="gap-1">
                <X className="w-3.5 h-3.5" />Clear
              </Button>
            )}
          </div>
        </div>
        {filterError && <p className="text-sm text-destructive">{filterError}</p>}
      </div>
      {/* Filter status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isFiltered ? (
          <>
            <CalendarRange className="w-4 h-4 shrink-0" />
            <span>
              {fromDate && (
                <>from <strong className="text-foreground">{formatDisplayDate(fromDate)}</strong></>
              )}
              {toDate && (
                <> to <strong className="text-foreground">{formatDisplayDate(toDate)}</strong></>
              )}
            </span>
            <button
              onClick={onClear}
              className="ml-1 rounded-full hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <span>
            Showing today{" "}
            {futureCount > 0 && (
              <>
                + <strong className="text-foreground">{futureCount}</strong> upcoming
              </>
            )}{" "}
            + recent history
          </span>
        )}
      </div>
    </div>
  );
}
