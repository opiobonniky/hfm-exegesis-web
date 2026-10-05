import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import { useRegisterPage } from "../hooks/useRegisterPage";
import {
  RegisterBrandedPanel,
  RegisterFormPanel,
  RegisterNextButton,
  RegisterStepButtons,
  RegisterDivider,
  RegisterGoogleButton,
} from "../components";
import FloatingInput from "../components/FloatingInput";
import { AtSign, Mail, Lock, User, Phone } from "lucide-react";
import { tt } from '@/components/languages/hardcodedTranslate';

export default function Register() {
  const { data, actions } = useRegisterPage();
  const p = { ...data, ...actions };
  const {
    t, isRtl, step, setStep, formData, showPassword, setShowPassword,
    isLoading, isGoogleLoading, focusedField, setFocusedField,
    touchedFields, getFieldError, handleChange, handleBlur,
    handleSubmit, handleGoogleLogin,
  } = p;

  return (
    <div className="min-h-dvh lg:h-dvh flex bg-background lg:overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <RegisterBrandedPanel
        logoSrc={logoImage}
        title={tt("Go deeper than reading alone.")}
        description={tt("Build a lasting rhythm of study, reflection, and faithful application.")}
        year={new Date().getFullYear()}
      />

      <RegisterFormPanel
        logoSrc={logoImage}
        createAccountLabel={t.auth.createAccount || "Create Account"}
        haveAccountLabel={tt("Already have an account?")}
        loginLabel={t.auth.login || "Log in"}
        step={step}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <FloatingInput id="firstName" label={t.auth.firstName || tt("First Name")} icon={User} value={formData.firstName} onChange={handleChange} focused={focusedField === "firstName"} setFocused={setFocusedField} handleBlur={() => handleBlur("firstName")} error={getFieldError("firstName")} touched={touchedFields.firstName} />
              <FloatingInput id="lastName" label={t.auth.lastName || tt("Last Name")} icon={User} value={formData.lastName} onChange={handleChange} focused={focusedField === "lastName"} setFocused={setFocusedField} handleBlur={() => handleBlur("lastName")} error={getFieldError("lastName")} touched={touchedFields.lastName} />
              <FloatingInput id="username" label={tt("Username")} icon={AtSign} value={formData.username} onChange={handleChange} focused={focusedField === "username"} setFocused={setFocusedField} handleBlur={() => handleBlur("username")} error={getFieldError("username")} touched={touchedFields.username} autoComplete="username" />
              <FloatingInput id="email" label={t.common.email || tt("Email")} icon={Mail} value={formData.email} onChange={handleChange} focused={focusedField === "email"} setFocused={setFocusedField} handleBlur={() => handleBlur("email")} error={getFieldError("email")} touched={touchedFields.email} type="email" autoComplete="email" />
              <FloatingInput id="phoneNumber" label={t.auth.phoneNumber || tt("Phone (optional)")} icon={Phone} value={formData.phoneNumber} onChange={handleChange} focused={focusedField === "phoneNumber"} setFocused={setFocusedField} handleBlur={() => handleBlur("phoneNumber")} error={getFieldError("phoneNumber")} touched={touchedFields.phoneNumber} type="tel" autoComplete="tel" />
              <RegisterNextButton label={t.auth.continueBtn || "Next"} />
            </>
          ) : (
            <>
              <FloatingInput id="password" label={t.common.password || tt("Password")} icon={Lock} value={formData.password} onChange={handleChange} focused={focusedField === "password"} setFocused={setFocusedField} handleBlur={() => handleBlur("password")} error={getFieldError("password")} touched={touchedFields.password} type="password" autoComplete="new-password" isPassword showPassword={showPassword} setShowPassword={setShowPassword} />
              <FloatingInput id="confirmPassword" label={t.common.confirmPassword || tt("Confirm Password")} icon={Lock} value={formData.confirmPassword} onChange={handleChange} focused={focusedField === "confirmPassword"} setFocused={setFocusedField} handleBlur={() => handleBlur("confirmPassword")} error={getFieldError("confirmPassword")} touched={touchedFields.confirmPassword} type="password" autoComplete="new-password" isPassword showPassword={showPassword} setShowPassword={setShowPassword} />
              <RegisterStepButtons
                backLabel={t.common?.back || "Back"}
                submitLabel={t.auth.createAccount || tt("Create Account")}
                isLoading={isLoading}
                onBack={() => setStep(1)}
              />
            </>
          )}
        </form>

        <RegisterDivider label={t.auth.signInWithGoogle || tt("or continue with")} />

        <RegisterGoogleButton
          label={t.auth.signInWithGoogle || tt("Continue with Google")}
          isLoading={isGoogleLoading}
          onClick={handleGoogleLogin}
        />
      </RegisterFormPanel>
    </div>
  );
}
