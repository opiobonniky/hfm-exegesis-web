import { ArrowLeft, ArrowRight, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useForgotPasswordPage } from "../hooks/useForgotPasswordPage";
import FloatingInput from "../components/FloatingInput";

export default function ForgotPassword() {
  const h = useForgotPasswordPage();
  return (
    <div className="min-h-screen flex bg-muted overflow-hidden relative" dir={h.isRtl ? "rtl" : "ltr"}>
      {/* Entrance overlay */}
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1, delay: 0.8 }}
        className="fixed inset-0 z-[100] bg-brand-dark pointer-events-none" />

      {/* Left panel — form */}
      <motion.div initial={{ x: "-100%", skewX: -5 }} animate={{ x: 0, skewX: 0 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-20">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
          <motion.div animate={{ x: [0, -40, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }} className="w-full max-w-[440px] z-10">
          <div className="bg-card rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-border/50 p-8 lg:p-10 space-y-8 relative overflow-hidden group/card">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover/card:bg-primary/10 transition-colors duration-700" />

            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="flex flex-col items-center gap-3 mb-2">
              <div className="w-24 h-24 flex items-center justify-center p-2">
                <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain" />
              </div>
            </motion.div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
              className="space-y-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 mb-2">
                {h.step === "email" ? (h.t.auth?.accountRecovery || "Account Recovery") : (h.t.auth?.securityUpdate || "Security Update")}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">
                {h.step === "email" ? (h.t.auth?.forgotPassword || "Forgot Password?") : (h.t.auth?.resetPassword || "Reset Password")}
              </h1>
              <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">
                {h.step === "email" ? (h.t.auth?.enterEmailForRecovery || "Enter your email to receive a recovery code.") : (h.t.auth?.enterCodeAndPassword || "Enter the 6-digit code and your new password.")}
              </p>
            </motion.div>

            {/* Forms */}
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
                    {h.isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>{h.t.auth?.sendResetCode || "Send Reset Code"} <ArrowRight className="w-5 h-5" /></>}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} onSubmit={h.handleResetPassword} className="space-y-6">
                  <div className="space-y-5">
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
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    disabled={h.isLoading}>
                    {h.isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>{h.t.auth?.resetPassword || "Reset Password"} <CheckCircle2 className="w-5 h-5" /></>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="text-center space-y-6">
              <p className="text-muted-foreground text-sm font-medium">
                {h.t.auth?.rememberPassword || "Remember your password?"}{" "}
                <Link to="/login" className="text-primary font-black hover:underline transition-all">
                  {h.t.auth?.signIn || "Sign in"}
                </Link>
              </p>
              <div className="pt-6 border-t border-border/50">
                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] text-muted-foreground/70 font-black uppercase tracking-widest hover:text-primary transition-colors group">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  {h.t.auth?.backToLogin || "Back to Login"}
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right panel (desktop only) */}
      <motion.div initial={{ x: "100%", skewX: 5 }} animate={{ x: 0, skewX: 0 }}
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-dark z-10">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-50 blur-[120px]" />
          <motion.div animate={{ y: [0, -100, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-50 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-20 text-center">
          <div className="space-y-16">
            <motion.div initial={{ scale: 0, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 3, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.8 }} className="relative inline-block group">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
              <motion.div whileHover={{ rotate: 0, scale: 1.05 }}
                className="relative w-56 h-56 rounded-[3.5rem] bg-card/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center p-10 shadow-2xl transition-all duration-700">
                <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain filter drop-shadow-2xl" />
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }} className="space-y-8 max-w-lg">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                  {h.t.auth?.resetYourPath || "Reset your Path."}
                </h2>
                <motion.div initial={{ width: 0 }} animate={{ width: 96 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="h-2 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(57,98,132,0.5)]" />
              </div>
              <blockquote className="text-2xl text-white/70 font-medium italic leading-relaxed px-4">
                &ldquo;{h.t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path."}&rdquo;
              </blockquote>
              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">
                  {h.t.auth?.psalmReference || "Psalm 119:105"}
                </p>
                <div className="flex gap-1.5">
                  {[1, 2].map((i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 1.8 + i * 0.1 }}
                      className={`h-1.5 rounded-full transition-all duration-500 ${h.step === (i === 1 ? "email" : "reset") ? "w-8 bg-primary" : "w-2 bg-white/20"}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
