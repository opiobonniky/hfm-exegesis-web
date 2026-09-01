/**
 * DateTimeFields — replaces repeated date/time input grid pattern.
 */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormGrid } from "./FormGrid";

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
        <Label>Date *</Label>
        <Input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => {
            const d = new Date(e.target.value);
            d.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
            setSelectedDate(d);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>Time</Label>
        <Input type="time" value={selectedTime} onChange={handleTimeChange} />
      </div>
    </FormGrid>
  );
}
