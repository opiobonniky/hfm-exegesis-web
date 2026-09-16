// Shared docking wrapper for reader bottom bars (BottomActionBar, VerseMultiSelectBar, AudioControlBar).
// The wrapper is transparent so chapter content scrolls behind it; only the inner strip is solid.
// The negative `lift` pulls the dock up over the content's last line.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const WRAPPER_BASE = "relative z-20 shrink-0 bg-transparent h-10 sm:px-4 sm:pb-3";

const BAR_BASE = cn(
  "border-t border-border bg-background/95 backdrop-blur-xl",
  "sm:rounded-2xl sm:border sm:shadow-lg",
);

interface ReaderDockProps {
  /** Tailwind negative margin pulling the dock over the content, e.g. "-mt-14" */
  lift?: string;
  /** Reserve a strip below the bar for the device safe area (notched phones) */
  safeArea?: boolean;
  /** Extra classes for the transparent wrapper */
  className?: string;
  /** Extra classes for the inner solid strip (layout, max-width, overflow) */
  barClassName?: string;
  children: ReactNode;
}

export default function ReaderDock({
  lift = "-mt-14",
  safeArea = false,
  className,
  barClassName,
  children,
}: ReaderDockProps) {
  return (
    <div className={cn(WRAPPER_BASE, lift, className)}>
      <div className={cn(BAR_BASE, barClassName)}>{children}</div>
      {safeArea && (
        <div className="h-[env(safe-area-inset-bottom)] bg-background/95 sm:hidden" />
      )}
    </div>
  );
}
