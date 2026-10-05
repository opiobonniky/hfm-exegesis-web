import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { tt } from '@/components/languages/hardcodedTranslate';

export function useVerifyAccountPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateEmail = (location.state as { email?: unknown } | null)?.email;
  const initialEmail = searchParams.get("email") || (typeof stateEmail === "string" ? stateEmail : "");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const handleVerify = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (code.length !== 6) { setError("Please enter the 6-digit code"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await sendPostRequest("auth", "verify-account", { email: email.trim(), code });
      if (res?.returnCode === 200) {
        setSuccess(true);
        if (res.returnData) setUserInfo(res.returnData);
        toast({ title: tt("Account verified!") });
        setTimeout(() => navigate(routes.landing.path), 2000);
      } else {
        setError(res?.returnMessage || "Invalid code");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setIsLoading(false); }
  }, [code, email, toast, setUserInfo, navigate]);
  const handleResend = useCallback(async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setIsResending(true);
    try {
      const res = await sendPostRequest("auth", "resend-verification", { email: email.trim() });
      if (res?.returnCode === 200) toast({ title: tt("Code resent!") });
      else toast({ title: tt("Failed to resend"), variant: "destructive" });
    } catch { toast({ title: tt("Failed to resend"), variant: "destructive" }); }
    finally { setIsResending(false); }
  }, [email, toast]);
  return {
    data: { t, isRtl, email, emailLocked: Boolean(initialEmail), code, isLoading, isResending, success, error },
    actions: { setEmail, setCode, handleVerify, handleResend },
  };
}
