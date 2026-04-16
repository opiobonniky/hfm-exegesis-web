import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
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
import { sendPostRequest, ApiError } from "@/services/api";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Request Failed",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendPostRequest("auth", "forgot-password", {
        email,
      });

      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        setStep("reset");
        toast({
          title: "Code Sent",
          description: "Please check your email for the reset code.",
        });
      } else if (returnCode === 404) {
        toast({
          title: "Account Not Found",
          description: returnMessage || "No account found with this email address.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Failed",
          description: returnMessage || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const message = error instanceof ApiError
        ? error.returnMessage
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast({
        title: "Request Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !newPassword || !confirmPassword) {
      toast({
        title: "Reset Failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Reset Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Reset Failed",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

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
          title: "Password Reset",
          description: "Your password has been reset successfully.",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast({
          title: "Reset Failed",
          description: returnMessage || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const message = error instanceof ApiError
        ? error.returnMessage
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast({
        title: "Reset Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
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
                Bible
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
                "Your word is a lamp for my feet,
                <br />a light on my path."
              </blockquote>
              <p className="text-white/55 text-sm mt-2 tracking-wider">
                — Psalm 119:105
              </p>
            </div>
          </div>

          <div className="anim-fade" style={{ animationDelay: "0.3s" }}>
            <p className="text-white/70 text-sm">
              Reset your password to continue your spiritual journey
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
                EXEGESIS
              </h2>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                Exegesis Bible
              </p>
            </div>
          </div>

          <div className="anim-fade" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/login" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
                {step === "email" ? "Forgot Password" : "Reset Password"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {step === "email"
                ? "Enter your email to receive a reset code"
                : "Enter the code and your new password"}
            </p>
          </div>

          {step === "email" ? (
            <form
              onSubmit={handleRequestReset}
              className="space-y-4 anim-fade"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
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
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all group gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4 anim-fade"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Reset Code
                </Label>
                <div className="relative group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="pl-10 h-12 border-border/60 bg-muted/30 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-center text-lg tracking-[0.5em]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 border-border/60 bg-muted/30 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <KeyRound className="w-4 h-4" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 border-border/60 bg-muted/30 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
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
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <CheckCircle className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center anim-fade" style={{ animationDelay: "0.3s" }}>
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
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

export default ForgotPassword;