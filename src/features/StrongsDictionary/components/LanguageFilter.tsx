import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANG_FILTERS = [
  { label: "All", value: "all" },
  { label: "Hebrew", value: "hebrew" },
  { label: "Greek", value: "greek" },
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
