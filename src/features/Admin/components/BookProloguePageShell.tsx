// BookProloguePageShell — centered max-width wrapper + vertical rhythm for the prologue detail page.
"use client";

import type { ReactNode } from "react";

export function BookProloguePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="prologue-page-shell">
      {children}
    </div>
  );
}
