import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthAccountLink } from "./AuthAccountLink";
import { AuthFormSurface, AuthProgress } from "./AuthPageLayout";
import { GuestReadingLink } from "./GuestReadingLink";
import { tt } from "@/components/languages/hardcodedTranslate";

interface RegisterFormPanelProps {
  logoSrc: string; createAccountLabel: string; haveAccountLabel: string; loginLabel: string; step: number; steps?: string[]; children: React.ReactNode;
}

export function RegisterFormPanel({ logoSrc, createAccountLabel, haveAccountLabel, loginLabel, step, steps = ["Your profile", "Account details", "Secure account", "Verify email"], children }: RegisterFormPanelProps) {
  return <main className="relative min-w-0 flex-1 overflow-y-auto bg-background">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/[0.07] to-transparent" />
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-4 py-8 sm:px-8 lg:py-10">
      <div className="mb-6 flex items-center justify-between gap-3"><Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-wider"><img src={logoSrc} alt="" className="size-9 object-contain" />EXEGESIS</Link><Link to="/login" className="flex min-h-10 items-center gap-2 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5 rtl:rotate-180" />{tt("Back to sign in")}</Link></div>
      <AuthFormSurface>
        <header className="mb-6"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{tt("Step")} {step} {tt("of")} {steps.length}</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{createAccountLabel}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{tt(step === 4 ? "You're almost ready. Confirm your email to start your journey." : "Make room for a daily rhythm of reading, reflection, and growth.")}</p></header>
        <AuthProgress steps={steps} current={step} />
        {children}
        <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">{haveAccountLabel} <AuthAccountLink to="/login" label={loginLabel} /></p>
      </AuthFormSurface>
      {step < 4 && <div className="mt-4"><GuestReadingLink /></div>}
    </div>
  </main>;
}
