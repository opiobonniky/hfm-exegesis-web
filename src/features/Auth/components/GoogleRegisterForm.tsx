import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { useGoogleRegisterPage } from "../hooks/useGoogleRegisterPage";
import { RegistrationPhotoPicker } from "./RegistrationPhotoPicker";
import { RegistrationPasswordChecklist } from "./RegistrationPasswordChecklist";

export function GoogleRegisterForm({ model }: { model: ReturnType<typeof useGoogleRegisterPage> }) {
  const { data: p, actions: a } = model;
  const inputClass = "mt-2 h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60";
  return <form onSubmit={a.handleRegister} noValidate className="space-y-5">
    <div className="grid grid-cols-2 gap-3" aria-label={`${tt("Step")} ${p.step} ${tt("of")} 2`}>{["Your profile", "Secure account"].map((label, i) => <div key={label}><div className={`mb-2 h-1.5 rounded-full ${p.step > i ? "bg-primary" : "bg-muted"}`} /><span aria-current={p.step === i + 1 ? "step" : undefined} className="text-xs font-semibold">{tt(label)}</span></div>)}</div>
    {!p.state?.registrationProof ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{tt("Your Google sign-in has expired. Please sign in again.")}</p> : <>
      <fieldset disabled={p.loading} className="space-y-4">
        {p.step === 1 ? <>
          <RegistrationPhotoPicker value={p.profilePhoto} onChange={a.setProfilePhoto} disabled={p.loading} />
          <label className="block text-sm font-medium" htmlFor="google-username">{tt("Username")}<input id="google-username" autoComplete="username" value={p.username} onChange={e => a.setUsername(e.target.value.replace(/\s/g, "").toLowerCase())} className={inputClass} /></label>
          <label className="block text-sm font-medium" htmlFor="google-phone">{tt("Phone (optional)")}<input id="google-phone" type="tel" autoComplete="tel" value={p.phoneNumber} onChange={e => a.setPhoneNumber(e.target.value)} className={inputClass} /></label>
          <label className="block text-sm font-medium" htmlFor="google-gender">{tt("Gender (optional)")}<select id="google-gender" value={p.gender} onChange={e => a.setGender(e.target.value)} className={inputClass}>{["Not Specified", "Male", "Female", "Other"].map(v => <option key={v} value={v}>{tt(v)}</option>)}</select></label>
        </> : <>
          {([false, true] as const).map(confirm => {
            const visible = confirm ? p.showConfirmPassword : p.showPassword;
            return <label key={String(confirm)} className="block text-sm font-medium" htmlFor={confirm ? "google-confirm" : "google-password"}>{tt(confirm ? "Confirm Password" : "Create Password")}
              <div className="relative"><input id={confirm ? "google-confirm" : "google-password"} type={visible ? "text" : "password"} autoComplete="new-password" value={confirm ? p.confirmPassword : p.password} onChange={e => (confirm ? a.setConfirmPassword : a.setPassword)(e.target.value)} className={`${inputClass} pe-12`} /><button type="button" onClick={() => (confirm ? a.setShowConfirmPassword : a.setShowPassword)(!visible)} aria-label={tt(visible ? "Hide password" : "Show password")} aria-pressed={visible} className="absolute end-2 top-3 grid size-10 place-items-center text-muted-foreground">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
            </label>;
          })}
          <RegistrationPasswordChecklist password={p.password} />
        </>}
      </fieldset>
      {p.error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{tt(p.error)}</p>}
      <div className="flex gap-3">{p.step === 2 && <Button type="button" disabled={p.loading} variant="outline" onClick={() => a.setStep(1)}><ArrowLeft className="me-2 size-4 rtl:rotate-180" />{tt("Back")}</Button>}<Button type="submit" disabled={p.loading} className="min-h-12 flex-1 gap-2 rounded-xl">{p.loading && <Loader2 className="size-4 animate-spin" />}{tt(p.step === 1 ? "Continue" : "Create Account")}<ArrowRight className="size-4 rtl:rotate-180" /></Button></div>
    </>}
  </form>;
}
