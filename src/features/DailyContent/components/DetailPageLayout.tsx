/**
 * DetailPageLayout — complete layout for DailyContent detail pages.
 * Replaces the repeated root div + DetailPageContent + sticky header pattern.
 */
import { ReactNode } from "react";
import { DetailPageContent } from "./DetailPageContent";

interface DetailPageLayoutProps {
  children: ReactNode;
}

export function DetailPageLayout({ children }: DetailPageLayoutProps) {
  return (
    <div className="min-h-full bg-background">
      {children}
    </div>
  );
}

/**
 * DetailPageInner — inner content wrapper with padding + max-width.
 */
export function DetailPageInner({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
      {children}
    </div>
  );
}
