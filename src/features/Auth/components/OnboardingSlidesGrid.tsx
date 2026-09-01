// Onboarding slides grid — renders all slides from SLIDES data
import { ReactNode } from "react";

interface OnboardingSlidesGridProps {
  children: ReactNode;
}

export function OnboardingSlidesGrid({ children }: OnboardingSlidesGridProps) {
  return <>{children}</>;
}
