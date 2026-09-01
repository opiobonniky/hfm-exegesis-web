import { useRegisterPage } from "../hooks/useRegisterPage";
import { AuthLoadingSpinner } from "../components";
import {
  RegisterBrandedPanel,
  RegisterFormPanel,
  RegisterNextButton,
  RegisterStepButtons,
  RegisterDivider,
  RegisterGoogleButton,
  AuthAccountLink,
} from "../components";
import FloatingInput from "../components/FloatingInput";
import { Mail, Lock, User, Phone } from "lucide-react";

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
      <RegisterBrandedPanel
        firstNameLabel={t.auth.firstName || "Begin Your Study Journey"}
        signUpLabel={t.auth.signUpWith || "Create an account to access Bible study tools, journaling, and more."}
        year={new Date().getFullYear()}
      />

      <RegisterFormPanel
        createAccountLabel={t.auth.createAccount || "Create Account"}
        haveAccountLabel={t.auth.dontHaveAccount || "Already have an account?"}
        loginLabel={t.auth.login || "Log in"}
        step={step}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <FloatingInput id="firstName" label={t.auth.firstName || "First Name"} icon={User} value={formData.firstName} onChange={handleChange} focused={focusedField === "firstName"} setFocused={setFocusedField} handleBlur={() => handleBlur("firstName")} error={getFieldError("firstName")} touched={touchedFields.firstName} />
              <FloatingInput id="lastName" label={t.auth.lastName || "Last Name"} icon={User} value={formData.lastName} onChange={handleChange} focused={focusedField === "lastName"} setFocused={setFocusedField} handleBlur={() => handleBlur("lastName")} error={getFieldError("lastName")} touched={touchedFields.lastName} />
              <FloatingInput id="email" label={t.common.email || "Email"} icon={Mail} value={formData.email} onChange={handleChange} focused={focusedField === "email"} setFocused={setFocusedField} handleBlur={() => handleBlur("email")} error={getFieldError("email")} touched={touchedFields.email} type="email" />
              <FloatingInput id="phoneNumber" label={t.auth.phoneNumber || "Phone (optional)"} icon={Phone} value={formData.phoneNumber} onChange={handleChange} focused={focusedField === "phoneNumber"} setFocused={setFocusedField} handleBlur={() => handleBlur("phoneNumber")} error={getFieldError("phoneNumber")} touched={touchedFields.phoneNumber} type="tel" />
              <RegisterNextButton label={t.auth.continueBtn || "Next"} onClick={() => setStep(2)} />
            </>
          ) : (
            <>
              <FloatingInput id="password" label={t.common.password || "Password"} icon={Lock} value={formData.password} onChange={handleChange} focused={focusedField === "password"} setFocused={setFocusedField} handleBlur={() => handleBlur("password")} error={getFieldError("password")} touched={touchedFields.password} type="password" isPassword showPassword={showPassword} setShowPassword={setShowPassword} />
              <FloatingInput id="confirmPassword" label={t.common.confirmPassword || "Confirm Password"} icon={Lock} value={formData.confirmPassword} onChange={handleChange} focused={focusedField === "confirmPassword"} setFocused={setFocusedField} handleBlur={() => handleBlur("confirmPassword")} error={getFieldError("confirmPassword")} touched={touchedFields.confirmPassword} type="password" isPassword showPassword={showPassword} setShowPassword={setShowPassword} />
              <RegisterStepButtons
                backLabel={t.common?.back || "Back"}
                submitLabel={t.auth.createAccount || "Create Account"}
                isLoading={isLoading}
                onBack={() => setStep(1)}
              />
            </>
          )}
        </form>

        <RegisterDivider label={t.auth.signInWithGoogle || "or continue with"} />

        <RegisterGoogleButton
          label={t.auth.signInWithGoogle || "Continue with Google"}
          isLoading={isGoogleLoading}
          onClick={handleGoogleLogin}
        />
      </RegisterFormPanel>
    </div>
  );
}
