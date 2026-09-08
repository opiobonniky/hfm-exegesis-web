import type { ReactNode } from "react";

interface StrongsDictionaryShellProps {
  children: ReactNode;
}

export function StrongsDictionaryShell({ children }: StrongsDictionaryShellProps) {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-primary/[0.06] via-background to-background px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">{children}</div>
    </div>
  );
}

interface StrongsStudyGridProps {
  children: ReactNode;
}

export function StrongsStudyGrid({ children }: StrongsStudyGridProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.42fr)]">
      {children}
    </div>
  );
}
