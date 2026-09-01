import { ArrowLeft, ArrowRight, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useForgotPasswordPage } from "../hooks/useForgotPasswordPage";
import FloatingInput from "../components/FloatingInput";
import {
  AuthAnimatedEntrance, AuthFormCard, AuthBackgroundBlobs,
  AuthBrandedPanelDesktop, AuthLogoImage, AuthBadge, AuthLoadingSpinner,
} from "../components";

export default function ForgotPassword() {
  const h = useForgotPasswordPage();
  return (
    <div className="min-h-screen flex bg-muted overflow-hidden relative" dir={h.isRtl ? "rtl" : "ltr"}>
      <AuthAnimatedEntrance />

      <motion.div initial={{ x: "-100%", skewX: -5 }} animate={{ x: 0, skewX: 0 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-20">
        <AuthBackgroundBlobs />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }} className="w-full max-w-[440px] z-10">
          <AuthFormCard>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="flex flex-col items-center gap-3 mb-2">
              <AuthLogoImage src={logoImage} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
              className="space-y-3 text-center">
              <AuthBadge label={h.step === "email" ? (h.t.auth?.accountRecovery || "Account Recovery") : (h.t.auth?.securityUpdate || "Security Update")} />
              <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">
                {h.step === "email" ? (h.t.auth?.forgotPassword || "Forgot Password?") : (h.t.auth?.resetPassword || "Reset Password")}
              </h1>
              <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">
                {h.step === "email" ? (h.t.auth?.enterEmailForRecovery || "Enter your email to receive a recovery code.") : (h.t.auth?.enterCodeAndPassword || "Enter the 6-digit code and your new password.")}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {h.step === "email" ? (
                <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} onSubmit={h.handleRequestReset} className="space-y-6">
                  <FloatingInput id="email" label={h.t.common?.email || "Email Address"} icon={Mail}
                    type="email" value={h.email} onChange={(e) => h.setEmail(e.target.value)}
                    focused={h.focusedField === "email"} setFocused={h.setFocusedField}
                    handleBlur={() => h.handleBlur("email")} error={h.getFieldError("email")} touched={!!h.touchedFields.email} />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    disabled={h.isLoading}>
                    {h.isLoading ? <AuthLoadingSpinner />
                      : <>{h.t.auth?.sendResetCode || "Send Reset Code"} <ArrowRight className="w-5 h-5" /></>}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} onSubmit={h.handleResetPassword} className="space-y-6">
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
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    disabled={h.isLoading}>
                    {h.isLoading ? <AuthLoadingSpinner />
                      : <>{h.t.auth?.resetPassword || "Reset Password"} <CheckCircle2 className="w-5 h-5" /></>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="text-center space-y-6">
              <p className="text-muted-foreground text-sm font-medium">
                {h.t.auth?.rememberPassword || "Remember your password?"}{" "}
                <Link to="/login" className="text-primary font-black hover:underline transition-all">
                  {h.t.auth?.signIn || "Sign in"}
                </Link>
              </p>
              <Link to="/login" className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70 font-black uppercase tracking-widest hover:text-primary transition-colors group pt-6 border-t border-border/50">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                {h.t.auth?.backToLogin || "Back to Login"}
              </Link>
            </motion.div>
          </AuthFormCard>
        </motion.div>
      </motion.div>

      <AuthBrandedPanelDesktop
        logoSrc={logoImage}
        heading={h.t.auth?.resetYourPath || "Reset your Path."}
        quote={h.t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path."}
        attribution={h.t.auth?.psalmReference || "Psalm 119:105"}
      />
    </div>
  );
}
