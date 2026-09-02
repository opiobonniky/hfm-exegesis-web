import type { ReactNode } from "react";
import { Gate } from "@/components/Gate";

interface LabHomeWorkspaceProps {
  children: ReactNode;
}

export function LabHomeWorkspace({ children }: LabHomeWorkspaceProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <Gate
        featureName="Exegesis Lab"
        featureDescription="The full 4-stage Scripture study journey is available for Legacy Sower and Covenant Sower subscribers."
      >
        {children}
      </Gate>
    </main>
  );
}
