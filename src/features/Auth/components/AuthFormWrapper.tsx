/**
 * AuthFormWrapper — right-panel wrapper for Auth form pages.
 * Provides consistent padding, max-width, and scroll behavior.
 */
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Extra class names on the wrapper */
  className?: string;
}

export function AuthFormWrapper({ children, className = "" }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
      <div className={`w-full max-w-[420px] space-y-8 py-8 lg:py-0 ${className}`}>
        {children}
      </div>
    </div>
  );
}
