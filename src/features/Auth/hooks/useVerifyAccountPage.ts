import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export function useVerifyAccountPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);
  const handleVerify = useCallback(async () => {
    if (code.length !== 6) { setError("Please enter the 6-digit code"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await sendPostRequest("auth", "verify-email", { email, code });
      if (res?.returnCode === 200) {
        setSuccess(true);
        if (res.returnData) setUserInfo(res.returnData);
        toast({ title: "Account verified!" });
        setTimeout(() => navigate("/user-dashboard"), 2000);
      } else {
        setError(res?.returnMessage || "Invalid code");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setIsLoading(false); }
  }, [code, email, toast, setUserInfo, navigate]);
  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      const res = await sendPostRequest("auth", "resend-verification", { email });
      if (res?.returnCode === 200) toast({ title: "Code resent!" });
      else toast({ title: "Failed to resend", variant: "destructive" });
    } catch { toast({ title: "Failed to resend", variant: "destructive" }); }
    finally { setIsResending(false); }
  }, [email, toast]);
  return { t, isRtl, email, setEmail, code, setCode, isLoading, isResending, success, error, handleVerify, handleResend };
}
