/**
 * DetailSection — groups content blocks with optional title in detail pages.
 */
import { ReactNode } from "react";

interface DetailSectionProps {
  title?: string;
  children: ReactNode;
}

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <div className="space-y-1">
      {title && <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>}
      {children}
    </div>
  );
}
