import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function LabBookSearchField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selectedLabel = value || "Choose a book...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between rounded-xl border-border/60 text-left text-sm"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {selectedLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Type to filter Bible books..." autoFocus />
          <CommandList>
            <CommandEmpty>No matching book found.</CommandEmpty>
            {BIBLE_BOOKS.map((book) => (
              <CommandItem
                key={book}
                value={book}
                onSelect={() => {
                  onChange(book);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === book ? "opacity-100" : "opacity-0",
                  )}
                />
                {book}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
