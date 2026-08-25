// useVerifyAccount — all state for VerifyAccount page
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useVerifyAccount() {
  const { toast } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCodeChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      const next = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement;
      next?.focus();
    }
  }, [code]);

  const handleVerify = useCallback(async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) { setError("Please enter the 6-digit code"); return; }
    setError(""); setLoading(true);
    try {
      const res = await sendPostRequest("auth", "verify-email", { code: verificationCode });
      if (res?.returnCode === 200) { setSuccess(true); toast({ title: "Account verified!" }); }
      else { setError(res?.returnMessage || "Invalid code"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }, [code, toast]);

  const handleResend = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("auth", "resend-verification", {});
      if (res?.returnCode === 200) toast({ title: "Code resent!" });
      else toast({ title: "Failed to resend", variant: "destructive" });
    } catch { toast({ title: "Failed to resend", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  return { code, handleCodeChange, loading, error, success, handleVerify, handleResend };
}
