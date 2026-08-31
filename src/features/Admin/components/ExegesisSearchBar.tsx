// ExegesisSearchBar — search input + button for exegesis list
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExegesisSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function ExegesisSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search by title or passage...",
}: ExegesisSearchBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pl-9"
        />
      </div>
      <Button variant="outline" onClick={onSearch}>
        Search
      </Button>
    </div>
  );
}
