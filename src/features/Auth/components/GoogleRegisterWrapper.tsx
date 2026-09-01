// GoogleRegister content wrapper
import { ReactNode } from "react";

interface GoogleRegisterWrapperProps {
  isRtl: boolean;
  children: ReactNode;
}

export function GoogleRegisterWrapper({ isRtl, children }: GoogleRegisterWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-[400px] space-y-6">
        {children}
      </div>
    </div>
  );
}
