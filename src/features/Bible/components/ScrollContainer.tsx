/**
 * ScrollContainer — flexible scroll container for pages with overflow.
 */
import { ReactNode } from "react";

interface ScrollContainerProps {
  children: ReactNode;
  bottomSpacer?: number;
}

export function ScrollContainer({ children, bottomSpacer = 48 }: ScrollContainerProps) {
  return (
    <div className="flex-1 overflow-hidden">
      {children}
      <div style={{ height: bottomSpacer }} />
    </div>
  );
}
