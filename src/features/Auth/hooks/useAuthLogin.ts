// Auth useAuthLogin — useAuthLogin state and API logic
import { useState, useCallback } from "react";
import { authApi } from "../services/authApi";

export function useAuthLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      if (res.returnCode === 200) {
        return res.returnData;
      }
      throw new Error(res.returnMessage || "Login failed");
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const googleLogin = useCallback(async (credential: string, clientId: string) => {
      const res = await authApi.googleLogin(credential, clientId);
      if (res.returnCode === 200) return res.returnData;
      throw new Error(res.returnMessage || "Google login failed");
  const register = useCallback(async (data: any) => {
      const res = await authApi.register(data);
      throw new Error(res.returnMessage || "Registration failed");
  return { login, googleLogin, register, loading, error };
}
