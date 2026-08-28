// Translation picker — dropdown to switch Bible version
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

interface TranslationPickerProps {
  translations: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (search: string) => void;
}
export default function TranslationPicker({
  translations,
  selectedId,
  onSelect,
  open,
  onOpenChange,
  search,
  onSearchChange,
}: TranslationPickerProps) {
  const { t, isRtl } = useLanguage();
  const filtered = translations.filter(
    (tr) => !search || tr.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2.5 text-xs gap-1"
          aria-label={t.bibleReader.selectVersion}
        >
          <span className="truncate max-w-[80px]">{selectedId}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] max-h-[400px] p-0" align="end">
        <div className="p-2 border-b">
          <Input
            placeholder={t.bibleReader.searchTranslations}
            aria-label={t.bibleReader.searchTranslations}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.map((tr) => (
            <button
              key={tr.id}
              onClick={() => {
                onSelect(tr.id);
                onOpenChange(false);
                onSearchChange("");
              }}
              className={cn(
                "w-full px-3 py-2 text-xs hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                isRtl ? "text-right" : "text-left",
                selectedId === tr.id &&
                  "bg-primary/5 text-primary font-semibold",
              )}
              aria-current={selectedId === tr.id ? "true" : undefined}
            >
              {tr.name}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              {t.bibleReader.noTranslations}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
