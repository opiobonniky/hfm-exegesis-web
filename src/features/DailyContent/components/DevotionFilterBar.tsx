import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

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
  activePreset: string | null;
  filterError: string;
  isFiltered: boolean;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  onPreset: (v: string) => void;
}
export function DevotionFilterBar({
  fromDate, toDate, activePreset, filterError, isFiltered,
  onFromChange, onToChange, onApply, onClear, onPreset,
}: Props) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/50">
      <CardContent className="p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t.devotions?.quickRange || "Quick Range"}
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS(t).map((p) => (
              <button
                key={p.value}
                onClick={() => onPreset(p.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm border transition-colors",
                  activePreset === p.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-secondary",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-border/40" />
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="from-date">{t.common?.from || "From"}</Label>
            <Input id="from-date" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => onFromChange(e.target.value)} />
            <Label htmlFor="to-date">{t.common?.to || "To"}</Label>
            <Input id="to-date" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => onToChange(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={onApply} variant="secondary">{t.devotions?.apply || "Apply"}</Button>
            {isFiltered && <Button onClick={onClear} variant="ghost">{t.devotions?.clear || "Clear"}</Button>}
        {filterError && <p className="text-sm text-destructive">{filterError}</p>}
      </CardContent>
    </Card>
  );
