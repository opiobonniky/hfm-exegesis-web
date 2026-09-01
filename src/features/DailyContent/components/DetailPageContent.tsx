/**
 * DetailPageContent — content wrapper for DailyContent detail pages.
 * Replaces the repeated `<div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">` pattern.
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function DetailPageContent({ children }: Props) {
  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
      {children}
    </div>
  );
}
