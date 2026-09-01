/**
 * HimFirstMediaPageLayout — root wrapper for all HimFirstMedia pages.
 * Replaces the repeated `<div className="w-full bg-background text-foreground overflow-x-hidden">`.
 */
import { ReactNode } from "react";

interface HimFirstMediaPageLayoutProps {
  children: ReactNode;
}

export function HimFirstMediaPageLayout({ children }: HimFirstMediaPageLayoutProps) {
  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      {children}
    </div>
  );
}
