import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, KeyRound, Lock, Loader2 } from "lucide-react";
import { useForgotPasswordPage } from "../hooks/useForgotPasswordPage";
import FloatingInput from "../components/FloatingInput";
import { AuthPageLayout, AuthProgress } from "../components/AuthPageLayout";
import { RegistrationPasswordChecklist } from "../components/RegistrationPasswordChecklist";
import { GuestReadingLink } from "../components/GuestReadingLink";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";

export default function ForgotPassword() {
  const { data: h, actions: a } = useForgotPasswordPage();
  const [showConfirm, setShowConfirm] = useState(false);
  const reset = h.step === "reset";
  return <AuthPageLayout isRtl={h.isRtl} eyebrow="Account recovery" title={tt(reset ? "Choose a new password" : "Let's get you back in")} description={tt(reset ? "Enter the code from your email, then choose a strong password for your account." : "Forgot your password? We'll send you a code to help you securely reset it.")} asideTitle="Your next chapter is waiting.">
    <AuthProgress steps={["Your email", "Reset password"]} current={reset ? 2 : 1} />
    {reset && <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 px-4 py-3"><span className="min-w-0 break-all text-sm text-muted-foreground">{h.email}</span><button type="button" disabled={h.isLoading} onClick={() => a.setStep("email")} className="text-xs font-semibold text-primary">{tt("Change email")}</button></div>}
    <form onSubmit={reset ? a.handleResetPassword : a.handleRequestReset} noValidate className="space-y-5">
      <fieldset disabled={h.isLoading} className="space-y-4">
        {!reset ? <FloatingInput id="email" label={tt("Email address")} icon={Mail} type="email" autoComplete="email" value={h.email} onChange={e => a.setEmail(e.target.value)} focused={h.focusedField === "email"} setFocused={a.setFocusedField} handleBlur={() => a.handleBlur("email")} error={a.getFieldError("email")} touched={!!h.touchedFields.email} /> : <>
          <FloatingInput id="code" label={tt("6-digit recovery code")} icon={KeyRound} value={h.code} onChange={e => a.setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoComplete="one-time-code" inputMode="numeric" focused={h.focusedField === "code"} setFocused={a.setFocusedField} handleBlur={() => a.handleBlur("code")} error={a.getFieldError("code")} touched={!!h.touchedFields.code} />
          <FloatingInput id="newPassword" label={tt("New password")} icon={Lock} type="password" isPassword showPassword={h.showPassword} setShowPassword={a.setShowPassword} autoComplete="new-password" value={h.newPassword} onChange={e => a.setNewPassword(e.target.value)} focused={h.focusedField === "newPassword"} setFocused={a.setFocusedField} handleBlur={() => a.handleBlur("newPassword")} error={a.getFieldError("newPassword")} touched={!!h.touchedFields.newPassword} />
          <RegistrationPasswordChecklist password={h.newPassword} />
          <FloatingInput id="confirmPassword" label={tt("Confirm password")} icon={Lock} type="password" isPassword showPassword={showConfirm} setShowPassword={setShowConfirm} autoComplete="new-password" value={h.confirmPassword} onChange={e => a.setConfirmPassword(e.target.value)} focused={h.focusedField === "confirmPassword"} setFocused={a.setFocusedField} handleBlur={() => a.handleBlur("confirmPassword")} error={a.getFieldError("confirmPassword")} touched={!!h.touchedFields.confirmPassword} />
        </>}
      </fieldset>
      <Button type="submit" disabled={h.isLoading} className="h-12 w-full gap-2 rounded-xl">{h.isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 rtl:rotate-180" />}{tt(reset ? "Reset password" : "Send recovery code")}</Button>
    </form>
    <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">{tt("Remember your password?")} <Link to="/login" className="font-semibold text-primary">{tt("Sign in")}</Link></p>
    <div className="mt-4"><GuestReadingLink disabled={h.isLoading} /></div>
  </AuthPageLayout>;
}
