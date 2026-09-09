import type { ReactNode } from "react";

interface DailyReadingMainProps {
  children: ReactNode;
}

export function DailyReadingMain({ children }: DailyReadingMainProps) {
  return <main className="min-w-0 space-y-6">{children}</main>;
}
