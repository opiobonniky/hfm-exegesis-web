// ForgotPassword content wrapper
import { ReactNode } from "react";
import { AuthBackgroundBlobs } from "./AuthBackgroundBlobs";

interface ForgotPasswordContentWrapperProps {
  children: ReactNode;
}

export function ForgotPasswordContentWrapper({ children }: ForgotPasswordContentWrapperProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-20">
      <AuthBackgroundBlobs />
      <div className="w-full max-w-[440px] z-10">
        {children}
      </div>
    </div>
  );
}
