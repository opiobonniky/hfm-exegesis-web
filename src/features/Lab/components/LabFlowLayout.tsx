import type { ReactNode } from "react";
import Gate from "@/components/Gate";

interface LabFlowLayoutProps {
  children: ReactNode;
  isRtl: boolean;
}

export function LabFlowLayout({ children, isRtl }: LabFlowLayoutProps) {
  return (
    <Gate
      featureName="Exegesis Lab"
      featureDescription="The full 5-stage Scripture study journey is available for Legacy Sower and Covenant Sower subscribers."
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex flex-col bg-background">
        {children}
      </div>
    </Gate>
  );
}
