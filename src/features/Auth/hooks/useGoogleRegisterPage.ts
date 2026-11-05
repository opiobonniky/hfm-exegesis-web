import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import { tt } from "@/components/languages/hardcodedTranslate";
import { finishRegistration, registrationFieldError } from "../registration";

export interface GoogleRegistrationIdentity { registrationProof?: string; email?: string; firstName?: string; lastName?: string; photoUrl?: string }
export function useGoogleRegisterPage() {
  const navigate = useNavigate(); const location = useLocation(); const { toast } = useToast(); const { setUserInfo } = useAuth(); const { t, isRtl } = useLanguage();
  const state = location.state as GoogleRegistrationIdentity | null;
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(() => `${state?.firstName || ""}${state?.lastName || ""}`.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase());
  const [phoneNumber, setPhoneNumber] = useState(""); const [gender, setGender] = useState("Not Specified");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const busy = useRef(false);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy.current) return;
    if (!state?.registrationProof) { setError("Your Google sign-in has expired. Please sign in again."); return; }
    const profileError = registrationFieldError("username", username) || registrationFieldError("phoneNumber", phoneNumber);
    if (profileError) { setStep(1); setError(profileError); return; }
    if (step === 1) { setError(""); setStep(2); return; }
    const passwordError = registrationFieldError("password", password) || registrationFieldError("confirmPassword", confirmPassword, password);
    if (passwordError) { setError(passwordError); return; }
    busy.current = true; setLoading(true); setError("");
    try {
      const ip = await getClientIP();
      // The signed proof, not editable browser identity fields, determines the
      // Google subject, email and name on the server.
      const res = await sendPostRequest("auth", "complete-google-registration", { registrationProof: state?.registrationProof, username: username.trim().toLowerCase(), phoneNumber: phoneNumber.trim(), gender, password, deviceInfo: { ...getDeviceInfo(), ip } });
      if (res.returnCode !== 200 || !res.returnData?.token) throw new Error(res.returnMessage || "Registration failed");
      await finishRegistration(res.returnData, profilePhoto, setUserInfo, () => toast({ title: tt("Account created, but the photo could not be uploaded") }));
      toast({ title: tt("Welcome!") }); navigate(res.returnData.userRole === 1 ? "/admin" : routes.landing.path, { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : "Network error. Please try again."); }
    finally { busy.current = false; setLoading(false); }
  };
  return { data: { t, isRtl, state, step, username, phoneNumber, gender, profilePhoto, password, confirmPassword, showPassword, showConfirmPassword, loading, error }, actions: { setStep, setUsername, setPhoneNumber, setGender, setProfilePhoto, setPassword, setConfirmPassword, setShowPassword, setShowConfirmPassword, handleRegister } };
}
