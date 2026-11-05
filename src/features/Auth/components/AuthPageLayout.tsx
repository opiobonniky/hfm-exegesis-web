import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import { RegisterBrandedPanel } from "./RegisterBrandedPanel";
import { tt } from "@/components/languages/hardcodedTranslate";

export function AuthFormSurface({ children }: { children: ReactNode }) {
  return <div className="relative w-full overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-foreground/[0.04] sm:p-9">
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
    {children}
  </div>;
}

export function AuthProgress({ steps, current }: { steps: string[]; current: number }) {
  return <ol aria-label={tt("Your progress")} className="mb-7 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
    {steps.map((label, i) => <li key={label} aria-current={current === i + 1 ? "step" : undefined} className="min-w-0 space-y-2">
      <div className={`h-1 rounded-full ${current > i ? "bg-primary" : "bg-muted"}`} />
      <span className={`block text-[11px] leading-4 sm:text-xs ${current === i + 1 ? "font-semibold text-primary" : "text-muted-foreground"}`}>{tt(label)}</span>
    </li>)}
  </ol>;
}

export function AuthPageLayout({ children, title, description, eyebrow = "Your account", isRtl = false, backToLogin = true, asideTitle = "A little space for a deeper faith.", asideDescription = "Read with purpose. Reflect on what matters. Carry the Word into your everyday life." }: {
  children: ReactNode; title?: string; description?: string; eyebrow?: string; isRtl?: boolean; backToLogin?: boolean; asideTitle?: string; asideDescription?: string;
}) {
  return <div className="flex min-h-dvh bg-background lg:h-dvh lg:overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
    <RegisterBrandedPanel logoSrc={logoImage} title={tt(asideTitle)} description={tt(asideDescription)} year={new Date().getFullYear()} />
    <main className="relative min-w-0 flex-1 overflow-y-auto">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/[0.07] to-transparent" />
      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" aria-label={tt("Exegesis home")} className="flex items-center gap-2 text-sm font-semibold tracking-wider"><img src={logoImage} alt="" className="size-9 object-contain" />EXEGESIS</Link>
          {backToLogin && <Link to="/login" className="flex min-h-10 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5 rtl:rotate-180" />{tt("Back to sign in")}</Link>}
        </div>
        <AuthFormSurface>
          {title && <header className="mb-7"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{tt(eyebrow)}</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>}</header>}
          {children}
        </AuthFormSurface>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />{tt("Your journey. Your account. Securely yours.")}</p>
      </div>
    </main>
  </div>;
}
