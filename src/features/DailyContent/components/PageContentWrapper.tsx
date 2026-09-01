/**
 * PageContentWrapper — replaces the repeated `<div className="min-h-screen ..."><div className="max-w-4xl mx-auto space-y-8">` pattern.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentWrapperProps {
  children: ReactNode;
  isRtl?: boolean;
  maxWidth?: string;
}

export function PageContentWrapper({ children, isRtl, maxWidth = "max-w-4xl" }: PageContentWrapperProps) {
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className={cn(maxWidth, "mx-auto space-y-8")}>
        {children}
      </div>
    </div>
  );
}
