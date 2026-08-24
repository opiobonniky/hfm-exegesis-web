"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  className?: string;
  label?: string;
}

/**
 * Reusable pagination bar with prev/next buttons and page info.
 * Supports both totalPages and hasNext/hasPrevious from API responses.
 */
export function PaginationBar({ page, totalPages, hasNext, hasPrevious, onPageChange, className, label }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between mt-6 pt-4 border-t border-border", className)}>
      <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => onPageChange(Math.max(0, page - 1))} className="gap-1">
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <span className="text-xs text-muted-foreground">
        {label || `Page ${page + 1} of ${Math.max(totalPages, 1)}`}
      </span>
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)} className="gap-1">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
