/**
 * BiblePageLayout — root wrapper for Bible feature pages.
 */
import { ReactNode } from "react";

interface BiblePageLayoutProps {
  children: ReactNode;
  isRtl?: boolean;
  className?: string;
}

export function BiblePageLayout({ children, isRtl, className }: BiblePageLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className || ""}`} dir={isRtl ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}

/**
 * BiblePageInner — content wrapper with padding and max-width.
 */
export function BiblePageInner({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-4 ${className || ""}`}>
      {children}
    </div>
  );
}

/**
 * BiblePageStickyHeader — sticky header wrapper.
 */
export function BiblePageStickyHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40">
      {children}
    </header>
  );
}
