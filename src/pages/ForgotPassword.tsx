import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { sendPostRequest, ApiError } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/languages/languageProvider";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();

  const getFieldError = (name: string) => {
    const value =
      name === "email"
        ? email
        : name === "code"
          ? code
          : name === "newPassword"
            ? newPassword
            : confirmPassword;

    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
        return "";
      case "code":
        if (!value) return "Reset code is required";
        if (value.length < 6) return "Enter 6-digit code";
        return "";
      case "newPassword":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Confirm your password";
        if (value !== newPassword) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (name: string) => {
    setFocusedField(null);
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = getFieldError("email");
    setTouchedFields((prev) => ({ ...prev, email: true }));
    if (error) return;

    setIsLoading(true);
    try {
      const response = await sendPostRequest("auth", "forgot-password", {
        email,
      });

      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        setStep("reset");
        toast({
          title: t.auth?.codeSent || 'Code Sent',
          description: t.auth?.codeSentDesc || 'Please check your email for the reset code.',
        });
      } else if (returnCode === 404) {
        toast({
          title: t.common?.error || 'Error',
          description:
            returnMessage || (t.auth?.accountNotFoundDesc || 'No account found with this email address.'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t.common?.error || 'Error',
          description: returnMessage || (t.auth?.tryAgainMessage || 'Please try again.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.returnMessage
          : error instanceof Error
            ? error.message
            : (t.common?.error || 'An unexpected error occurred.');
      toast({
        title: t.common?.error || 'Error',
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToValidate = ["code", "newPassword", "confirmPassword"];
    let hasErrors = false;
    fieldsToValidate.forEach((f) => {
      if (getFieldError(f)) hasErrors = true;
      setTouchedFields((prev) => ({ ...prev, [f]: true }));
    });

    if (hasErrors) return;

    setIsLoading(true);
    try {
      const response = await sendPostRequest("auth", "reset-password", {
        email,
        code,
        newPassword,
      });

      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        toast({
          title: t.auth?.resetPassword || 'Password Reset',
          description: t.auth?.passwordResetDesc || 'Your password has been reset successfully.',
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast({
          title: t.common?.error || 'Error',
          description: returnMessage || (t.auth?.tryAgainMessage || 'Please try again.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.returnMessage
          : error instanceof Error
            ? error.message
            : (t.common?.error || 'An unexpected error occurred.');
      toast({
        title: t.common?.error || 'Error',
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Entrance Overlay (Unified Background) ── */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="fixed inset-0 z-[100] bg-slate-900 pointer-events-none"
      />

      {/* ── Left Panel — Form ── */}
      <motion.div
        initial={{ x: "-100%", skewX: -5 }}
        animate={{ x: 0, skewX: 0 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-20"
      >
        {/* Dynamic Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="w-full max-w-[440px] z-10"
        >
          <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 p-8 lg:p-10 space-y-8 relative overflow-hidden group/card">
            {/* Visual Flare */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover/card:bg-primary/10 transition-colors duration-700" />

            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col items-center gap-3 mb-2"
            >
              <div className="w-24 h-24 flex items-center justify-center p-2">
                <img
                  src={logoImage}
                  alt="Exegesis Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="space-y-3 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 mb-2">
                {step === "email"
                  ? (t.auth?.accountRecovery || 'Account Recovery')
                  : (t.auth?.securityUpdate || 'Security Update')}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)] leading-none">
                {step === "email"
                  ? (t.auth?.forgotPassword || 'Forgot Password?')
                  : (t.auth?.resetPassword || 'Reset Password')}
              </h1>
              <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                {step === "email"
                  ? (t.auth?.enterEmailForRecovery || 'Enter your email to receive a recovery code.')
                  : (t.auth?.enterCodeAndPassword || 'Enter the 6-digit code and your new password.')}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.form
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRequestReset}
                  className="space-y-6"
                >
                  <FloatingInput
                    id="email"
                    label={t.common?.email || 'Email Address'}
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    focused={focusedField === "email"}
                    setFocused={setFocusedField}
                    handleBlur={() => handleBlur("email")}
                    error={getFieldError("email")}
                    touched={touchedFields.email}
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t.auth?.sendResetCode || 'Send Reset Code'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="reset-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-6"
                >
                  <div className="space-y-5">
                    <FloatingInput
                      id="code"
                      label={t.auth?.resetCode || 'Reset Code'}
                      icon={KeyRound}
                      value={code}
                      onChange={(e: any) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      focused={focusedField === "code"}
                      setFocused={setFocusedField}
                      handleBlur={() => handleBlur("code")}
                      error={getFieldError("code")}
                      touched={touchedFields.code}
                      autoComplete="one-time-code"
                    />

                    <FloatingInput
                      id="newPassword"
                      label={t.common?.password || 'New Password'}
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e: any) => setNewPassword(e.target.value)}
                      focused={focusedField === "newPassword"}
                      setFocused={setFocusedField}
                      handleBlur={() => handleBlur("newPassword")}
                      error={getFieldError("newPassword")}
                      touched={touchedFields.newPassword}
                      isPassword
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      autoComplete="new-password"
                    />

                    <FloatingInput
                      id="confirmPassword"
                      label={t.common?.confirmPassword || 'Confirm Password'}
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                      focused={focusedField === "confirmPassword"}
                      setFocused={setFocusedField}
                      handleBlur={() => handleBlur("confirmPassword")}
                      error={getFieldError("confirmPassword")}
                      touched={touchedFields.confirmPassword}
                      autoComplete="new-password"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t.auth?.resetPassword || 'Reset Password'}
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center space-y-6"
            >
              <p className="text-slate-500 text-sm font-medium">
                {t.auth?.rememberPassword || 'Remember your password?'}{" "}
                <Link
                  to="/login"
                  className="text-primary font-black hover:underline transition-all"
                >
                  {t.auth?.signIn || 'Sign in'}
                </Link>
              </p>

              <div className="pt-6 border-t border-slate-50">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-primary transition-colors group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  {t.auth?.backToLogin || 'Back to Login'}
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right Panel (Desktop Only) ── */}
      <motion.div
        initial={{ x: "100%", skewX: 5 }}
        animate={{ x: 0, skewX: 0 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-slate-900 z-10"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-50 blur-[120px]"
          />
          <motion.div
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-50 blur-[80px]"
          />

          {/* Subtle Grid */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-20 text-center">
          <div className="space-y-16">
            {/* Logo container with bloom effect */}
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 3, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.8,
              }}
              className="relative inline-block group"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
              <motion.div
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="relative w-56 h-56 rounded-[3.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center p-10 shadow-2xl transition-all duration-700"
              >
                <img
                  src={logoImage}
                  alt="Exegesis Logo"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Content Section with Staggered Entrance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-8 max-w-lg"
            >
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.auth?.resetYourPath || 'Reset your Path.'}
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 96 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="h-2 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(57,98,132,0.5)]"
                />
              </div>

              <blockquote className="text-2xl text-slate-300 font-medium italic leading-relaxed px-4">
                "{t.auth?.lampToMyFeet || 'Your word is a lamp for my feet, a light on my path.'}"
              </blockquote>

              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">
                  {t.auth?.psalmReference || 'Psalm 119:105'}
                </p>
                <div className="flex gap-1.5">
                  {[1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.8 + i * 0.1 }}
                      className={`h-1.5 rounded-full transition-all duration-500 ${step === (i === 1 ? "email" : "reset") ? "w-8 bg-primary" : "w-2 bg-slate-700"}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );

};

// ── Reusable Floating Input Component ──
const FloatingInput = ({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  focused,
  setFocused,
  handleBlur,
  error,
  touched,
  type = "text",
  autoComplete = "off",
  isPassword,
  showPassword,
  setShowPassword,
}: any) => (
  <div className="space-y-1 w-full text-left">
    <div className="flex group h-14 relative">
      <div
        className={`w-12 flex items-center justify-center bg-white border border-r-0 rounded-l-2xl transition-all duration-300 shadow-sm ${
          error && touched
            ? "border-red-500 bg-red-50/10"
            : focused
              ? "border-primary"
              : "border-slate-200"
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] transition-all duration-300 ${
            error && touched
              ? "text-red-500"
              : focused
                ? "text-primary scale-110"
                : "text-slate-400"
          }`}
        />
      </div>
      <div className="flex-1 relative">
        <input
          type={type}
          name={id}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(id)}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          className={`w-full h-full px-4 pt-4 bg-white border rounded-r-2xl focus:outline-none transition-all duration-300 text-[15px] font-medium shadow-sm ${
            error && touched
              ? "border-red-500 ring-4 ring-red-500/5"
              : focused
                ? "border-primary ring-4 ring-primary/5"
                : "border-slate-200"
          }`}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-300 pointer-events-none font-bold ${
            focused || value
              ? `top-2 text-[10px] uppercase tracking-widest ${error && touched ? "text-red-500" : "text-primary"}`
              : "top-4 text-[15px] text-slate-400"
          }`}
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
    <AnimatePresence>
      {error && touched && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default ForgotPassword;
