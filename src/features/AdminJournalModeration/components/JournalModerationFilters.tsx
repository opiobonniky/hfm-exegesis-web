import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FILTER_OPTIONS } from "../constants";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onSearch: () => void;
  filter: string;
  onFilterChange: (v: string) => void;
}

export function JournalModerationFilters({ search, onSearchChange, onSearch, filter, onFilterChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
      </div>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48">
          <Filter className="mr-2 h-4 w-4" /><SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
