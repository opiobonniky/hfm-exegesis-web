// Login — thin compositor using shared Auth components (1 root div only)
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
  AuthLogo,
  AuthFormHeader,
  AuthDivider,
  AuthSocialButtons,
  AuthForgotPasswordLink,
  AuthFooter,
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

  const taglineParts = (t.auth?.experienceTheWord || "Experience the {word} like never before.").split("{word}");

  return (
    <div className="min-h-screen flex bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
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

      <AuthFormWrapper>
        <AuthLogo src={logoImage} linkTo="/" />

        <AuthFormHeader
          title={t.auth?.signIn || "Welcome Back!"}
          subtitle={t.auth?.dontHaveAccount || "Sign in to continue your journey."}
        />

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

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(e); }} className="space-y-4 anim-fade" style={{ animationDelay: "0.2s" }}>
          <FloatingInput id="email" label={t.common?.email || "Email Address"} icon={Mail}
            value={email} onChange={(e) => setEmail(e.target.value)}
            focused={emailFocused} setFocused={(id) => setEmailFocused(!!id)}
            handleBlur={() => setEmailFocused(false)} error="" touched={false} type="text" autoComplete="username" />
          <FloatingInput id="password" label={t.common?.password || "Password"} icon={Lock}
            value={password} onChange={(e) => setPassword(e.target.value)}
            focused={passwordFocused} setFocused={(id) => setPasswordFocused(!!id)}
            handleBlur={() => setPasswordFocused(false)} error="" touched={false}
            type={showPassword ? "text" : "password"} autoComplete="current-password"
            isPassword showPassword={showPassword} setShowPassword={setShowPassword} />

          <AuthForgotPasswordLink label={t.auth?.forgotPassword || "Forgot password?"} />

          <AuthLoadingButton loading={isLoading}>
            {(t.auth?.signIn || "SIGN IN").toUpperCase()}
          </AuthLoadingButton>

          <button type="button"
            className="w-full h-14 bg-card border-2 border-border/50 rounded-2xl font-semibold text-[15px] text-foreground hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200"
            onClick={() => navigate("/register")}>
            {t.auth?.createAccount || "Create New Account"}
          </button>

          <AuthDivider label={t.common?.orContinueWith || "or continue with"} />

          <AuthSocialButtons buttons={[
            { label: t.auth?.signInWithGoogle || "Google", icon: <img src={googleIcon} alt="Google" className="w-4 h-4 shrink-0" />, onClick: handleGoogleLogin, loading: isGoogleLoading },
            { label: t.auth?.signInWithLordsbook || "Lordsbook", icon: <img src={lordsbookLogo} alt="Lordsbook" className="w-4 h-4 shrink-0" />, onClick: () => navigate("/login") },
          ]} />
        </form>

        <AuthFooter
          termsLabel={t.auth?.agreeToTerms || "By continuing, you agree to our"}
          termsLinkLabel={t.auth?.terms || "Terms of Service"}
          privacyLabel="and"
          privacyLinkLabel={t.auth?.privacyPolicy || "Privacy Policy"}
          additionalNote={t.auth?.fullVersionComing || "Full version arriving with public launch."}
        />
      </AuthFormWrapper>

      <style>{`
        @keyframes anim-fade-kf { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade { opacity: 0; animation: anim-fade-kf 0.55s ease-out forwards; }
      `}</style>
    </div>
  );
}
