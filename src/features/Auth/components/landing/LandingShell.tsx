
import type { LandingShellProps } from "../../types";
import { LandingContentWrapper } from "../LandingContentWrapper";

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      <LandingContentWrapper>{children}</LandingContentWrapper>
    </div>
  );
}