import { Link } from "react-router-dom";
import { Mail, Lock, Globe, Check } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import lordsbookLogo from "@/assets/logos/lordsbook.png";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import {
  Select, SelectContent, SelectItem, SelectGroup,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import googleIcon from "@/assets/icons/google-icon.svg";
import { useLoginPage } from "../hooks/useLoginPage";
import FloatingInput from "../components/FloatingInput";

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

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleLogin(e); };
  const handleLordsbookLogin = () => navigate("/login");

  return (
    <div className="min-h-screen flex bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
          <div
            className={`absolute -top-24 ${isRtl ? "-left-24" : "-right-24"} w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse`}
            style={{ animationDuration: "8s" }}
          />
          <div
            className={`absolute bottom-1/4 ${isRtl ? "-right-24" : "-left-24"} w-72 h-72 bg-accent/10 rounded-full blur-[80px] animate-pulse`}
            style={{ animationDuration: "10s", animationDelay: "2s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          <div className="anim-fade space-y-12" style={{ animationDelay: "0.1s" }}>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
              <Link to="/" className="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-card/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center p-8 shadow-2xl hover:border-white/20 transition-colors">
                <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain filter drop-shadow-2xl" />
              </Link>
            </div>
            <div className="space-y-6 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                {(() => {
                  const parts = (t.auth?.experienceTheWord || "Experience the {word} like never before.").split("{word}");
                  return (<>{parts[0]}<span className="text-primary">{t.auth?.word || "Word"}</span>{parts[1]}</>);
                })()}
              </h2>
              <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
              <blockquote className="text-xl md:text-2xl text-white/70 font-medium italic leading-relaxed">
                &ldquo;{t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path."}&rdquo;
              </blockquote>
              <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-sm">
                {t.auth?.psalmReference || "Psalm 119:105"}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 start-0 w-full px-16 flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-widest anim-fade" style={{ animationDelay: "0.5s" }}>
          <span>{t.auth?.loginCopyright || "© 2026 Exegesis Bible"}</span>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">{t.auth?.instagram || "Instagram"}</span>
            <span className="hover:text-white cursor-pointer transition-colors">{t.auth?.twitter || "Twitter"}</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-8 py-8 lg:py-0">
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

          <div className="flex justify-center anim-fade" style={{ animationDelay: "0.15s" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border/50">
              <Globe className="w-3.5 h-3.5 text-muted-foreground/70" />
              <Select value={currentLang} onValueChange={(value) => setLanguage(value as Language)} disabled={langLoading}>
                <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground/80 focus:ring-0 [&>svg]:hidden">
                  <SelectValue><span>{LANGUAGE_NAMES[currentLang]}</span></SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[140px]">
                  {[
                    { label: t.languageGroups?.primary || "Primary", languages: ["en"] as Language[] },
                    { label: t.languageGroups?.european || "European", languages: ["de", "fr", "es", "pt", "it", "el", "ru"] as Language[] },
                    { label: t.languageGroups?.indian || "Indian", languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"] as Language[] },
                    { label: t.languageGroups?.other || "Other", languages: ["ar", "sw", "ne", "fil"] as Language[] },
                  ].map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50">{group.label}</SelectLabel>
                      {group.languages.map((code) => (
                        <SelectItem key={code} value={code} className="py-1.5 text-xs">
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span>{LANGUAGE_NAMES[code]}</span>
                              {code !== "en" && <span className="text-muted-foreground/60 text-[10px]">({getLanguageName(code, "en")})</span>}
                            </div>
                            {code === currentLang && <Check className="w-3 h-3 text-primary shrink-0" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <button
              type="submit"
              className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (t.auth?.signIn || "SIGN IN").toUpperCase()}
            </button>
            <button
              type="button"
              className="w-full h-14 bg-card border-2 border-border/50 rounded-2xl font-semibold text-[15px] text-foreground hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200"
              onClick={() => navigate("/register")}
            >
              {t.auth?.createAccount || "Create New Account"}
            </button>
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-muted" />
              <span className="text-xs text-muted-foreground/70 font-medium">{t.common?.orContinueWith || "or continue with"}</span>
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
                onClick={handleLordsbookLogin}
              >
                <img src={lordsbookLogo} alt="Lordsbook" className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium truncate">{t.auth?.signInWithLordsbook || "Lordsbook"}</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <p className="text-[11px] text-center text-muted-foreground/70 leading-relaxed max-w-[300px] mx-auto">
              {t.auth?.agreeToTerms || "By continuing, you agree to our"} <Link to="/terms" className="text-primary font-bold underline">{t.auth?.terms || "Terms of Service"}</Link> and <Link to="/privacy" className="text-primary font-bold underline">{t.auth?.privacyPolicy || "Privacy Policy"}</Link>
            </p>
            <p className="text-[11px] text-center text-muted-foreground/70 font-medium">{t.auth?.fullVersionComing || "Full version arriving with public launch."}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes anim-fade-kf { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes anim-slide-kf { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes card-float-kf { 0%, 100% { transform: translateY(0) rotate(1.5deg); } 50% { transform: translateY(-8px) rotate(1.5deg); } }
        .anim-fade { opacity: 0; animation: anim-fade-kf 0.55s ease-out forwards; }
        .anim-slide { animation: anim-slide-kf 0.5s ease-out forwards; }
        .card-float { animation: card-float-kf 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
