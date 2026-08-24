// useGoogleRegister — all state for GoogleRegister page
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useGoogleRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = useCallback(async () => {
    if (!firstName.trim()) { setError("First name is required"); return; }
    setError(""); setLoading(true);
    try {
      const res = await sendPostRequest("auth", "google-register", { firstName, lastName });
      if (res?.returnCode === 200) { toast({ title: "Welcome!" }); navigate("/"); }
      else { setError(res?.returnMessage || "Registration failed"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }, [firstName, lastName, toast, navigate]);

  return { firstName, setFirstName, lastName, setLastName, loading, error, handleRegister };
}
