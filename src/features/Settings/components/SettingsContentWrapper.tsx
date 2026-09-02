// SettingsContentWrapper — wraps the settings page content area
import { ReactNode } from "react";

interface SettingsContentWrapperProps {
  isRtl: boolean;
  children: ReactNode;
}

export function SettingsContentWrapper({ isRtl, children }: SettingsContentWrapperProps) {
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-full bg-background">
      {children}
    </div>
  );
}

interface SettingsContentAreaProps {
  children: ReactNode;
}

export function SettingsContentArea({ children }: SettingsContentAreaProps) {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {children}
    </div>
  );
}

interface SettingsBottomSpacerProps {}

export function SettingsBottomSpacer(_props: SettingsBottomSpacerProps) {
  return <div className="h-8" />;
}
