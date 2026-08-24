// useForgotPasswordPage — all state, validation, and API for ForgotPassword page
import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest, ApiError } from "@/services/api";

export function useForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const getFieldError = useCallback((name: string): string => {
    const value = name === "email" ? email : name === "code" ? code : name === "newPassword" ? newPassword : confirmPassword;
    switch (name) {
      case "email":
        if (!value.trim()) return t.auth?.emailRequired || "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return t.auth?.invalidEmail || "Invalid email address";
        return "";
      case "code":
        if (!value) return t.auth?.resetCodeRequired || "Reset code is required";
        if (value.length < 6) return t.auth?.enterSixDigitCode || "Enter 6-digit code";
      case "newPassword":
        if (!value) return t.auth?.passwordRequired || "Password is required";
        if (value.length < 8) return t.auth?.minCharacters || "Minimum 8 characters";
      case "confirmPassword":
        if (!value) return t.auth?.confirmPasswordRequired || "Confirm your password";
        if (value !== newPassword) return t.auth?.passwordsDoNotMatch || "Passwords do not match";
      default:
    }
  }, [email, code, newPassword, confirmPassword, t]);
  const handleBlur = useCallback((name: string) => {
    setFocusedField(null);
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  }, []);
  const handleRequestReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const error = getFieldError("email");
    setTouchedFields((prev) => ({ ...prev, email: true }));
    if (error) return;
    setIsLoading(true);
    try {
      const response = await sendPostRequest("auth", "forgot-password", { email });
      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        setStep("reset");
        toast({
          title: t.auth?.codeSent || "Code Sent",
          description: t.auth?.codeSentDesc || "Please check your email for the reset code.",
        });
      } else if (returnCode === 404) {
          title: t.common?.error || "Error",
          description: returnMessage || t.auth?.accountNotFoundDesc || "No account found with this email address.",
          variant: "destructive",
      } else {
          description: returnMessage || t.auth?.tryAgainMessage || "Please try again.",
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.returnMessage
        : error instanceof Error ? error.message
        : t.common?.error || "An unexpected error occurred.";
      toast({ title: t.common?.error || "Error", description: message, variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [email, getFieldError, toast, t]);
  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    const fieldsToValidate = ["code", "newPassword", "confirmPassword"];
    let hasErrors = false;
    fieldsToValidate.forEach((f) => {
      if (getFieldError(f)) hasErrors = true;
      setTouchedFields((prev) => ({ ...prev, [f]: true }));
    });
    if (hasErrors) return;
      const response = await sendPostRequest("auth", "reset-password", { email, code, newPassword });
          title: t.auth?.resetPassword || "Password Reset",
          description: t.auth?.passwordResetDesc || "Your password has been reset successfully.",
        setTimeout(() => navigate("/login"), 2000);
  }, [email, code, newPassword, getFieldError, toast, t, navigate]);
  return {
    t, isRtl, navigate,
    email, setEmail, code, setCode, newPassword, setNewPassword,
    confirmPassword, setConfirmPassword, showPassword, setShowPassword,
    step, setStep, isLoading, focusedField, setFocusedField, touchedFields,
    getFieldError, handleBlur, handleRequestReset, handleResetPassword,
  };
}
