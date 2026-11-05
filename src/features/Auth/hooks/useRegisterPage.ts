import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebaseConfiguration/config";
import { tt } from "@/components/languages/hardcodedTranslate";
import { finishRegistration, registrationFieldError } from "../registration";

const stepFields = [["firstName", "lastName", "dateOfBirth"], ["email", "username", "phoneNumber"], ["password", "confirmPassword"]];
export function useRegisterPage() {
  const navigate = useNavigate(); const { t, isRtl } = useLanguage(); const { toast } = useToast(); const { setUserInfo } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", username: "", phoneNumber: "", password: "", confirmPassword: "", gender: "Not Specified", dateOfBirth: "" });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [code, setCode] = useState(""); const [resendSeconds, setResendSeconds] = useState(0);
  const [error, setError] = useState(""); const busy = useRef(false);
  useEffect(() => { if (!resendSeconds) return; const id = window.setTimeout(() => setResendSeconds(v => v - 1), 1000); return () => clearTimeout(id); }, [resendSeconds]);
  const getFieldError = useCallback((name: string) => registrationFieldError(name, formData[name as keyof typeof formData] || "", formData.password), [formData]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: name === "username" ? value.replace(/\s/g, "").toLowerCase() : value })); setError("");
  }, []);
  const handleBlur = (name: string) => { setFocusedField(null); setTouchedFields(p => ({ ...p, [name]: true })); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy.current) return; setError("");
    if (step < 4) {
      const fields = step === 3 ? stepFields.flat() : stepFields[step - 1];
      const invalid = fields.find(f => getFieldError(f));
      setTouchedFields(p => ({ ...p, ...Object.fromEntries(fields.map(f => [f, true])) }));
      if (invalid) { setStep(stepFields.findIndex(fs => fs.includes(invalid)) + 1); return; }
      if (step < 3) { setStep(step + 1); return; }
    } else if (!/^\d{6}$/.test(code)) { setError("Please enter the 6-digit code"); return; }
    busy.current = true; setIsLoading(true);
    try {
      const email = formData.email.trim().toLowerCase();
      if (step === 4) {
        const res = await sendPostRequest("auth", "verify-account", { email, code });
        if (res.returnCode !== 200 || !res.returnData?.token) throw new Error(res.returnMessage || "Verification failed");
        await finishRegistration(res.returnData, profilePhoto, setUserInfo, () => toast({ title: tt("Account created, but the photo could not be uploaded") }));
        navigate(res.returnData.userRole === 1 ? "/admin" : routes.landing.path, { replace: true });
      } else {
        const clientIP = await getClientIP();
        const { confirmPassword: _confirm, ...fields } = formData;
        const res = await sendPostRequest("auth", "register", { ...fields, firstName: fields.firstName.trim(), lastName: fields.lastName.trim(), email, username: fields.username.trim().toLowerCase(), dateOfBirth: fields.dateOfBirth || undefined, userRole: 2, deviceInfo: { ...getDeviceInfo(), ip: clientIP } });
        if (res.returnCode !== 200) throw new Error(res.returnMessage || "Registration failed");
        setStep(4); setResendSeconds(60); toast({ title: tt("Check your email for the verification code") });
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Please try again"); }
    finally { busy.current = false; setIsLoading(false); }
  };
  const handleResend = async () => {
    if (resendSeconds || busy.current) return; busy.current = true; setIsLoading(true); setError("");
    try { const res = await sendPostRequest("auth", "resend-verification", { email: formData.email.trim().toLowerCase() }); if (res.returnCode !== 200) throw new Error(res.returnMessage || "Could not resend code"); setResendSeconds(60); toast({ title: tt("Code resent!") }); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not resend code"); }
    finally { busy.current = false; setIsLoading(false); }
  };
  const handleGoogleLogin = async () => {
    if (busy.current) return; busy.current = true; setIsGoogleLoading(true); setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider); const idToken = GoogleAuthProvider.credentialFromResult(result)?.idToken;
      if (!idToken) throw new Error("Could not verify Google sign-in");
      const res = await sendPostRequest("auth", "google-login", { idToken });
      if (res.returnCode === 200 && res.returnData?.token) { setUserInfo(res.returnData); navigate(routes.landing.path); }
      else if (res.returnData?.needsRegistration && res.returnData?.registrationProof) navigate(routes.googleRegister.path, { state: res.returnData });
      else throw new Error(res.returnMessage || "Google sign-in failed");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
    finally { busy.current = false; setIsGoogleLoading(false); }
  };
  return { data: { t, isRtl, step, formData, profilePhoto, showPassword, showConfirmPassword, isLoading, isGoogleLoading, focusedField, touchedFields, code, resendSeconds, error }, actions: { navigate, setStep, setProfilePhoto, setShowPassword, setShowConfirmPassword, setFocusedField, getFieldError, handleChange, handleBlur, handleSubmit, handleGoogleLogin, setCode, handleResend } };
}
