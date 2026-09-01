/**
 * OnboardingControls — dots + counter row for onboarding.
 */
import { ReactNode } from "react";
import { DotIndicators } from "./DotIndicators";

interface OnboardingControlsProps {
  total: number;
  current: number;
  children: ReactNode;
}

export function OnboardingControls({ total, current, children }: OnboardingControlsProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <DotIndicators total={total} current={current} />
        <span className="text-xs font-semibold text-white/40">{current + 1} / {total}</span>
      </div>
      {children}
    </>
  );
}
