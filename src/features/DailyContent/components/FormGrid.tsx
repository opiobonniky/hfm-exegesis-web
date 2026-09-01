/**
 * FormGrid — replaces repeated `<div className="grid sm:grid-cols-2 gap-4">` patterns.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormGridProps {
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

const COL_MAP: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function FormGrid({ columns = 2, children, className }: FormGridProps) {
  return (
    <div className={cn("grid gap-4", COL_MAP[columns], className)}>
      {children}
    </div>
  );
}
