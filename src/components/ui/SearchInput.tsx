"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * Reusable search input with optional debounce and clear button.
 * Handles both immediate and debounced value changes.
 */
export function SearchInput({
  value, onChange, onDebouncedChange, placeholder = "Search...", debounceMs = 300, className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => { setLocalValue(value); }, [value]);

  useEffect(() => {
    if (!onDebouncedChange) return;
    const timer = setTimeout(() => onDebouncedChange(localValue), debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onDebouncedChange]);

  const handleChange = useCallback((v: string) => {
    setLocalValue(v);
    onChange(v);
  }, [onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 text-sm"
      />
      {localValue && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
