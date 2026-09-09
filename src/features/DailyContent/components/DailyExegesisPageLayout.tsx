/**
 * DailyExegesisPageLayout — page wrapper for DailyExegesis (loading + content states).
 */
import type { DailyExegesisPageLayoutProps } from "../types";

export function DailyExegesisPageLayout({ isRtl, children }: DailyExegesisPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
