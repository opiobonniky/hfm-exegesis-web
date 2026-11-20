/**
 * DateTimeFields — replaces repeated date/time input grid pattern.
 */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { FormGrid } from "./FormGrid";
import { tt } from '@/components/languages/hardcodedTranslate';

interface DateTimeFieldsProps {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  selectedTime: string;
  handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: { date?: string; time?: string };
}

export function DateTimeFields({
  selectedDate,
  setSelectedDate,
  selectedTime,
  handleTimeChange,
  errors,
}: DateTimeFieldsProps) {
  return (
    <FormGrid columns={2}>
      <div className="space-y-2" data-validation-field="date">
        <Label htmlFor="daily-content-date">{tt("Date *")}</Label>
        <DatePicker
          id="daily-content-date"
          value={Number.isFinite(selectedDate.getTime()) ? selectedDate : undefined}
          onChange={setSelectedDate}
          placeholder={tt("Pick a date")}
          aria-label={tt("Date *")}
          className={errors?.date ? 'border-destructive' : undefined}
        />
        {errors?.date && <p role="status" className="text-xs text-destructive">{tt(errors.date)}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="daily-content-time">{tt("Time")}</Label>
        <Input id="daily-content-time" data-validation-field="time" aria-invalid={!!errors?.time}
          aria-describedby={errors?.time ? 'daily-content-time-error' : undefined}
          type="time" value={selectedTime} onChange={handleTimeChange} />
        {errors?.time && <p id="daily-content-time-error" role="status" className="text-xs text-destructive">{tt(errors.time)}</p>}
      </div>
    </FormGrid>
  );
}
