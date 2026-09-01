// Landing page content wrapper
import { ReactNode } from "react";

interface LandingContentWrapperProps {
  children: ReactNode;
}

export function LandingContentWrapper({ children }: LandingContentWrapperProps) {
  return (
    <div className="relative z-10">
      {children}
    </div>
  );
}
