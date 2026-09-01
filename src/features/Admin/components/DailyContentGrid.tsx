// DailyContentGrid — responsive grid wrapper for daily content cards
"use client";

import type { ReactNode } from "react";

export function DailyContentGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  );
}
