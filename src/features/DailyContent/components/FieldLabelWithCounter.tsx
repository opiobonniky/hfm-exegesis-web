/**
 * FieldLabelWithCounter — label row with optional character counter.
 */
import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FieldLabelWithCounterProps {
  label: string;
  counter?: ReactNode;
  children?: ReactNode;
}

export function FieldLabelWithCounter({ label, counter, children }: FieldLabelWithCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      {counter}
      {children}
    </div>
  );
}
