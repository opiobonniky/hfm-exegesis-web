import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  BookOpen,
  Heart,
  Sun,
  BookMarked,
  LogInIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest, ApiError } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebaseConfiguration/config";
import googleIcon from "@/assets/icons/google-icon.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserInfo, userInfo, loading } = useAuth();

  useEffect(() => {
    if (!loading && userInfo) {
      navigate("/dashboard", { replace: true });
    }
  }, [userInfo, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (!idToken) throw new Error("Could not get Google ID token");

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
          title: "Google Login Failed",
          description:
            returnMessage || "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);

      // ✅ User just closed the popup — NOT an error
      if (error.code === "auth/popup-closed-by-user") {
        toast({
          title: "Login cancelled",
          description: "You closed the Google sign-in window.",
          variant: "destructive",
        });
        return;
      }

      // Optional: handle popup blocked
      if (error.code === "auth/popup-blocked") {
        toast({
          title: "Popup blocked",
          description: "Please allow popups and try again.",
          variant: "destructive",
        });
        return;
      }

      // Real errors
      toast({
        title: "Google Login Failed",
        description:
          error.message || "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP();

      const response = await sendPostRequest("auth", "login", {
        username: email,
        password,
        deviceInfo: {
          ...deviceInfo,
          ip: clientIP,
        },
      });
      const { returnCode, returnData, returnMessage } = response;
      if (returnCode === 200 && returnData) {
        const userInfo: any = {
          token: returnData.token,
          tokenType: returnData.tokenType,
          username: returnData.username,
          email: returnData.email,
          firstName: returnData.firstName,
          lastName: returnData.lastName,
          profilePhotoUrl: returnData.profilePhotoUrl,
          userRole: returnData.userRole,
          roleName: returnData.roleName,
        };

        console.log(
          "Login successful, user info:",
          JSON.stringify(userInfo, null, 2),
        );

        setUserInfo(userInfo);

        if (returnData.userRole === 1) {
          navigate(routes.dashboard.path);
        } else {
          navigate(routes.userDashboard.path);
        }
      } else if (returnCode === 405) {
        toast({
          title: "Email Verification Required",
          description: "A verification code has been sent to your email.",
        });
        setTimeout(() => {
          navigate(
            `${routes.verifyAccount.path}?email=${encodeURIComponent(returnData?.email || email)}`,
          );
        }, 3000);
      } else {
        const deviceInfo = getDeviceInfo();
        const clientIP = await getClientIP();
        await sendPostRequest("auth", "login-failed", {
          username: email,
          deviceInfo: {
            ...deviceInfo,
            ip: clientIP,
          },
        });
        toast({
          title: "Login Failed",
          description: returnMessage || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.returnMessage
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";

      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP().catch(() => "");
      try {
        await sendPostRequest("auth", "login-failed", {
          username: email,
          deviceInfo: {
            ...deviceInfo,
            ip: clientIP,
          },
        });
      } catch {}

      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Sun, text: "Daily Bible reading plans" },
    { icon: BookMarked, text: "Verse explanations" },
    { icon: Heart, text: "Track your spiritual journey" },
    { icon: BookOpen, text: "Reading progress tracking" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
        {/* Mesh background blobs */}
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

          {/* Subtle grid overlay */}
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
          {/* TOP — Brand */}
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

          {/* MIDDLE — Logo + Headline */}
          <div
            className="flex flex-col items-center text-center gap-8 anim-fade"
            style={{ animationDelay: "0.15s" }}
          >
            {/* Large logo - improved design */}
            <div className="relative">
              {/* Glow effect */}

              {/* Logo container */}
              <div className="relative w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl  shadow-[0_0_60px_rgba(255,255,255,0.15)] flex items-center justify-center p-8">
                <img
                  src={logoImage}
                  alt="Exegesis Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                />
              </div>

              {/* Decorative ring
              <div
                className="w-[30rem] h-[30rem] absolute inset-0 rounded-full border-4 border-primary animate-[spin_5s_linear_infinite]"
                style={{
                  borderTopColor: "transparent",
                  borderLeftColor: "transparent",
                }}
              /> */}

              {/* Sparkle decorations */}
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

          {/* BOTTOM — Features + Social proof */}
          <div
            className="space-y-6 anim-fade"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-white/10 anim-slide"
                  style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-white/85 text-sm font-medium leading-tight">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Social proof row */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 border-2 border-white/30 flex items-center justify-center shadow-md"
                  >
                    <span className="text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  <span className="text-accent">10,000+</span> believers
                </p>
                <p className="text-white/50 text-xs">
                  Growing in Scripture daily
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating reflection card */}
        <div className="absolute top-[45%] right-8 -translate-y-1/2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl p-5 border border-white/20 shadow-2xl max-w-[200px] card-float">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p className="text-amber-400/80 text-xs font-medium uppercase tracking-wider">
              Today's Reflection
            </p>
          </div>
          <p className="text-white font-[family-name:var(--font-heading)] text-base leading-snug">
            "Trust in the Lord with all your heart and lean not on your own
            understanding."
          </p>
          <p className="text-white/40 text-xs mt-2">— Proverbs 3:5</p>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
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

          {/* Heading */}
          <div className="anim-fade" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 anim-fade"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email or Username
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-border/60 bg-muted/30 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Remember me next login
                </label>
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <LogInIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
              onClick={() => handleGoogleLogin()}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <img
                    src={googleIcon}
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Sign in with Google
                </>
              )}
            </Button>
          </form>

          {/* Footer link */}
          <div
            className="text-center anim-fade"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              Create an account
              <ArrowRight className="w-4 h-4  group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes anim-fade-kf {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes anim-slide-kf {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes card-float-kf {
          0%, 100% { transform: translateY(0) rotate(1.5deg); }
          50%       { transform: translateY(-8px) rotate(1.5deg); }
        }

        .anim-fade {
          opacity: 0;
          animation: anim-fade-kf 0.55s ease-out forwards;
        }
        .anim-slide {
          opacity: 0;
          animation: anim-slide-kf 0.5s ease-out forwards;
        }
        .card-float {
          animation: card-float-kf 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
