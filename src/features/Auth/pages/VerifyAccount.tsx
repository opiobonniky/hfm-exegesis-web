import { Link } from "react-router-dom";
import { Mail, KeyRound, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useVerifyAccountPage } from "../hooks/useVerifyAccountPage";
import { AuthPageLayout } from "../components/AuthPageLayout";
import { VerifyInputField } from "../components/VerifyInputField";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";

export default function VerifyAccount() {
  const { data: p, actions: a } = useVerifyAccountPage();
  const busy = p.isLoading || p.isResending;
  return <AuthPageLayout isRtl={p.isRtl} eyebrow="One last step" title={tt("Check your inbox")} description={tt("Verify your email to make this account yours. Enter the 6-digit code we sent you.")} asideTitle="A thoughtful beginning.">
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-6 text-muted-foreground">{tt("Only use a code sent to your own email. Can't find it? Check your spam folder or request a new code below.")}</p></div>
    <form onSubmit={a.handleVerify} className="space-y-5">
      <fieldset disabled={busy} className="space-y-5">
        <VerifyInputField id="email" label={tt("Email address")} icon={Mail} placeholder="you@example.com" value={p.email} onChange={a.setEmail} readOnly={p.emailLocked} required />
        <VerifyInputField id="code" label={tt("Verification code")} icon={KeyRound} placeholder="000000" value={p.code} onChange={v => a.setCode(v.replace(/\D/g, "").slice(0, 6))} isCode required />
      </fieldset>
      {p.error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{p.error}</p>}
      <Button type="submit" disabled={busy || !p.email.trim() || p.code.length !== 6} className="h-12 w-full gap-2 rounded-xl">{p.isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 rtl:rotate-180" />}{tt("Verify email")}</Button>
    </form>
    <div className="mt-6 space-y-4 border-t pt-5 text-center text-sm"><p className="text-muted-foreground">{tt("Didn't receive the code?")} <button type="button" onClick={a.handleResend} disabled={busy || !p.email.trim()} className="font-semibold text-primary disabled:opacity-50">{tt(p.isResending ? "Sending..." : "Resend code")}</button></p><Link to="/register" className="inline-block text-muted-foreground underline underline-offset-4 hover:text-primary">{tt("Create a different account")}</Link></div>
  </AuthPageLayout>;
}
