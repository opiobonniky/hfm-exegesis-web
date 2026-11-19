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
}

export function DateTimeFields({
  selectedDate,
  setSelectedDate,
  selectedTime,
  handleTimeChange,
}: DateTimeFieldsProps) {
  return (
    <FormGrid columns={2}>
      <div className="space-y-2">
        <Label htmlFor="daily-content-date">{tt("Date *")}</Label>
        <DatePicker
          id="daily-content-date"
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder={tt("Pick a date")}
          aria-label={tt("Date *")}
        />
      </div>
      <div className="space-y-2">
        <Label>{tt("Time")}</Label>
        <Input type="time" value={selectedTime} onChange={handleTimeChange} />
      </div>
    </FormGrid>
  );
}
