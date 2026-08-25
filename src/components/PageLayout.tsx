import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  isRtl?: boolean;
  accentColor?: "teal" | "blue" | "emerald" | "primary";
  className?: string;
}

const GRADIENT = {
  teal: "from-teal-400 via-emerald-400 to-cyan-400",
  blue: "from-blue-400 via-indigo-400 to-violet-400",
  emerald: "from-emerald-400 via-green-400 to-teal-400",
  primary: "from-primary/80 via-primary to-primary/60",
};

export function PageLayout({ children, isRtl = false, accentColor = "primary", className }: Props) {
  return (
    <div className={cn("min-h-screen bg-background", className)} dir={isRtl ? "rtl" : "ltr"}>
      <div className={cn("h-1", isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r", GRADIENT[accentColor] || GRADIENT.primary)} />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {children}
      </div>
    </div>
  );
}
