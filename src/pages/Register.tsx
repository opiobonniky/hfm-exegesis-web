import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest, ApiError } from "@/services/api";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebaseConfiguration/config";
import { useAuth } from "@/contexts/AuthContext";
import googleIcon from "@/assets/icons/google-icon.svg";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const { t, isRtl } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "MALE",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserInfo } = useAuth();

  const STEP1_FIELDS = ["firstName", "lastName", "email", "phoneNumber"];
  const STEP2_FIELDS = ["username", "password", "confirmPassword"];

  const getFieldError = (name: string) => {
    const value = formData[name as keyof typeof formData] || "";
    switch (name) {
      case "firstName":
        return !value.trim() ? (t.auth?.firstNameRequired || 'First name is required') : "";
      case "lastName":
        return !value.trim() ? (t.auth?.lastNameRequired || 'Last name is required') : "";
      case "email":
        if (!value.trim()) return (t.auth?.emailRequired || 'Email is required');
        if (!/\S+@\S+\.\S+/.test(value)) return (t.auth?.invalidEmail || 'Invalid email address');
        return "";
      case "phoneNumber":
        return !value.trim() ? (t.auth?.phoneRequired || 'Phone number is required') : "";
      case "username":
        if (!value.trim()) return (t.auth?.usernameRequired || 'Username is required');
        if (value.length < 3) return (t.auth?.usernameTooShort || 'Username too short');
        return "";
      case "password":
        if (!value) return (t.auth?.passwordRequired || 'Password is required');
        if (value.length < 8) return (t.auth?.minCharacters || 'Minimum 8 characters');
        return "";
      case "confirmPassword":
        if (!value) return (t.auth?.confirmPasswordRequired || 'Confirm your password');
        if (value !== formData.password) return (t.auth?.passwordsDoNotMatch || 'Passwords do not match');
        return "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDirtyFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setFocusedField(null);
    if (dirtyFields[name]) {
      setTouchedFields((prev) => ({ ...prev, [name]: true }));
    }
  };

  // Clears touched+dirty state for the given fields
  const clearFieldStates = (fields: string[]) => {
    setTouchedFields((prev) => {
      const next = { ...prev };
      fields.forEach((f) => delete next[f]);
      return next;
    });
    setDirtyFields((prev) => {
      const next = { ...prev };
      fields.forEach((f) => delete next[f]);
      return next;
    });
  };

  const goToStep2 = () => {
    clearFieldStates(STEP2_FIELDS);
    setStep(2);
  };

  const nextStep = () => {
    let hasErrors = false;
    STEP1_FIELDS.forEach((field) => {
      if (getFieldError(field)) hasErrors = true;
      setTouchedFields((prev) => ({ ...prev, [field]: true }));
    });

    if (hasErrors) {
      toast({
        title: t.common?.error ? 'Check Details' : 'Check Details',
        description: t.auth?.correctErrorsBeforeContinuing || 'Please correct the errors before continuing.',
        variant: "destructive",
      });
      return;
    }
    goToStep2();
  };

  const prevStep = () => {
    clearFieldStates(STEP1_FIELDS);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      nextStep();
      return;
    }

    let hasErrors = false;
    STEP2_FIELDS.forEach((field) => {
      if (getFieldError(field)) hasErrors = true;
      setTouchedFields((prev) => ({ ...prev, [field]: true }));
    });

    if (hasErrors) return;

    setIsLoading(true);
    try {
      const response = await sendPostRequest("auth", "register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
      });

      const { returnCode, returnMessage, returnData } = response;

      if (returnCode === 200 && returnData) {
        toast({
          title: t.auth?.registrationSuccessful || 'Registration Successful',
          description: t.auth?.checkEmailVerify || 'Please check your email to verify your account.',
        });
        setTimeout(() => {
          navigate(
            `/verify-account?email=${encodeURIComponent(formData.email)}`,
          );
        }, 3000);
      } else if (returnCode === 401) {
        toast({
          title: t.auth?.registrationFailed || 'Registration Failed',
          description:
            returnMessage ||
            (t.auth?.emailExists || 'Email already exists. Please use a different email or login.'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t.auth?.registrationFailed || 'Registration Failed',
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
            : "An unexpected error occurred.";
      toast({
        title: t.auth?.registrationFailed || 'Registration Failed',
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processGoogleResult = async (result: any) => {
    try {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (!idToken) throw new Error(t.auth?.googleLoginFailed || "Could not get Google ID token");

      const { user } = result;
      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP();

      const responseBackend = await sendPostRequest("auth", "google-login", {
        idToken,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        photoUrl: user.photoURL || "",
        deviceInfo: { ...deviceInfo, ip: clientIP },
      });

      const { returnCode, returnData, returnMessage } = responseBackend;

      if (returnCode === 200 && returnData) {
        const userInfo: any = {
          token: returnData.token,
          tokenType: returnData.tokenType,
          id: returnData.id,
          username: returnData.username,
          email: returnData.email,
          firstName: returnData.firstName,
          lastName: returnData.lastName,
          profilePhotoUrl: returnData.profilePhotoUrl,
          userRole: returnData.userRole,
          roleName: returnData.roleName,
        };
        setUserInfo(userInfo);
        navigate(
          returnData.userRole === 1
            ? routes.dashboard.path
            : routes.userDashboard.path,
        );
      } else if (returnCode === 201 && returnData?.needsRegistration) {
        navigate(routes.googleRegister.path, {
          state: {
            googleId: returnData.googleId,
            email: returnData.email,
            firstName: returnData.firstName,
            lastName: returnData.lastName,
            photoUrl: returnData.photoUrl,
          },
        });
      } else {
        toast({
          title: t.auth?.googleLoginFailed || 'Google Login Failed',
          description:
            returnMessage || (t.auth?.unableToSignInGoogle || 'Unable to sign in with Google.'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: t.auth?.googleLoginFailed || 'Google Login Failed',
        description:
          error.message || (t.auth?.unableToSignInGoogle || 'Unable to sign in with Google.'),
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processGoogleResult(result);
      return;
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast({
          title: t.auth?.loginCancelled || 'Login cancelled',
          description: t.auth?.youClosedWindow || 'You closed the Google sign-in window.',
          variant: "destructive",
        });
      } else if (error.code === "auth/popup-blocked") {
        toast({
          title: t.auth?.popupBlocked || 'Popup blocked',
          description: t.auth?.allowPopupsAndRetry || 'Please allow popups and try again.',
          variant: "destructive",
        });
      } else {
        toast({
          title: t.auth?.googleLoginFailed || 'Google Login Failed',
          description: error.message || (t.auth?.unableToSignInGoogle || 'Unable to sign in with Google.'),
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-muted overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Left Panel (Desktop Only) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-slate-900">
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
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
              <motion.div
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="relative w-56 h-56 rounded-[3.5rem] bg-card/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center p-10 shadow-2xl rotate-3 transition-all duration-700"
              >
                <img
                  src={logoImage}
                  alt="Exegesis Logo"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            </div>

            <div className="space-y-8 max-w-lg">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.auth?.joinExegesisFamily || 'Join the Exegesis Family.'}
                </h2>
                <div className="h-2 w-24 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(57,98,132,0.5)]" />
              </div>

              <blockquote className="text-2xl text-white/70 font-medium italic leading-relaxed px-4">
                "{t.auth?.lampToMyFeet || 'Your word is a lamp for my feet, a light on my path.'}"
              </blockquote>

              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">
                  {t.auth?.psalmReference || 'Psalm 119:105'}
                </p>
                <div className="flex gap-1.5">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? "w-8 bg-primary" : "w-2 bg-white/20"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 left-12 bg-card/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-slate-300 text-xs font-bold">
            {t.auth?.tenThousandJoined || '10,000+ Believers Joined'}
          </p>
        </motion.div>
      </div>

      {/* ── Right Panel — Registration Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-[440px] z-10">
          <div className="bg-card rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-border/50 p-8 lg:p-10 space-y-6 relative overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex bg-muted p-1.5 rounded-2xl border border-border/50 mb-2">
              <button
                type="button"
                onClick={prevStep}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-500 ${step === 1 ? "bg-card text-primary shadow-sm border border-border/50" : "text-muted-foreground/70 hover:text-muted-foreground"}`}
              >
                <User className="w-3.5 h-3.5" />
                {(t.auth?.personalInfo || t.common?.name || 'Personal')}
              </button>
              <button
                type="button"
                onClick={goToStep2}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-500 ${step === 2 ? "bg-card text-primary shadow-sm border border-border/50" : "text-muted-foreground/70 hover:text-muted-foreground"}`}
              >
                <Lock className="w-3.5 h-3.5" />
                {(t.auth?.security || t.common?.password || 'Security')}
              </button>
            </div>

            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-black tracking-tight text-foreground font-[family-name:var(--font-heading)] leading-none">
                {step === 1 ? (t.auth?.yourProfile || 'Your Profile') : (t.auth?.secureAccount || 'Secure Account')}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {step === 1 ? (t.auth?.tellUsWhoYouAre || 'Tell us who you are.') : (t.auth?.protectYourJourney || 'Protect your journey.')}
              </p>
            </div>

            {/* Divider — Sign up with Google */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-border/50" />
              <span className="text-xs text-muted-foreground/70 font-medium">
                {t.auth?.signUpWith || 'or sign up with'}
              </span>
              <div className="flex-1 h-[1px] bg-border/50" />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="w-full h-12 bg-card border-2 border-border/50 rounded-xl flex items-center justify-center gap-2 hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 font-semibold text-foreground"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-border border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <>
                  <img
                    src={googleIcon}
                    alt="Google"
                    className="w-4 h-4 shrink-0"
                  />
                  <span className="text-xs font-medium truncate">{t.auth?.signInWithGoogle || 'Google'}</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-border/50" />
              <span className="text-xs text-muted-foreground/70 font-medium">
                {t.common?.orContinueWith || 'or continue with email'}
              </span>
              <div className="flex-1 h-[1px] bg-border/50" />
            </div>

            {/* Multi-step Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="min-h-[300px] relative">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <FloatingInput
                          id="firstName"
                          label={t.auth?.firstName || 'First Name'}
                          icon={User}
                          value={formData.firstName}
                          onChange={handleChange}
                          focused={focusedField === "firstName"}
                          setFocused={setFocusedField}
                          handleBlur={() => handleBlur("firstName")}
                          error={getFieldError("firstName")}
                          touched={touchedFields.firstName}
                          autoComplete="none"
                        />
                        <FloatingInput
                          id="lastName"
                          label={t.auth?.lastName || 'Last Name'}
                          icon={User}
                          value={formData.lastName}
                          onChange={handleChange}
                          focused={focusedField === "lastName"}
                          setFocused={setFocusedField}
                          handleBlur={() => handleBlur("lastName")}
                          error={getFieldError("lastName")}
                          touched={touchedFields.lastName}
                          autoComplete="none"
                        />
                      </div>

                      <FloatingInput
                        id="email"
                        label={t.common?.email || 'Email Address'}
                        icon={Mail}
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        focused={focusedField === "email"}
                        setFocused={setFocusedField}
                        handleBlur={() => handleBlur("email")}
                        error={getFieldError("email")}
                        touched={touchedFields.email}
                      />
                      <FloatingInput
                        id="phoneNumber"
                        label={t.auth?.phoneNumber || 'Phone Number'}
                        icon={Phone}
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        focused={focusedField === "phoneNumber"}
                        setFocused={setFocusedField}
                        handleBlur={() => handleBlur("phoneNumber")}
                        error={getFieldError("phoneNumber")}
                        touched={touchedFields.phoneNumber}
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <FloatingInput
                        id="username"
                        label={t.auth?.username || 'Username'}
                        icon={User}
                        value={formData.username}
                        onChange={handleChange}
                        focused={focusedField === "username"}
                        setFocused={setFocusedField}
                        handleBlur={() => handleBlur("username")}
                        error={getFieldError("username")}
                        touched={touchedFields.username}
                        autoComplete="none"
                      />
                      <FloatingInput
                        id="password"
                        label={t.common?.password || 'Password'}
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        focused={focusedField === "password"}
                        setFocused={setFocusedField}
                        handleBlur={() => handleBlur("password")}
                        error={getFieldError("password")}
                        touched={touchedFields.password}
                        isPassword
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        autoComplete="new-password"
                      />

                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-1.5 px-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                              {t.auth?.securityStrength || 'Security Strength'}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest ${
                                formData.password.length < 6
                                  ? "text-red-500"
                                  : formData.password.length < 10
                                    ? "text-amber-500"
                                    : "text-emerald-500"
                              }`}
                            >
                              {formData.password.length < 6
                                ? (t.auth?.weak || 'Weak')
                                : formData.password.length < 10
                                  ? (t.auth?.good || 'Good')
                                  : (t.auth?.strong || 'Strong')}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
                            <div
                              className={`h-full transition-all duration-500 ${
                                formData.password.length >= 1
                                  ? formData.password.length < 6
                                    ? "bg-red-500 w-1/3"
                                    : formData.password.length < 10
                                      ? "bg-amber-500 w-2/3"
                                      : "bg-emerald-500 w-full"
                                  : "w-0"
                              }`}
                            />
                          </div>
                        </motion.div>
                      )}

                      <FloatingInput
                        id="confirmPassword"
                        label={t.common?.confirmPassword || 'Confirm Password'}
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        focused={focusedField === "confirmPassword"}
                        setFocused={setFocusedField}
                        handleBlur={() => handleBlur("confirmPassword")}
                        error={getFieldError("confirmPassword")}
                        touched={touchedFields.confirmPassword}
                        autoComplete="new-password"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 h-14 bg-muted text-muted-foreground rounded-2xl font-bold text-[15px] border border-border/50 hover:bg-muted transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.auth?.backBtn || t.common?.back || 'Back'}
                  </button>
                )}

                {step < 2 ? (
                  <button
                    type="submit"
                    className="flex-[2] h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2"
                  >
                    {t.auth?.continueBtn || 'Continue'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-[2] h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      t.auth?.createAccount || 'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="text-center space-y-6">
              <p className="text-muted-foreground text-sm font-medium">
                {t.auth?.alreadyHaveAccount || 'Already have an account?'}{" "}
                <Link
                  to="/login"
                  className="text-primary font-black hover:underline transition-all"
                >
                  {t.auth?.signIn || 'Sign in'}
                </Link>
              </p>

              <div className="pt-6 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed font-medium">
                  {t.auth?.byJoiningTerms || 'By joining, you agree to the'}{" "}
                  <Link
                    to="/terms"
                    className="text-muted-foreground underline font-bold"
                  >
                    {t.auth?.terms || 'Terms'}
                  </Link>{" "}
                  &{" "}
                  <Link
                    to="/privacy"
                    className="text-muted-foreground underline font-bold"
                  >
                    {t.auth?.privacyPolicy || 'Privacy Policy'}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  <div className="space-y-1 w-full">
    <div className="flex group h-14 relative">
      <div
        className={`w-12 flex items-center justify-center bg-card border border-r-0 rounded-l-2xl transition-all duration-300 shadow-sm ${
          error && touched
            ? "border-red-500 bg-red-50/10"
            : focused
              ? "border-primary"
              : "border-border"
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] transition-all duration-300 ${
            error && touched
              ? "text-red-500"
              : focused
                ? "text-primary scale-110"
                : "text-muted-foreground/70"
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
          className={`w-full h-full px-4 pt-4 bg-card border rounded-r-2xl focus:outline-none transition-all duration-300 text-[15px] font-medium shadow-sm ${
            error && touched
              ? "border-red-500 ring-4 ring-red-500/5"
              : focused
                ? "border-primary ring-4 ring-primary/5"
                : "border-border"
          }`}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-300 pointer-events-none font-bold ${
            focused || value
              ? `top-2 text-[10px] uppercase tracking-widest ${error && touched ? "text-red-500" : "text-primary"}`
              : "top-4 text-[15px] text-muted-foreground/70"
          }`}
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors p-1.5"
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

export default Register;
