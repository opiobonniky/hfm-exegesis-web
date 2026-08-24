// useForgotPassword — all state for ForgotPassword page
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) { setError("Email is required"); return; }
    setError(""); setLoading(true);
    try {
      const res = await sendPostRequest("auth", "forgot-password", { email });
      if (res?.returnCode === 200) { setSent(true); toast({ title: "Reset link sent" }); }
      else { setError(res?.returnMessage || "Failed to send reset link"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }, [email, toast]);

  return { email, setEmail, loading, sent, error, handleSubmit };
}
