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

export function AdminPageContent({ children, className = "", fullWidth = false }: AdminPageContentProps & { fullWidth?: boolean }) {
  const base = fullWidth ? 'max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6' : 'max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6';
  return (
    <div className={`${base} ${className}`.trim()}>
      {children}
    </div>
  );
}
