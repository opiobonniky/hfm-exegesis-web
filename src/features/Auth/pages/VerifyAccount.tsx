import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, Sparkles, KeyRound } from "lucide-react";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { useVerifyAccountPage } from "../hooks/useVerifyAccountPage";

const VerifyAccount = () => {
  const p = useVerifyAccountPage();
  const { t, isRtl, email, setEmail, code, setCode, isLoading, isResending, handleVerify, handleResend } = p;

  return (
    <div className="min-h-screen flex" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
          <div className="absolute top-1/2 -right-24 w-[360px] h-[360px] bg-card/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "1s" }} />
          <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between px-14 py-14 w-full">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-card flex items-center justify-center shrink-0 overflow-hidden p-1.5">
              <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
            </div>
            <span className="text-white/80 font-medium tracking-widest text-3xl uppercase">
              {t.common?.appName?.split(' ')[1] || 'Bible'}
            </span>
          </div>

          <div className="flex flex-col items-center text-center gap-8">
            <div className="relative">
              <div className="relative w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.15)] flex items-center justify-center p-8">
                <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-amber-400/90 flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-card/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white/70" />
              </div>
            </div>
            <div>
              <blockquote className="text-lg lg:text-xl text-white/85 font-[family-name:var(--font-heading)] leading-relaxed max-w-sm mx-auto italic">
                "{t.auth?.lampToMyFeet || 'Your word is a lamp for my feet, a light on my path.'}"
              </blockquote>
              <p className="text-white/55 text-sm mt-2 tracking-wider">— {t.auth?.psalmReference || 'Psalm 119:105'}</p>
            </div>
          </div>

          <div>
            <p className="text-white/70 text-sm">
              {t.auth?.startJourney || 'Verify your email to start your spiritual journey'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Verify Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-2">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center p-3 shadow-lg">
              <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {t.common?.appName?.toUpperCase() || 'EXEGESIS'}
              </h2>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                {t.common?.appName || 'Exegesis Bible'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/login" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
                {t.auth?.verifyAccount || 'Verify Email'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {t.auth?.enterCode || 'Enter the verification code sent to your email'}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t.common?.email || 'Email Address'}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 h-12 border rounded-lg bg-muted/30 focus:bg-background focus:border-primary text-sm"
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                {t.auth?.verification || 'Verification Code'}
              </label>
              <div className="relative group">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full pl-10 h-12 border rounded-lg bg-muted/30 focus:bg-background focus:border-primary text-center text-lg tracking-[0.5em]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t.auth?.verifyAccount || 'Verify Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t.auth?.didNotReceiveCode || "Didn't receive the code?"}{" "}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary hover:underline font-medium disabled:opacity-50"
              >
                {isResending ? (t.auth?.sending || "Sending...") : (t.auth?.resendCode || "Resend code")}
              </button>
            </p>
            <p className="text-sm">
              <Link to="/register" className="text-primary hover:underline">
                {t.auth?.createNewAccount || 'Create a new account'}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes anim-fade-kf {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade {
          opacity: 0;
          animation: anim-fade-kf 0.55s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VerifyAccount;
