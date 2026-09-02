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
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {children}
    </div>
  );
}
