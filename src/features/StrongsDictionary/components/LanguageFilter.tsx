import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tt } from '@/components/languages/hardcodedTranslate';

const LANG_FILTERS = [
  { label: tt("All"), value: "all" },
  { label: tt("Hebrew"), value: "hebrew" },
  { label: tt("Greek"), value: "greek" },
];

interface LanguageFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageFilter({ value, onChange }: LanguageFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANG_FILTERS.map((f) => (
          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
