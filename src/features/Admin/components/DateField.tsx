// DateField — calendar date picker for admin forms
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CALENDAR_MODIFIERS,
  CALENDAR_MODIFIER_CLASSES,
  CALENDAR_DISABLED,
} from "../constants";

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  required?: boolean;
}

export function DateField({ label, value, onChange, required }: Props) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">
        {label} {required && "*"}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground dark:text-foreground/80" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (d) {
                const newDate = new Date(d);
                newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
                onChange(newDate);
              }
            }}
            initialFocus
            modifiers={CALENDAR_MODIFIERS}
            modifiersClassNames={CALENDAR_MODIFIER_CLASSES}
            disabled={CALENDAR_DISABLED}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
