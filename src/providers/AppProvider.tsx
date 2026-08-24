"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { RTLProvider } from "./RTLProvider";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <RTLProvider>
        {children}
      </RTLProvider>
    </ThemeProvider>
  );
}

// Re-export hooks
export { useThemeContext } from "./ThemeProvider";
export { useRTL } from "./RTLProvider";
