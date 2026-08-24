"use client";

import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterBar({
  options,
  value,
  onChange,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 p-1 rounded-xl border border-border bg-muted/30",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
