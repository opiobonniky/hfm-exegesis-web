// useLoginPage — all state, effects, and API logic for Login page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/firebaseConfiguration/config";

export function useLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserInfo, userInfo, loading: authLoading } = useAuth();
  const { t, isRtl, setLanguage, lang: currentLang, isLoading: langLoading } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    if (!authLoading && userInfo) navigate("/dashboard", { replace: true });
  }, [userInfo, authLoading, navigate]);

  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)";
    return () => { document.body.style.background = ""; };
  }, []);

  // ─── Google Login ──────────────────────────────────────────────────────────
  const processGoogleResult = useCallback(async (result: any) => {
    try {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;
      if (!idToken) throw new Error(t.auth?.googleLoginFailed || "Could not get Google ID token");
      const { user } = result;
      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP();
      const responseBackend = await sendPostRequest("auth", "google-login", {
        idToken, email: user.email || "", firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "", photoUrl: user.photoURL || "",
        deviceInfo: { ...deviceInfo, ip: clientIP },
      });
      const { returnCode, returnData, returnMessage } = responseBackend;
      if (returnCode === 200 && returnData) {
        const ui = { token: returnData.token, tokenType: returnData.tokenType, id: returnData.id, username: returnData.username, email: returnData.email, firstName: returnData.firstName, lastName: returnData.lastName, profilePhotoUrl: returnData.profilePhotoUrl, userRole: returnData.userRole, roleName: returnData.roleName };
        setUserInfo(ui);
        navigate(returnData.userRole === 1 ? routes.dashboard.path : routes.userDashboard.path);
      } else if (returnCode === 201 && returnData?.needsRegistration) {
        navigate(routes.googleRegister.path, { state: { googleId: returnData.googleId, email: returnData.email, firstName: returnData.firstName, lastName: returnData.lastName, photoUrl: returnData.photoUrl } });
      } else {
        toast({ title: t.auth?.googleLoginFailed || "Google Login Failed", description: returnMessage || t.auth?.unableToSignInGoogle || "Unable to sign in with Google.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: t.auth?.googleLoginFailed || "Google Login Failed", description: error.message || t.auth?.unableToSignInGoogle || "Unable to sign in with Google.", variant: "destructive" });
    } finally { setIsGoogleLoading(false); }
  }, [setUserInfo, navigate, toast, t]);

  useEffect(() => {
    getRedirectResult(auth).then((result) => { if (result) processGoogleResult(result); })
      .catch((error) => { toast({ title: t.auth?.googleLoginFailed || "Google Login Failed", description: error.message || t.auth?.unableToSignInGoogle || "Unable to sign in with Google.", variant: "destructive" }); });
  }, [processGoogleResult, toast, t]);

  // ─── Email/Password Login ──────────────────────────────────────────────────
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: "Please fill in all fields", variant: "destructive" }); return; }
    setIsLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP();
      const res = await sendPostRequest("auth", "login", { username: email, password, deviceInfo: { ...deviceInfo, ip: clientIP } });
      if (res?.returnCode === 200 && res.returnData) {
        setUserInfo(res.returnData);
        toast({ title: "Welcome back!" });
        navigate(res.returnData.userRole === 1 ? routes.dashboard.path : routes.userDashboard.path);
      } else {
        toast({ title: res?.returnMessage || "Login failed", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: err?.message || "Login failed", variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [email, password, toast, setUserInfo, navigate]);

  // ─── Google Popup Login ────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch (error: any) {
      setIsGoogleLoading(false);
      if (error.code !== "auth/popup-closed-by-user") {
        toast({ title: t.auth?.googleLoginFailed || "Google Login Failed", description: error.message || t.auth?.unableToSignInGoogle || "Unable to sign in with Google.", variant: "destructive" });
      }
    }
  }, [toast, t]);

  return {
    navigate, t, isRtl, setLanguage, currentLang, langLoading,
    email, setEmail, password, setPassword, showPassword, setShowPassword,
    isLoading, isGoogleLoading, emailFocused, setEmailFocused,
    passwordFocused, setPasswordFocused, handleLogin, handleGoogleLogin,
  };
}
