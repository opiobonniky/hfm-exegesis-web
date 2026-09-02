// DailyReading layout wrapper for content area
import { ReactNode } from "react";

interface DailyReadingLayoutProps {
  isRtl: boolean;
  showConfetti: boolean;
  confettiOverlay: ReactNode;
  children: ReactNode;
}

export function DailyReadingLayout({ isRtl, showConfetti, confettiOverlay, children }: DailyReadingLayoutProps) {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_32%),linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--muted)/0.25))]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {showConfetti && confettiOverlay}
      {children}
    </div>
  );
}

interface DailyReadingContentProps {
  children: ReactNode;
}

export function DailyReadingContent({ children }: DailyReadingContentProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      {children}
    </div>
  );
}

interface DailyReadingGridProps {
  children: ReactNode;
}

export function DailyReadingGrid({ children }: DailyReadingGridProps) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
      {children}
    </div>
  );
}

interface DailyReadingMobileCompletionProps {
  children: ReactNode;
}

export function DailyReadingMobileCompletion({ children }: DailyReadingMobileCompletionProps) {
  return (
    <div className="lg:hidden">{children}</div>
  );
}
