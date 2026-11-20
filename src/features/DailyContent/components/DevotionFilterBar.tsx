import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from '@/components/languages/hardcodedTranslate';

const PRESETS = (t?: any) => [
  { label: t?.devotions?.presetLast7 || "Last 7 days", value: "last_7" },
  { label: t?.devotions?.presetLast30 || "Last 30 days", value: "last_30" },
  { label: t?.devotions?.presetThisWeek || "This week", value: "this_week" },
  { label: t?.devotions?.presetThisMonth || "This month", value: "this_month" },
  { label: t?.devotions?.presetLastMonth || "Last month", value: "last_month" },
];

interface Props {
  fromDate: string;
  toDate: string;
  search: string;
  activePreset: string | null;
  filterError: string;
  isFiltered: boolean;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onClear: () => void;
  onPreset: (v: string) => void;
}

export function DevotionFilterBar({
  fromDate, toDate, search, activePreset, filterError, isFiltered,
  onFromChange, onToChange, onSearchChange, onClear, onPreset,
}: Props) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
            {t.devotions?.quickRange || tt("Quick Range")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS(t).map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPreset(p.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs border transition-colors",
                  activePreset === p.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border/40" />

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 basis-full flex-1 space-y-1 sm:basis-52">
            <Label htmlFor="devotion-search">{tt("Search")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="devotion-search"
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={tt("Search by title, book or creator")}
                className="h-9 ps-9 text-sm"
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-[22rem]">
            <div className="min-w-0 space-y-1">
              <Label htmlFor="from-date">{t.common?.from || tt("From")}</Label>
              <DatePicker id="from-date" valueFormat="string" value={fromDate} max={toDate || undefined}
                onChange={onFromChange} onClear={() => onFromChange('')} clearable
                className="h-9 text-xs" placeholder={tt("Start date")} aria-label={t.common?.from || tt("From")} />
            </div>
            <div className="min-w-0 space-y-1">
              <Label htmlFor="to-date">{t.common?.to || tt("To")}</Label>
              <DatePicker id="to-date" valueFormat="string" value={toDate} min={fromDate || undefined}
                onChange={onToChange} onClear={() => onToChange('')} clearable
                className="h-9 text-xs" placeholder={tt("End date")} aria-label={t.common?.to || tt("To")} />
            </div>
          </div>

          {isFiltered && (
            <Button type="button" variant="ghost" size="icon" aria-label={tt("Clear filters")} onClick={onClear}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {filterError && <p className="text-sm text-destructive">{filterError}</p>}
      </CardContent>
    </Card>
  );
}
