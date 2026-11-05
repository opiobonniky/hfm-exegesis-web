// GoogleRegister content wrapper
import { ReactNode } from "react";
import { AuthPageLayout } from "./AuthPageLayout";

interface GoogleRegisterWrapperProps {
  isRtl: boolean;
  children: ReactNode;
}

export function GoogleRegisterWrapper({ isRtl, children }: GoogleRegisterWrapperProps) {
  return (
    <AuthPageLayout isRtl={isRtl} asideTitle="One account. A richer study rhythm.">
      <div className="space-y-6">
        {children}
      </div>
    </AuthPageLayout>
  );
}
