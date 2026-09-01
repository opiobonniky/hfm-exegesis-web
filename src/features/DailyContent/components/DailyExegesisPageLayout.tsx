/**
 * DailyExegesisPageLayout — page wrapper for DailyExegesis (loading + content states).
 */
import { ReactNode } from "react";

interface Props {
  isRtl: boolean;
  children: ReactNode;
}

export function DailyExegesisPageLayout({ isRtl, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
