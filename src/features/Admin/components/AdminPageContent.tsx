/**
 * AdminPageContent — layout wrapper for admin page body content.
 * Replaces the repeated `<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">` pattern.
 */
import { ReactNode } from "react";

interface AdminPageContentProps {
  children: ReactNode;
  /** Extra classes to append to the wrapper */
  className?: string;
}

export function AdminPageContent({ children, className = "" }: AdminPageContentProps) {
  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
