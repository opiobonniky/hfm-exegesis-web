import { Link } from "react-router-dom";
import { Mail, Lock, User, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import googleIcon from "@/assets/icons/google-icon.svg";
import { useRegisterPage } from "../hooks/useRegisterPage";
import FloatingInput from "../components/FloatingInput";

export default function Register() {
  const p = useRegisterPage();
  const {
    t, isRtl, step, setStep, formData, showPassword, setShowPassword,
    isLoading, isGoogleLoading, focusedField, setFocusedField,
    touchedFields, getFieldError, handleChange, handleBlur,
    handleSubmit, handleGoogleLogin,
  } = p;
  return (
    <div className="min-h-screen flex bg-muted overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Exegesis" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>EXEGESIS</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-3 leading-tight">{t.register?.title || "Begin Your Study Journey"}</h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">{t.register?.subtitle || "Create an account to access Bible study tools, journaling, and more."}</p>
          <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} Exegesis Project</p>
      </div>
      {/* Right Panel (Form) */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10">
        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logoImage} alt="Exegesis" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>EXEGESIS</span>
          <h2 className="text-2xl font-bold text-foreground mb-1">{t.register?.createAccount || "Create Account"}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t.register?.alreadyHave || "Already have an account?"}{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">{t.common?.login || "Log in"}</Link>
          </p>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${step >= s ? "bg-primary" : "bg-muted"}`} />
            ))}
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <FloatingInput id="firstName" label={t.register?.firstName || "First Name"} icon={User} value={formData.firstName} onChange={handleChange} focused={focusedField === "firstName"} setFocused={setFocusedField} handleBlur={() => handleBlur("firstName")} error={getFieldError("firstName")} touched={touchedFields.firstName} />
                <FloatingInput id="lastName" label={t.register?.lastName || "Last Name"} icon={User} value={formData.lastName} onChange={handleChange} focused={focusedField === "lastName"} setFocused={setFocusedField} handleBlur={() => handleBlur("lastName")} error={getFieldError("lastName")} touched={touchedFields.lastName} />
                <FloatingInput id="email" label={t.register?.email || "Email"} icon={Mail} value={formData.email} onChange={handleChange} focused={focusedField === "email"} setFocused={setFocusedField} handleBlur={() => handleBlur("email")} error={getFieldError("email")} touched={touchedFields.email} type="email" />
                <FloatingInput id="phoneNumber" label={t.register?.phone || "Phone (optional)"} icon={Phone} value={formData.phoneNumber} onChange={handleChange} focused={focusedField === "phoneNumber"} setFocused={setFocusedField} handleBlur={() => handleBlur("phoneNumber")} error={getFieldError("phoneNumber")} touched={touchedFields.phoneNumber} type="tel" />
                <button type="button" onClick={() => setStep(2)} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  {t.register?.next || "Next"} <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
                <FloatingInput id="password" label={t.register?.password || "Password"} icon={Lock} value={formData.password} onChange={handleChange} focused={focusedField === "password"} setFocused={setFocusedField} handleBlur={() => handleBlur("password")} error={getFieldError("password")} touched={touchedFields.password} type="password" isPassword showPassword={showPassword} setShowPassword={setShowPassword} />
                <FloatingInput id="confirmPassword" label={t.register?.confirmPassword || "Confirm Password"} icon={Lock} value={formData.confirmPassword} onChange={handleChange} focused={focusedField === "confirmPassword"} setFocused={setFocusedField} handleBlur={() => handleBlur("confirmPassword")} error={getFieldError("confirmPassword")} touched={touchedFields.confirmPassword} type="password" isPassword showPassword={showPassword} setShowPassword={setShowPassword} />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="h-12 px-6 rounded-2xl border border-border font-bold text-sm flex items-center gap-2 hover:bg-muted transition-all">
                    <ChevronLeft className="w-4 h-4" />{t.common?.back || "Back"}
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.register?.createAccount || "Create Account"}
                </div>
            )}
          </form>
          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t.register?.orContinue || "or continue with"}</span>
          {/* Google */}
          <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full h-12 rounded-2xl border border-border bg-card font-bold text-sm flex items-center justify-center gap-3 hover:bg-muted transition-all disabled:opacity-50">
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              <><img src={googleIcon} alt="Google" className="w-5 h-5" />{t.register?.continueWithGoogle || "Continue with Google"}</>
          </button>
    </div>
  );
}
