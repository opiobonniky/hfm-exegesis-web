// BookProloguePageShell — centered max-width wrapper + vertical rhythm for the prologue detail page.
"use client";

import type { ReactNode } from "react";

export function BookProloguePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 py-6 sm:px-4 lg:px-6">
      {children}
    </div>
  );
}
