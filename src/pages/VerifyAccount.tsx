import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest, ApiError } from "@/services/api";
import { routes } from "@/components/Routes/routes";

const VerifyAccount = () => {
  const { t, isRtl } = useLanguage();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      toast({
        title: t.auth?.verification || 'Verification Failed',
        description: t.auth?.enterEmailAndCode || 'Please enter both email and verification code.',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendPostRequest("auth", "verify-account", {
        email,
        code,
      });

      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        setIsVerified(true);
        toast({
          title: t.auth?.emailVerified || 'Email Verified',
          description: t.auth?.verifiedSuccess || 'Your account has been verified successfully.',
        });
        setTimeout(() => {
          navigate(routes.login.path);
        }, 3000);
      } else {
        toast({
          title: t.auth?.verification || 'Verification Failed',
          description: returnMessage || (t.auth?.invalidCode || 'Invalid verification code.'),
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
        title: t.auth?.verification || 'Verification Failed',
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: t.auth?.resendVerification || 'Resend Failed',
        description: t.auth?.enterEmailAddress || 'Please enter your email address.',
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await sendPostRequest("auth", "resend-verification", {
        email,
      });

      const { returnCode, returnMessage } = response;
      toast({
        title: returnCode === 200 ? (t.auth?.codeSent || 'Code Sent') : (t.common?.error || 'Error'),
        description:
          returnMessage || (t.auth?.codeSentToEmail || 'Verification code has been sent to your email.'),
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.returnMessage
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
      toast({
        title: "Resend Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-[400px] space-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {t.auth?.emailVerified || 'Email Verified!'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t.auth?.redirectingToLogin || 'Redirecting to login...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-accent/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "5s" }}
          />
          <div
            className="absolute top-1/2 -right-24 w-[360px] h-[360px] bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "7s", animationDelay: "1s" }}
          />
          <div
            className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "2s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between px-14 py-14 w-full">
          <div className="anim-fade" style={{ animationDelay: "0s" }}>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                <img
                  src={logoImage}
                  alt="Exegesis"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white/80 font-medium tracking-widest text-3xl uppercase">
                {t.common?.appName?.split(' ')[1] || 'Bible'}
              </span>
            </div>
          </div>

          <div
            className="flex flex-col items-center text-center gap-8 anim-fade"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="relative">
              <div className="relative w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.15)] flex items-center justify-center p-8">
                <img
                  src={logoImage}
                  alt="Exegesis Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-amber-400/90 flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white/70" />
              </div>
            </div>

            <div>
              <blockquote className="text-lg lg:text-xl text-white/85 font-[family-name:var(--font-heading)] leading-relaxed max-w-sm mx-auto italic">
                "{t.auth?.lampToMyFeet || 'Your word is a lamp for my feet, a light on my path.'}"
              </blockquote>
              <p className="text-white/55 text-sm mt-2 tracking-wider">
                — {t.auth?.psalmReference || 'Psalm 119:105'}
              </p>
            </div>
          </div>

          <div className="anim-fade" style={{ animationDelay: "0.3s" }}>
            <p className="text-white/70 text-sm">
              {t.auth?.startJourney || 'Verify your email to start your spiritual journey'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Verify Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="lg:hidden flex flex-col items-center gap-4 mb-2 anim-fade">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center p-3 shadow-lg">
              <img
                src={logoImage}
                alt="Exegesis Logo"
                className="w-full h-full object-contain"
              />
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

          <div className="anim-fade" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-primary"
              >
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

          <form
            onSubmit={handleVerify}
            className="space-y-4 anim-fade"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t.common?.email || 'Email Address'}
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-border/60 bg-muted/30 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                {t.auth?.verification || 'Verification Code'}
              </Label>
              <div className="relative group">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  className="pl-10 h-12 border-border/60 bg-muted/30 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-center text-lg tracking-[0.5em]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all group gap-2"
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.auth?.verifying || 'Verifying...'}
                </>
              ) : (
                <>
                  {t.auth?.verifyAccount || 'Verify Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div
            className="text-center space-y-2 anim-fade"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="text-sm text-muted-foreground">
              {t.auth?.didNotReceiveCode || "Didn't receive the code?"}{" "}
              <button
                onClick={handleResendCode}
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
