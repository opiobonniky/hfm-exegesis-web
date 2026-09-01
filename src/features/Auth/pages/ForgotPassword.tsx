import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useForgotPasswordPage } from "../hooks/useForgotPasswordPage";
import FloatingInput from "../components/FloatingInput";
import {
  AuthAnimatedEntrance, AuthFormCard,
  AuthBrandedPanelDesktop, AuthLoadingSpinner,
  ForgotPasswordSubmitButton, ForgotPasswordFormContent,
  ForgotPasswordFooter, ForgotPasswordContentWrapper,
} from "../components";
import { AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock } from "lucide-react";

export default function ForgotPassword() {
  const h = useForgotPasswordPage();
  return (
    <div className="min-h-screen flex bg-muted overflow-hidden relative" dir={h.isRtl ? "rtl" : "ltr"}>
      <AuthAnimatedEntrance />

      <ForgotPasswordContentWrapper>
        <AuthFormCard>
          <ForgotPasswordFormContent
            badgeLabel={h.step === "email" ? (h.t.auth?.accountRecovery || "Account Recovery") : (h.t.auth?.securityUpdate || "Security Update")}
            heading={h.step === "email" ? (h.t.auth?.forgotPassword || "Forgot Password?") : (h.t.auth?.resetPassword || "Reset Password")}
            description={h.step === "email" ? (h.t.auth?.enterEmailForRecovery || "Enter your email to receive a recovery code.") : (h.t.auth?.enterCodeAndPassword || "Enter the 6-digit code and your new password.")}
            logoSrc={""}
          >
            <AnimatePresence mode="wait">
              {h.step === "email" ? (
                <form key="email" onSubmit={h.handleRequestReset} className="space-y-6">
                  <FloatingInput id="email" label={h.t.common?.email || "Email Address"} icon={Mail}
                    type="email" value={h.email} onChange={(e) => h.setEmail(e.target.value)}
                    focused={h.focusedField === "email"} setFocused={h.setFocusedField}
                    handleBlur={() => h.handleBlur("email")} error={h.getFieldError("email")} touched={!!h.touchedFields.email} />
                  <ForgotPasswordSubmitButton isLoading={h.isLoading}>
                    {h.t.auth?.sendResetCode || "Send Reset Code"} <ArrowRight className="w-5 h-5" />
                  </ForgotPasswordSubmitButton>
                </form>
              ) : (
                <form key="reset" onSubmit={h.handleResetPassword} className="space-y-6">
                  <FloatingInput id="code" label={h.t.auth?.resetCode || "Reset Code"} icon={KeyRound}
                    value={h.code} onChange={(e) => h.setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    focused={h.focusedField === "code"} setFocused={h.setFocusedField}
                    handleBlur={() => h.handleBlur("code")} error={h.getFieldError("code")} touched={!!h.touchedFields.code}
                    autoComplete="one-time-code" />
                  <FloatingInput id="newPassword" label={h.t.common?.password || "New Password"} icon={Lock}
                    type={h.showPassword ? "text" : "password"} value={h.newPassword}
                    onChange={(e) => h.setNewPassword(e.target.value)}
                    focused={h.focusedField === "newPassword"} setFocused={h.setFocusedField}
                    handleBlur={() => h.handleBlur("newPassword")} error={h.getFieldError("newPassword")}
                    touched={!!h.touchedFields.newPassword} isPassword showPassword={h.showPassword}
                    setShowPassword={h.setShowPassword} autoComplete="new-password" />
                  <FloatingInput id="confirmPassword" label={h.t.common?.confirmPassword || "Confirm Password"} icon={Lock}
                    type={h.showPassword ? "text" : "password"} value={h.confirmPassword}
                    onChange={(e) => h.setConfirmPassword(e.target.value)}
                    focused={h.focusedField === "confirmPassword"} setFocused={h.setFocusedField}
                    handleBlur={() => h.handleBlur("confirmPassword")} error={h.getFieldError("confirmPassword")}
                    touched={!!h.touchedFields.confirmPassword} autoComplete="new-password" />
                  <ForgotPasswordSubmitButton isLoading={h.isLoading}>
                    {h.t.auth?.resetPassword || "Reset Password"} <CheckCircle2 className="w-5 h-5" />
                  </ForgotPasswordSubmitButton>
                </form>
              )}
            </AnimatePresence>

            <ForgotPasswordFooter
              rememberLabel={h.t.auth?.rememberPassword || "Remember your password?"}
              signInLabel={h.t.auth?.signIn || "Sign in"}
              backToLoginLabel={h.t.auth?.backToLogin || "Back to Login"}
            />
          </ForgotPasswordFormContent>
        </AuthFormCard>
      </ForgotPasswordContentWrapper>

      <AuthBrandedPanelDesktop
        logoSrc={""}
        heading={h.t.auth?.resetYourPath || "Reset your Path."}
        quote={h.t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path."}
        attribution={h.t.auth?.psalmReference || "Psalm 119:105"}
      />
    </div>
  );
}
