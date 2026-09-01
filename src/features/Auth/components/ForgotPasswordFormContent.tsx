// ForgotPassword form content container component
import { ReactNode } from "react";
import { AuthBadge, AuthLogoImage } from "../components";

interface ForgotPasswordFormContentProps {
  badgeLabel: string;
  heading: string;
  description: string;
  logoSrc: string;
  children: ReactNode;
}

export function ForgotPasswordFormContent({ badgeLabel, heading, description, logoSrc, children }: ForgotPasswordFormContentProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 mb-2">
        <AuthLogoImage src={logoSrc} />
      </div>

      <div className="space-y-3 text-center">
        <AuthBadge label={badgeLabel} />
        <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">
          {heading}
        </h1>
        <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {children}
    </>
  );
}
