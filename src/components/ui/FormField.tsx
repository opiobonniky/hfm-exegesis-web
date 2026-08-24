"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable form field wrapper with label, error, and description.
 * Wraps any input component with consistent layout and error display.
 */
export function FormField({ label, error, required, description, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {description && !error && <p className="text-[11px] text-muted-foreground">{description}</p>}
      {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
    </div>
  );
}

/**
 * Form field grid — multiple fields in a responsive grid.
 */
export function FormGrid({ children, columns = 2, className }: { children: React.ReactNode; columns?: 1 | 2 | 3 | 4; className?: string }) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return <div className={cn("grid gap-4", gridClass, className)}>{children}</div>;
}
