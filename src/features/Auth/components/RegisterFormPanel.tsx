import { AuthStepIndicator, AuthAccountLink } from "../components";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

interface RegisterFormPanelProps {
  createAccountLabel: string;
  haveAccountLabel: string;
  loginLabel: string;
  step: number;
  children: React.ReactNode;
}

export function RegisterFormPanel({ createAccountLabel, haveAccountLabel, loginLabel, step, children }: RegisterFormPanelProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10">
      <div className="max-w-md mx-auto w-full">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src={logoImage} alt="Exegesis" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>EXEGESIS</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-1">{createAccountLabel}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {haveAccountLabel}{" "}
          <AuthAccountLink to="/login" label={loginLabel} />
        </p>

        <AuthStepIndicator step={step} totalSteps={2} />

        {children}
      </div>
    </div>
  );
}
