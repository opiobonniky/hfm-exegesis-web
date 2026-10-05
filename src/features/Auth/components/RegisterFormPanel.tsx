import { AuthAccountLink, AuthLogo } from "../components";
import { tt } from "@/components/languages/hardcodedTranslate";

interface RegisterFormPanelProps {
  logoSrc: string;
  createAccountLabel: string;
  haveAccountLabel: string;
  loginLabel: string;
  step: number;
  children: React.ReactNode;
}

export function RegisterFormPanel({ logoSrc, createAccountLabel, haveAccountLabel, loginLabel, step, children }: RegisterFormPanelProps) {
  return (
    <main className="relative flex-1 overflow-y-auto bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-10 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-24 bottom-0 size-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl items-center px-4 py-8 sm:px-8 lg:py-12">
        <div className="w-full rounded-[2rem] border border-border/70 bg-card/90 px-5 py-7 shadow-2xl shadow-foreground/5 backdrop-blur-sm sm:px-10 sm:py-9">
          <div className="flex justify-center">
            <AuthLogo src={logoSrc} linkTo="/" size="w-24 h-24 sm:w-28 sm:h-28" />
          </div>

          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              {tt("Step")} {step} {tt("of")} 2
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{createAccountLabel}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {haveAccountLabel}{" "}
              <AuthAccountLink to="/login" label={loginLabel} />
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-2" aria-label={`${tt("Step")} ${step} ${tt("of")} 2`}>
            {[tt("Your details"), tt("Secure account")].map((label, index) => {
              const stepNumber = index + 1;
              const isActive = step >= stepNumber;

              return (
                <div key={label} className="space-y-2">
                  <div className={`h-1.5 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-muted"}`} />
                  <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                </div>
              );
            })}
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
