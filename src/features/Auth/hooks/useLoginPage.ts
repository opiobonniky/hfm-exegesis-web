// useLoginPage — all state, effects, and API logic for Login page
import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/firebaseConfiguration/config";

import { LoginPageModel } from "../types";

export function useLoginPage(): LoginPageModel {
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
  const handleLogin = useCallback(async (e: FormEvent<HTMLFormElement>) => {
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

  const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);
  const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);
  const handleEmailFocus = useCallback((id: string | null) => {
    setEmailFocused(Boolean(id));
  }, []);
  const handlePasswordFocus = useCallback((id: string | null) => {
    setPasswordFocused(Boolean(id));
  }, []);
  const handleEmailBlur = useCallback(() => setEmailFocused(false), []);
  const handlePasswordBlur = useCallback(() => setPasswordFocused(false), []);
  const taglineParts = (t.auth?.experienceTheWord || "Experience the {word} like never before.").split("{word}");

  return {
    isRtl,
    setLanguage,
    currentLang,
    langLoading,
    email,
    password,
    showPassword,
    setShowPassword,
    isLoading,
    isGoogleLoading,
    emailFocused,
    passwordFocused,
    handleLogin,
    handleGoogleLogin,
    handleEmailChange,
    handlePasswordChange,
    handleEmailFocus,
    handlePasswordFocus,
    handleEmailBlur,
    handlePasswordBlur,
    taglineStart: taglineParts[0],
    taglineEnd: taglineParts[1],
    wordLabel: t.auth?.word || "Word",
    quote: t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path.",
    attribution: t.auth?.psalmReference || "Psalm 119:105",
    title: t.auth?.signIn || "Welcome Back!",
    subtitle: t.auth?.dontHaveAccount || "Sign in to continue your journey.",
    languageLabels: {
      primary: t.languageGroups?.primary,
      european: t.languageGroups?.european,
      indian: t.languageGroups?.indian,
      other: t.languageGroups?.other,
    },
    emailLabel: t.common?.email || "Email Address",
    passwordLabel: t.common?.password || "Password",
    forgotPasswordLabel: t.auth?.forgotPassword || "Forgot password?",
    signInLabel: (t.auth?.signIn || "SIGN IN").toUpperCase(),
    termsLabel: t.auth?.agreeToTerms || "By continuing, you agree to our",
    termsLinkLabel: t.auth?.terms || "Terms of Service",
    privacyLabel: "and",
    privacyLinkLabel: t.auth?.privacyPolicy || "Privacy Policy",
    additionalNote: t.auth?.fullVersionComing || "Full version arriving with public launch.",
  };
}
