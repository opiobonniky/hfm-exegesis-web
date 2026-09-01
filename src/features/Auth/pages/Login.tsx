// Login — thin compositor using shared Auth components
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import lordsbookLogo from "@/assets/logos/lordsbook.png";
import googleIcon from "@/assets/icons/google-icon.svg";
import { useLoginPage } from "../hooks/useLoginPage";
import FloatingInput from "../components/FloatingInput";
import {
  AuthBrandedPanel,
  AuthFormWrapper,
  AuthLoadingButton,
  AuthLanguagePicker,
} from "../components";

export default function Login() {
  const p = useLoginPage();
  const {
    t, isRtl, setLanguage, currentLang, langLoading, navigate,
    email, setEmail, password, setPassword,
    showPassword, setShowPassword,
    isLoading, isGoogleLoading,
    emailFocused, setEmailFocused,
    passwordFocused, setPasswordFocused,
    handleLogin, handleGoogleLogin,
  } = p;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(e);
  };

  // Split tagline into parts for the styled {word} span
  const taglineParts = (t.auth?.experienceTheWord || "Experience the {word} like never before.").split("{word}");

  return (
    <div className="min-h-screen flex bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left Panel (Desktop Only) */}
      <AuthBrandedPanel
        isRtl={isRtl}
        tagline={
          <>
            {taglineParts[0]}
            <span className="text-primary">{t.auth?.word || "Word"}</span>
            {taglineParts[1]}
          </>
        }
        quote={t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path."}
        attribution={t.auth?.psalmReference || "Psalm 119:105"}
      />

      {/* Right Panel — Login Form */}
      <AuthFormWrapper>
        <Link to="/" className="flex flex-col items-center gap-3 mb-2 anim-fade">
          <div className="w-32 h-32 flex items-center justify-center p-2">
            <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain" />
          </div>
        </Link>

        <div className="anim-fade text-center">
          <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">
            {t.auth?.signIn || "Welcome Back!"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t.auth?.dontHaveAccount || "Sign in to continue your journey."}
          </p>
        </div>

        <AuthLanguagePicker
          currentLang={currentLang}
          langLoading={langLoading}
          onLanguageChange={setLanguage}
          labels={{
            primary: t.languageGroups?.primary,
            european: t.languageGroups?.european,
            indian: t.languageGroups?.indian,
            other: t.languageGroups?.other,
          }}
        />

        <form onSubmit={handleSubmit} className="space-y-4 anim-fade" style={{ animationDelay: "0.2s" }}>
          <FloatingInput
            id="email"
            label={t.common?.email || "Email Address"}
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            focused={emailFocused}
            setFocused={(id) => setEmailFocused(!!id)}
            handleBlur={() => setEmailFocused(false)}
            error=""
            touched={false}
            type="text"
            autoComplete="username"
          />
          <FloatingInput
            id="password"
            label={t.common?.password || "Password"}
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            focused={passwordFocused}
            setFocused={(id) => setPasswordFocused(!!id)}
            handleBlur={() => setPasswordFocused(false)}
            error=""
            touched={false}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            isPassword
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              {t.auth?.forgotPassword || "Forgot password?"}
            </Link>
          </div>

          <AuthLoadingButton loading={isLoading}>
            {(t.auth?.signIn || "SIGN IN").toUpperCase()}
          </AuthLoadingButton>

          <button
            type="button"
            className="w-full h-14 bg-card border-2 border-border/50 rounded-2xl font-semibold text-[15px] text-foreground hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200"
            onClick={() => navigate("/register")}
          >
            {t.auth?.createAccount || "Create New Account"}
          </button>

          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-[1px] bg-muted" />
            <span className="text-xs text-muted-foreground/70 font-medium">
              {t.common?.orContinueWith || "or continue with"}
            </span>
            <div className="flex-1 h-[1px] bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-12 bg-card border-2 border-border/50 rounded-xl flex items-center justify-center gap-2 hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 font-semibold text-foreground relative"
              onClick={() => handleGoogleLogin()}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-border border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <>
                  <img src={googleIcon} alt="Google" className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium truncate">{t.auth?.signInWithGoogle || "Google"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="h-12 bg-card border-2 border-border/50 rounded-xl flex items-center justify-center gap-2 hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 font-semibold text-foreground relative"
              onClick={() => navigate("/login")}
            >
              <img src={lordsbookLogo} alt="Lordsbook" className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">{t.auth?.signInWithLordsbook || "Lordsbook"}</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="text-[11px] text-center text-muted-foreground/70 leading-relaxed max-w-[300px] mx-auto">
            {t.auth?.agreeToTerms || "By continuing, you agree to our"}{" "}
            <Link to="/terms" className="text-primary font-bold underline">{t.auth?.terms || "Terms of Service"}</Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary font-bold underline">{t.auth?.privacyPolicy || "Privacy Policy"}</Link>
          </p>
          <p className="text-[11px] text-center text-muted-foreground/70 font-medium">
            {t.auth?.fullVersionComing || "Full version arriving with public launch."}
          </p>
        </div>
      </AuthFormWrapper>

      <style>{`
        @keyframes anim-fade-kf { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade { opacity: 0; animation: anim-fade-kf 0.55s ease-out forwards; }
      `}</style>
    </div>
  );
}
