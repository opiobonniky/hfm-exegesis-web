import type { ReactNode } from "react";
import { Gate } from "@/components/Gate";

interface LabDictionaryWorkspaceProps {
  children: ReactNode;
}

export function LabDictionaryWorkspace({ children }: LabDictionaryWorkspaceProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-16">
        <Gate
          featureName="Dictionary"
          featureDescription="The full word study dictionary with original language analysis is available for Legacy Sower and Covenant Sower subscribers."
        >
          {children}
        </Gate>
      </section>
    </main>
  );
}
