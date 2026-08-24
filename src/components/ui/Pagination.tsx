"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className,
      )}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
