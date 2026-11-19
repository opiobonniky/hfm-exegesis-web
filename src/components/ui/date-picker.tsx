import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  min?: Date;
  max?: Date;
  align?: "start" | "center" | "end";
  "aria-label"?: string;
}

/**
 * DatePicker — the single calendar picker used across the app.
 *
 * The popover always closes as soon as a day is selected, including when the
 * already-selected day is clicked (react-day-picker emits `undefined` for that
 * click unless `required` is set). The time of day already on `value` is kept,
 * so picking another date never resets the time to midnight.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  min,
  max,
  align = "start",
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (day: Date | undefined) => {
    // Close before any early return so every selection dismisses the calendar.
    setOpen(false);
    if (!day) return;

    const next = new Date(day);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    }
    onChange(next);
  };

  const disabledDays: Matcher[] | undefined =
    min || max
      ? [
          ...(min ? [{ before: min }] : []),
          ...(max ? [{ after: max }] : []),
        ]
      : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          disabled={disabledDays}
          required
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
