/**
 * OnboardingLayout — layout components for Onboarding page.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  gradient: string;
  children: ReactNode;
}

export function OnboardingLayout({ gradient, children }: OnboardingLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-gradient-to-b transition-all duration-700", gradient)}>
      {children}
    </div>
  );
}

export function OnboardingTopBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      {children}
    </div>
  );
}

export function OnboardingSlideArea({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
      {children}
    </div>
  );
}

export function OnboardingBottomControls({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 pb-10 pt-4">
      {children}
    </div>
  );
}

export function OnboardingBranding() {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <span className="text-[10px] font-medium text-white/30 tracking-wider uppercase">Exegesis Project</span>
      <span className="text-[10px] text-white/20">&middot;</span>
      <span className="text-[10px] text-white/30 italic">The Living Text</span>
    </div>
  );
}
