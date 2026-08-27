import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { getDeviceInfo, getClientIP } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";

export function useGoogleRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUserInfo } = useAuth();
  const { t, isRtl } = useLanguage();

  const state = location.state as any;
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError("Username is required"); return; }
    setError(""); setLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const clientIP = await getClientIP();
      const res = await sendPostRequest("auth", "google-register", {
        googleId: state?.googleId,
        email: state?.email,
        firstName: state?.firstName,
        lastName: state?.lastName,
        photoUrl: state?.photoUrl,
        phoneNumber, username,
        deviceInfo: { ...deviceInfo, ip: clientIP },
      });
      if (res?.returnCode === 200 && res.returnData) {
        setUserInfo(res.returnData);
        toast({ title: "Welcome!" });
        navigate(res.returnData.userRole === 1 ? routes.dashboard.path : routes.userDashboard.path);
      } else {
        setError(res?.returnMessage || "Registration failed");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }, [state, phoneNumber, username, toast, setUserInfo, navigate]);

  return {
    t, isRtl, state, phoneNumber, setPhoneNumber,
    username, setUsername, password, setPassword,
    confirmPassword, setConfirmPassword, showPassword, setShowPassword,
    passwordMismatch, loading, error, handleRegister,
  };
}
