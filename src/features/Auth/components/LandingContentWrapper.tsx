// Landing page content wrapper
import type { LandingContentWrapperProps } from "../types";

export function LandingContentWrapper({ children }: LandingContentWrapperProps) {
  return <div className="relative z-10">{children}</div>;
}
