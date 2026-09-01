import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { AuthHighlightText } from "./AuthHighlightText";

interface VerifyFormPanelProps {
  backToLoginLabel: string;
  verifyEmailLabel: string;
  enterCodeLabel: string;
  appName: string;
  children: ReactNode;
}

export function VerifyFormPanel({ backToLoginLabel, verifyEmailLabel, enterCodeLabel, appName, children }: VerifyFormPanelProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="lg:hidden flex flex-col items-center gap-4 mb-2">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center p-3 shadow-lg">
            <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              {appName.toUpperCase()}
            </h2>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">{appName}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <AuthHighlightText to="/login">
              <ArrowLeft className="w-4 h-4" />
            </AuthHighlightText>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
              {verifyEmailLabel}
            </h1>
          </div>
          <p className="text-muted-foreground">{enterCodeLabel}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
