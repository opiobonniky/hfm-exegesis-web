/**
 * DailyExegesisLayout — content wrapper for DailyExegesis page body.
 * Replaces the repeated `<div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">` pattern.
 */
import type { DailyExegesisLayoutProps } from "../types";

export function DailyExegesisLayout({ children }: DailyExegesisLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {children}
    </div>
  );
}
