/**
 * FormTwoColumn — two-column layout for forms with live preview (AddExplanation pattern).
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormTwoColumnProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function FormTwoColumn({ left, right, className }: FormTwoColumnProps) {
  return (
    <div className={cn("fade-up stagger-1 grid lg:grid-cols-[1fr_420px] gap-6 items-start", className)}>
      <div className="space-y-5">{left}</div>
      <div className="space-y-4 lg:sticky lg:top-6">{right}</div>
    </div>
  );
}
