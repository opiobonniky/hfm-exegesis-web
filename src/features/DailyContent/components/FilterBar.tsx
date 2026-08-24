"use client";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { PRESETS } from "../constants";

interface FilterBarProps {
  fromDate: string; toDate: string; activePreset: string | null; filterError: string;
  isFiltered: boolean; onFromChange: (v: string) => void; onToChange: (v: string) => void;
  onApply: () => void; onClear: () => void; onPreset: (p: string) => void;
}
export default function FilterBar({ fromDate, toDate, activePreset, filterError, isFiltered, onFromChange, onToChange, onApply, onClear, onPreset }: FilterBarProps) {
  const { t } = useLanguage();
  return (
    <div className="border border-border rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Range</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS(t).map((p) => (
            <button key={p.value} onClick={() => onPreset(p.value)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", activePreset === p.value ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border" />
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">From</Label>
          <Input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => onFromChange(e.target.value)} className="h-9 text-sm" />
          <Label className="text-xs">To</Label>
          <Input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => onToChange(e.target.value)} className="h-9 text-sm" />
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={onApply} className="gap-1.5"><Search className="w-3.5 h-3.5" />Apply</Button>
          {isFiltered && <Button variant="outline" size="sm" onClick={onClear} className="gap-1"><X className="w-3.5 h-3.5" />Clear</Button>}
      {filterError && <p className="text-sm text-destructive">{filterError}</p>}
    </div>
  );
