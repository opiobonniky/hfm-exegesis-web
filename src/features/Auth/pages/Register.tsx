import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import { useRegisterPage } from "../hooks/useRegisterPage";
import { RegisterBrandedPanel, RegisterFormPanel, RegisterGoogleButton } from "../components";
import FloatingInput from "../components/FloatingInput";
import { RegistrationPhotoPicker } from "../components/RegistrationPhotoPicker";
import { RegistrationPasswordChecklist } from "../components/RegistrationPasswordChecklist";
import { AtSign, Mail, Lock, User, Phone, Calendar, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { tt } from "@/components/languages/hardcodedTranslate";
import { Button } from "@/components/ui/button";

export default function Register() {
  const { data: p, actions: a } = useRegisterPage();
  const busy = p.isLoading || p.isGoogleLoading;
  const field = (id: keyof typeof p.formData, label: string, icon: typeof User, type = "text", autoComplete = "off") => (
    <FloatingInput id={id} label={tt(label)} icon={icon} value={p.formData[id]} onChange={a.handleChange}
      focused={p.focusedField === id} setFocused={a.setFocusedField} handleBlur={() => a.handleBlur(id)}
      error={tt(a.getFieldError(id))} touched={!!p.touchedFields[id]} type={type} autoComplete={autoComplete}
      isPassword={type === "password"} showPassword={id === "confirmPassword" ? p.showConfirmPassword : p.showPassword}
      setShowPassword={id === "confirmPassword" ? a.setShowConfirmPassword : a.setShowPassword} />
  );
  return <div className="flex min-h-dvh bg-background lg:h-dvh lg:overflow-hidden" dir={p.isRtl ? "rtl" : "ltr"}>
    <RegisterBrandedPanel logoSrc={logoImage} title={tt("Go deeper than reading alone.")} description={tt("Build a lasting rhythm of study, reflection, and faithful application.")} year={new Date().getFullYear()} />
    <RegisterFormPanel logoSrc={logoImage} createAccountLabel={tt(p.step === 4 ? "Verify your email" : "Create your account")} haveAccountLabel={tt("Already have an account?")} loginLabel={tt("Log in")} step={p.step}>
      <form onSubmit={a.handleSubmit} noValidate className="space-y-5">
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-70">
          {p.step === 1 && <>
            <RegistrationPhotoPicker value={p.profilePhoto} onChange={a.setProfilePhoto} disabled={busy} />
            <div className="grid gap-3 sm:grid-cols-2">{field("firstName", "First Name", User, "text", "given-name")}{field("lastName", "Last Name", User, "text", "family-name")}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {field("dateOfBirth", "Date of birth (optional)", Calendar, "date", "bday")}
              <label className="block text-sm font-medium">{tt("Gender (optional)")}<select name="gender" value={p.formData.gender} onChange={a.handleChange} className="mt-2 h-12 w-full rounded-xl border bg-card px-3">{["Not Specified", "Male", "Female", "Other"].map(v => <option key={v} value={v}>{tt(v)}</option>)}</select></label>
            </div>
          </>}
          {p.step === 2 && <>
            {field("email", "Email", Mail, "email", "email")}
            {field("username", "Username", AtSign, "text", "username")}
            {field("phoneNumber", "Phone (optional)", Phone, "tel", "tel")}
          </>}
          {p.step === 3 && <>
            {field("password", "Password", Lock, "password", "new-password")}
            <RegistrationPasswordChecklist password={p.formData.password} />
            {field("confirmPassword", "Confirm Password", Lock, "password", "new-password")}
          </>}
          {p.step === 4 && <div className="space-y-5 text-center">
            <ShieldCheck className="mx-auto size-12 text-primary" />
            <p className="text-sm text-muted-foreground">{tt("Enter the 6-digit code sent to")} <strong className="break-all text-foreground">{p.formData.email}</strong></p>
            <label className="block text-sm font-medium" htmlFor="registration-code">{tt("Verification code")}</label>
            <input id="registration-code" value={p.code} onChange={e => a.setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus dir="ltr" className="h-16 w-full rounded-xl border bg-card text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:ring-2 focus:ring-primary" />
            <button type="button" disabled={busy || p.resendSeconds > 0} onClick={a.handleResend} className="text-sm font-semibold text-primary disabled:text-muted-foreground">{p.resendSeconds ? `${tt("Resend code in")} ${p.resendSeconds}s` : tt("Resend code")}</button>
          </div>}
        </fieldset>
        {p.error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{tt(p.error)}</p>}
        <div className="flex gap-3">
          {p.step > 1 && p.step < 4 && <Button type="button" variant="outline" disabled={busy} onClick={() => a.setStep(p.step - 1)}><ArrowLeft className="me-2 size-4 rtl:rotate-180" />{tt("Back")}</Button>}
          <Button type="submit" disabled={busy} className="min-h-12 flex-1 gap-2 rounded-xl">{p.isLoading ? <Loader2 className="size-4 animate-spin" /> : null}{tt(p.step === 4 ? "Verify email" : p.step === 3 ? "Create Account" : "Continue")}<ArrowRight className="size-4 rtl:rotate-180" /></Button>
        </div>
      </form>
      {p.step < 4 && <div className="mt-6 border-t pt-5"><RegisterGoogleButton label={tt("Continue with Google")} isLoading={busy} onClick={a.handleGoogleLogin} /></div>}
    </RegisterFormPanel>
  </div>;
}
