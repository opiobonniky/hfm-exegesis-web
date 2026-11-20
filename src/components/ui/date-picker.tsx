import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, parse } from "date-fns";
import type { Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tt } from "@/components/languages/hardcodedTranslate";

interface DatePickerBaseProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  min?: Date | string;
  max?: Date | string;
  align?: "start" | "center" | "end";
  "aria-label"?: string;
  /** Show a small clear button when a date is selected. */
  clearable?: boolean;
  onClear?: () => void;
}

export interface DatePickerValueProps extends DatePickerBaseProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  valueFormat?: "date";
}

/** For form/filter fields that store dates as `yyyy-MM-dd` strings. */
export interface DatePickerStringProps extends DatePickerBaseProps {
  value?: string | null;
  onChange: (date: string) => void;
  valueFormat: "string";
}

export type DatePickerProps = DatePickerValueProps | DatePickerStringProps;

function parseDate(value: Date | string | null | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * DatePicker — the single calendar picker used across the app.
 *
 * The popover always closes as soon as a day is selected, including when the
 * already-selected day is clicked (react-day-picker emits `undefined` for that
 * click unless `required` is set). The time of day already on `value` is kept,
 * so picking another date never resets the time to midnight.
 *
 * Pass `valueFormat="string"` for the many fields that persist ISO date
 * strings; the picker then emits the same string shape it receives.
 */
export function DatePicker(props: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(props.value);
  const min = parseDate(props.min);
  const max = parseDate(props.max);
  const showClear = Boolean(props.clearable && selected);

  const handleSelect = (day: Date | undefined) => {
    // Close before any early return so every selection dismisses the calendar.
    setOpen(false);
    if (!day) return;

    if (props.valueFormat === "string") {
      props.onChange(format(day, "yyyy-MM-dd"));
      return;
    }

    const next = new Date(day);
    if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    props.onChange(next);
  };

  const handleClear = () => {
    setOpen(false);
    props.onClear?.();
  };

  const disabledDays: Matcher[] | undefined =
    min || max
      ? [
          ...(min ? [{ before: min }] : []),
          ...(max ? [{ after: max }] : []),
        ]
      : undefined;

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={props.id}
            type="button"
            variant="outline"
            disabled={props.disabled}
            aria-label={props["aria-label"]}
            aria-haspopup="dialog"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              showClear && "pr-9",
              props.className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, "PPP") : <span>{props.placeholder ?? tt("Pick a date")}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={props.align}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledDays}
            required
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {showClear && (
        <button
          type="button"
          aria-label={tt("Clear date")}
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
