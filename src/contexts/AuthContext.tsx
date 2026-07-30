// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePhotoUrl?: string;
  token: string;
  userRole?: number;
  roleName?: string;
}

type AuthContextType = {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  authLoading: boolean;
  logout: () => void;
  subscriptionTier: string;
  accessExpiresAt: string | null;
  fetchSubscriptionStatus: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "user_data";
const TOKEN_KEY = "auth_token";
const SUBSCRIPTION_KEY = "subscription_data";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);

  const navigate = useNavigate(); // ← add this back
  // ── Fetch subscription status from backend ──
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const res = await sendPostRequest("subscriptions", "status", {});
      if (res.returnCode === 200 && res.returnData) {
        const tier = res.returnData.subscriptionTier || "free";
        const expires = res.returnData.accessExpiresAt || null;
        setSubscriptionTier(tier);
        setAccessExpiresAt(expires);
        // Persist to localStorage
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ tier, expires }));
      }
    } catch {
      // Non-critical — fall back to cached or default
    }
  }, []);

  // ── Load auth + subscription data on mount ──
  useEffect(() => {
    const loadAuth = () => {
      if (userInfo) {
        // Admin users (role 1) go to admin dashboard; regular users go to home dashboard
        const target = userInfo.userRole === 1 ? "/dashboard" : "/home";
        navigate(target, { replace: true });
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        if (token && userStr) {
          const parsed = JSON.parse(userStr);
          setUserInfoState({ ...parsed, token });
        }
      } catch (err) {
        console.error("Failed to parse auth data", err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  // ── On mount, restore cached subscription or fetch fresh ──
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    // Try cached subscription data first (instant render)
    try {
      const cached = localStorage.getItem(SUBSCRIPTION_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSubscriptionTier(parsed.tier || "free");
        setAccessExpiresAt(parsed.expires || null);
      }
    } catch { /* ignore */ }

    // Fetch fresh data from backend (async update)
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const setUserInfo = useCallback((user: UserInfo | null) => {
    if (user) {
      const { token, ...userData } = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUserInfoState(user);
      // Fetch subscription status on login
      fetchSubscriptionStatus();
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SUBSCRIPTION_KEY);
      setUserInfoState(null);
      setSubscriptionTier("free");
      setAccessExpiresAt(null);
    }
  }, [fetchSubscriptionStatus]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setUserInfoState(null);
    setSubscriptionTier("free");
    setAccessExpiresAt(null);
    toast({
      title: "Signed out",
      description: "You have been logged out.",
    });
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      toast({
        title: "Session Expired",
        description: "Please sign in again.",
        variant: "destructive",
      });
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session-expired", handleSessionExpired);
  }, [logout, toast]);

  const value = useMemo(() => ({
    userInfo,
    setUserInfo,
    isAuthenticated: !!userInfo?.token,
    loading,
    authLoading: loading,
    logout,
    subscriptionTier,
    accessExpiresAt,
    fetchSubscriptionStatus,
  }), [
    userInfo,
    setUserInfo,
    loading,
    logout,
    subscriptionTier,
    accessExpiresAt,
    fetchSubscriptionStatus,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
