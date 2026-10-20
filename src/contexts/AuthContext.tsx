// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/firebaseConfiguration/config";
import { sendPostRequest } from "@/services/api";
import {
  disableWebPush,
  syncPushTokenIfPermitted,
  onForegroundMessage,
  showLocalNotification,
  getPushPermission,
} from "@/services/pushService";
import { routes } from "@/components/Routes/routes";

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
  /** True while the user still signs in with the admin-issued temporary password */
  mustChangePassword?: boolean;
}

type AuthContextType = {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  authLoading: boolean;
  logout: () => Promise<void>;
  subscriptionTier: string;
  accessExpiresAt: string | null;
  subscriptionLoading: boolean;
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
  const logoutInProgress = useRef(false);

  const navigate = useNavigate(); // ← add this back
  // ── Fetch subscription status from backend ──
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
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
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  // ── Load auth + subscription data on mount ──
  useEffect(() => {
    const loadAuth = () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        if (token && userStr) {
          const parsed = JSON.parse(userStr);
          setUserInfoState({ ...parsed, token });
          void syncPushTokenIfPermitted();
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

  // ── Surface focused-tab push payloads as notifications ──
  // FCM onMessage only fires while a tab is focused, so the service worker
  // never runs its own notification handler. We render it ourselves.
  useEffect(() => {
    const unsubscribe = onForegroundMessage(payload => {
      const { notification, data } = payload;
      const title = notification?.title || "Exegesis";
      const body = notification?.body || String(data?.body || "");
      void showLocalNotification(title, body);
    });
    return () => unsubscribe();
  }, []);

  // ── Support-message notifications after a Socket.IO reminder ──
  useEffect(() => {
    const handleSupportMessage = (event: Event) => {
      if (getPushPermission() !== "granted") return;
      if (document.visibilityState === "visible") return;
      const detail = (event as CustomEvent<{ title?: string; body?: string }>).detail;
      void showLocalNotification(
        detail?.title || "Exegesis Support replied",
        detail?.body || "You have a new support message.",
      );
    };
    window.addEventListener("support:notify", handleSupportMessage);
    return () => window.removeEventListener("support:notify", handleSupportMessage);
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
      // Re-point any existing push token at the just-logged-in user.
      // Only if permission was already granted — never prompts from here.
      void syncPushTokenIfPermitted();
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SUBSCRIPTION_KEY);
      setUserInfoState(null);
      setSubscriptionTier("free");
      setAccessExpiresAt(null);
      // Best-effort: remove this device's push token from the backend so the
      // previous user stops receiving pushes on shared computers.
      void disableWebPush();
    }
  }, [fetchSubscriptionStatus]);

  const logout = useCallback(async () => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;

    try {
      // Keep the backend token available while unregistering this device's push token.
      await Promise.allSettled([disableWebPush(), signOut(auth)]);
    } finally {
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
      navigate(routes.login.path, { replace: true });
      logoutInProgress.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    const handleSessionExpired = () => {
      void logout();
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
    subscriptionLoading,
    fetchSubscriptionStatus,
  }), [
    userInfo,
    setUserInfo,
    loading,
    logout,
    subscriptionTier,
    accessExpiresAt,
    subscriptionLoading,
    fetchSubscriptionStatus,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
