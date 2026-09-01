/**
 * AuthSplitPanel — split panel layout with form + branding side.
 */
import { ReactNode } from "react";

interface AuthSplitPanelProps {
  formPanel: ReactNode;
  brandingPanel: ReactNode;
  isRtl?: boolean;
}

export function AuthSplitPanel({ formPanel, brandingPanel, isRtl }: AuthSplitPanelProps) {
  return (
    <div className="min-h-screen flex bg-muted overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {brandingPanel}
      {formPanel}
    </div>
  );
}
