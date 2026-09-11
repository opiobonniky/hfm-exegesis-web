// useForceChangePasswordPage — state, validation, and API for the forced
// password-change screen shown to users still on the admin-issued temporary
// password. They cannot reach any other page until this succeeds.
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

export function useForceChangePasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userInfo, setUserInfo } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const passwordPolicyError = useCallback((value: string): string => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Minimum 8 characters";
    if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
      return "Must include uppercase, lowercase, number, and special character";
    }
    if (value === currentPassword) return "Must be different from the temporary password";
    return "";
  }, [currentPassword]);

  const getFieldError = useCallback((name: string): string => {
    switch (name) {
      case "currentPassword":
        return currentPassword ? "" : "Enter the temporary password from your email";
      case "newPassword":
        return passwordPolicyError(newPassword);
      case "confirmPassword":
        if (!confirmPassword) return "Confirm your new password";
        if (confirmPassword !== newPassword) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  }, [currentPassword, newPassword, confirmPassword, passwordPolicyError]);

  const handleBlur = useCallback((name: string) => {
    setFocusedField(null);
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = ["currentPassword", "newPassword", "confirmPassword"];
    let hasErrors = false;
    fields.forEach((f) => {
      if (getFieldError(f)) hasErrors = true;
      setTouchedFields((prev) => ({ ...prev, [f]: true }));
    });
    if (hasErrors) return;

    setIsLoading(true);
    try {
      const res = await sendPostRequest("auth", "force-change-password", {
        currentPassword,
        newPassword,
      });
      if (res?.returnCode === 200) {
        // Clear the interlock so the route guard lets the user through
        if (userInfo) {
          setUserInfo({ ...userInfo, mustChangePassword: false });
        }
        toast({
          title: "Password Updated",
          description: "Your new password is ready. Welcome to Exegesis!",
        });
        navigate(userInfo?.userRole === 1 ? routes.dashboard.path : routes.userDashboard.path, { replace: true });
      } else {
        toast({
          title: "Could not update password",
          description: res?.returnMessage || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Could not update password",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, getFieldError, userInfo, setUserInfo, toast, navigate]);

  return {
    data: {
      currentPassword,
      newPassword,
      confirmPassword,
      showPassword,
      isLoading,
      focusedField,
      touchedFields,
    },
    actions: {
      setCurrentPassword,
      setNewPassword,
      setConfirmPassword,
      setShowPassword,
      setFocusedField,
      getFieldError,
      handleBlur,
      handleSubmit,
    },
  };
}
