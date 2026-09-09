// BookProloguePageShell — centered max-width wrapper + vertical rhythm for the prologue detail page.
"use client";

import type { ReactNode } from "react";

export function BookProloguePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto max-w-6xl space-y-6 overflow-hidden px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      {children}
    </div>
  );
}
