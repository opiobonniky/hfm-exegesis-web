// Registration hook — handles form state, validation, and API calls
import { useState, useCallback } from "react";
import { sendPostRequest } from "@/services/api";

export function useAuthRegister() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");

  const register = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("auth", "register", data);
      if (res.returnCode === 200) setStep("verify");
      return res;
    } finally { setLoading(false); }
  }, []);

  const verify = useCallback(async (code: string, email: string) => {
    return await sendPostRequest("auth", "verify-account", { code, email });
  }, []);

  const resendCode = useCallback(async (email: string) => {
    return await sendPostRequest("auth", "resend-verification", { email });
  }, []);

  return { loading, step, register, verify, resendCode };
}
