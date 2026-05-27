import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* ── Left Panel (Desktop Only) ── */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-slate-800">
        {/* Modern background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
          <div
            className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div
            className="absolute bottom-1/4 -left-24 w-72 h-72 bg-accent/10 rounded-full blur-[80px] animate-pulse"
            style={{ animationDuration: "10s", animationDelay: "2s" }}
          />

          {/* Subtle pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          <div
            className="anim-fade space-y-12"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Logo Section */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
              <Link to="/" className="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center p-8 shadow-2xl hover:border-white/20 transition-colors">
                <img
                  src={logoImage}
                  alt="Exegesis Logo"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </Link>
            </div>

            {/* Content Section */}
            <div className="space-y-6 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-tight">
                Experience the <span className="text-primary">Word</span> like
                never before.
              </h2>
              <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
              <blockquote className="text-xl md:text-2xl text-slate-300 font-medium italic leading-relaxed">
                "Your word is a lamp for my feet, a light on my path."
              </blockquote>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">
                Psalm 119:105
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="absolute bottom-10 left-0 w-full px-16 flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-widest anim-fade"
          style={{ animationDelay: "0.5s" }}
        >
          <span>© 2024 Exegesis Bible</span>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">
              Instagram
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Twitter
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-8 py-8 lg:py-0">
          {/* Logo - shown on both mobile and desktop now for consistency with app */}
          <Link to="/" className="flex flex-col items-center gap-3 mb-2 anim-fade">
            <div className="w-32 h-32 flex items-center justify-center p-2">
              <img
                src={logoImage}
                alt="Exegesis Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Heading */}
          <div
            className="anim-fade text-center"
            style={{ animationDelay: "0.1s" }}
          >
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
              Welcome Back!
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to continue your journey.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 anim-fade"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Email input */}
            <div className="space-y-1">
              <div className="flex group h-14">
                <div className="w-12 flex items-center justify-center bg-white border border-r-0 border-slate-200 rounded-l-xl group-focus-within:border-primary transition-colors shadow-sm">
                  <Mail className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-primary" />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full h-full px-4 pt-4 bg-white border border-slate-200 rounded-r-xl focus:outline-none focus:border-primary transition-all text-[15px] shadow-sm"
                    required
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-4 transition-all pointer-events-none ${
                      emailFocused || email
                        ? "top-1.5 text-[12px] text-primary"
                        : "top-4 text-[15px] text-slate-400"
                    }`}
                  >
                    Email Address
                  </label>
                </div>
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <div className="flex group h-14">
                <div className="w-12 flex items-center justify-center bg-white border border-r-0 border-slate-200 rounded-l-xl group-focus-within:border-primary transition-colors shadow-sm">
                  <Lock className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-primary" />
                </div>
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="w-full h-full px-4 pt-4 pr-12 bg-white border border-slate-200 rounded-r-xl focus:outline-none focus:border-primary transition-all text-[15px] shadow-sm"
                    required
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all pointer-events-none ${
                      passwordFocused || password
                        ? "top-1.5 text-[12px] text-primary"
                        : "top-4 text-[15px] text-slate-400"
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "SIGN IN"
              )}
            </button>

            {/* Create Account button */}
            <button
              type="button"
              className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl font-semibold text-[15px] text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200"
              onClick={() => navigate("/register")}
            >
              Create New Account
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">
                or continue with
              </span>
              <div className="flex-1 h-[1px] bg-slate-100" />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 font-semibold text-slate-900 relative"
              onClick={() => handleGoogleLogin()}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <>
                  <img
                    src={googleIcon}
                    alt="Google"
                    className="w-5 h-5 absolute left-6"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="space-y-3">
            <p className="text-[11px] text-center text-slate-400 leading-relaxed max-w-[300px] mx-auto">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-primary font-bold underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary font-bold underline">
                Privacy Policy
              </Link>
            </p>
            <p className="text-[11px] text-center text-slate-400 font-medium">
              Full version arriving with public launch.
            </p>
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
