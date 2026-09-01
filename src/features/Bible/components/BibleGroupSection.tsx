/**
 * BibleGroupSection — book/chapter grouping wrapper for Bible list pages.
 * Replaces the repeated `<div key={book} className="mb-6">` pattern.
 */
import { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  /** Extra class names on the wrapper */
  className?: string;
}

export function BibleGroupSection({ label, children, className = "" }: Props) {
  return (
    <div className={`mb-6 ${className}`.trim()}>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
        {label}
      </h3>
      {children}
    </div>
  );
}

interface SubProps {
  label: string;
  children: ReactNode;
}

export function BibleSubGroup({ label, children }: SubProps) {
  return (
    <div className="mb-4 ml-2">
      <p className="text-[11px] font-medium text-muted-foreground/50 mb-2 px-1">
        {label}
      </p>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
