import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebaseConfiguration/config";

export function useRegisterPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const { setUserInfo } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", username: "",
    phoneNumber: "", password: "", confirmPassword: "",
    gender: "", dateOfBirth: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const getFieldError = useCallback((name: string) => {
    const v = (formData as any)[name] || "";
    switch (name) {
      case "firstName": return !v.trim() ? "First name is required" : "";
      case "lastName": return !v.trim() ? "Last name is required" : "";
      case "email": return !v.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(v) ? "Invalid email" : "";
      case "username": return !v.trim() ? "Username is required" : v.length < 3 ? "Too short" : "";
      case "password": return !v ? "Password is required" : v.length < 8 ? "Min 8 characters" : "";
      case "confirmPassword": return !v ? "Confirm password" : v !== formData.password ? "Passwords do not match" : "";
      default: return "";
    }
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setDirtyFields(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((name: string) => {
    setFocusedField(null);
    if (dirtyFields[name]) setTouchedFields(prev => ({ ...prev, [name]: true }));
  }, [dirtyFields]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const step1Fields = ["firstName", "lastName", "email", "username"];
    const step2Fields = ["password", "confirmPassword"];
    const fields = step === 1 ? step1Fields : step2Fields;
    let hasErrors = false;
    fields.forEach(f => { if (getFieldError(f)) hasErrors = true; setTouchedFields(prev => ({ ...prev, [f]: true })); });
    if (hasErrors) return;
    if (step === 1) { setStep(2); return; }
    setIsLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP();
      const res = await sendPostRequest("auth", "register", {
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, username: formData.username,
        phoneNumber: formData.phoneNumber, password: formData.password,
        gender: formData.gender, dateOfBirth: formData.dateOfBirth,
        deviceInfo: { ...deviceInfo, ip: clientIP },
      });
      if (res?.returnCode === 200) {
        toast({ title: "Registration successful!" });
        navigate("/verify-account", { state: { email: formData.email } });
      } else if (res?.returnCode === 405 && res.returnData?.needsRegistration) {
        navigate(routes.googleRegister.path, { state: res.returnData });
      } else {
        toast({ title: res?.returnMessage || "Registration failed", variant: "destructive" });
      }
    } catch (err: any) { toast({ title: err?.message || "Error", variant: "destructive" }); }
    finally { setIsLoading(false); }
  }, [formData, step, toast, navigate, getFieldError]);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;
      const user = result.user;
      const res = await sendPostRequest("auth", "google-login", {
        idToken, email: user.email || "", firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "", photoUrl: user.photoURL || "",
      });
      if (res?.returnCode === 200 && res.returnData) {
        setUserInfo(res.returnData);
        navigate(res.returnData.userRole === 1 ? routes.dashboard.path : routes.userDashboard.path);
      } else if (res?.returnCode === 201 && res.returnData?.needsRegistration) {
        navigate(routes.googleRegister.path, { state: res.returnData });
      } else {
        toast({ title: res?.returnMessage || "Google login failed", variant: "destructive" });
      }
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast({ title: "Google login failed", description: error.message, variant: "destructive" });
      }
    } finally { setIsGoogleLoading(false); }
  }, [setUserInfo, navigate, toast]);

  return {
    t, isRtl, navigate, step, setStep, formData, showPassword, setShowPassword,
    isLoading, isGoogleLoading, focusedField, setFocusedField,
    touchedFields, dirtyFields, getFieldError, handleChange, handleBlur,
    handleSubmit, handleGoogleLogin,
  };
}
