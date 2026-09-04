"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  width?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  disabled = false,
  width = "w-[180px]",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ?? placeholder;

  const groupedOptions = React.useMemo(() => {
    const groups = new Map<string, ComboboxOption[]>();
    options.forEach((opt) => {
      const key = opt.group || "General";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(opt);
    });
    return Array.from(groups.entries());
  }, [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between text-left truncate", width)}
          disabled={disabled}
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", width)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groupedOptions.map(([groupName, groupItems]) => (
              <CommandGroup key={groupName} heading={groupName === "General" ? undefined : groupName}>
                {groupItems.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={`${groupName} ${opt.label} ${opt.value}`}
                    onSelect={() => {
                      onChange(opt.value === value ? "" : opt.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
