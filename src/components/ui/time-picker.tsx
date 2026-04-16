"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
}

export function TimePicker({
  value,
  onChange,
  label = "Time",
  className,
  disabled = false,
  defaultValue = "08:00",
}: TimePickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor="time-picker">{label}</Label>}
      <div className="relative">
        <Input
          id="time-picker"
          type="time"
          value={value || defaultValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            // Override default blue focus/selection with theme colors
            "focus:ring-primary focus:border-primary",
            "selection:bg-primary/20 selection:text-primary",
            "[&::-webkit-calendar-picker-indicator]:text-primary",
            "[&::-webkit-inner-spin-button]:opacity-0 [&::-webkit-inner-spin-button]:hidden",
            "text-foreground bg-background",
            disabled && "opacity-60",
          )}
        />
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
