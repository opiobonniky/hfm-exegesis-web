/**
 * DetailPageContent — root wrapper for DailyContent detail pages.
 * Replaces the repeated `<div className="min-h-full bg-background">` + inner content pattern.
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function DetailPageContent({ children }: Props) {
  return (
    <div className="min-h-full bg-background">
      {children}
    </div>
  );
}
