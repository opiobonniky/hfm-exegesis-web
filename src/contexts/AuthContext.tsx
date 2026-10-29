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
import { isSupportNotificationPath, PENDING_SUPPORT_LINK } from '@/services/notificationRouting';
import { routes } from "@/components/Routes/routes";
import { clearLegacyPrivateCaches } from '@/services/privateCache';
import { GUEST_SESSION_KEY, hasGuestSession } from '@/services/guestSession';

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
  isGuest: boolean;
  startGuest: () => void;
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
const storedAccount = () => {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return String(user?.id || user?.username || user?.email || '');
  } catch { return ''; }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(hasGuestSession);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const logoutInProgress = useRef(false);

  const navigate = useNavigate(); // ← add this back
  // ── Fetch subscription status from backend ──
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const fetchSubscriptionStatus = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      setSubscriptionLoading(true);
      const res = await sendPostRequest("subscriptions", "status", {});
      if (localStorage.getItem(TOKEN_KEY) !== token) return;
      if (res.returnCode === 200 && res.returnData) {
        const tier = res.returnData.subscriptionTier || "free";
        const expires = res.returnData.accessExpiresAt || null;
        setSubscriptionTier(tier);
        setAccessExpiresAt(expires);
        // Persist to localStorage
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ tier, expires, owner: storedAccount() }));
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
    void clearLegacyPrivateCaches();
  }, []);

  // ── Surface focused-tab push payloads as notifications ──
  // FCM onMessage only fires while a tab is focused, so the service worker
  // never runs its own notification handler. We render it ourselves.
  useEffect(() => {
    if (!userInfo?.token) return;
    const unsubscribe = onForegroundMessage(payload => {
      const { notification, data } = payload;
      const title = notification?.title || String(data?.notificationTitle || 'Exegesis');
      const body = notification?.body || String(data?.notificationBody || data?.body || '');
      void showLocalNotification(title, body, data).catch(error => console.warn('[push] Foreground display failed:', error));
    });
    return () => unsubscribe();
  }, [userInfo?.token]);

  useEffect(() => {
    if (!userInfo?.token) return;
    const retry = () => { void syncPushTokenIfPermitted(); };
    const visible = () => { if (document.visibilityState === 'visible') retry(); };
    retry();
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', visible);
    return () => { window.removeEventListener('online', retry); document.removeEventListener('visibilitychange', visible); };
  }, [userInfo?.token]);

  useEffect(() => {
    if (!userInfo?.token || userInfo.mustChangePassword) return;
    const pending = sessionStorage.getItem(PENDING_SUPPORT_LINK);
    if (!pending) return;
    sessionStorage.removeItem(PENDING_SUPPORT_LINK);
    if (!isSupportNotificationPath(pending)) return;
    if (pending.startsWith('/admin/') && Number(userInfo.userRole) !== 1) return;
    navigate(pending, { replace: true });
  }, [userInfo?.token, userInfo?.mustChangePassword, userInfo?.userRole, navigate]);

  // ── Support-message notifications after a Socket.IO reminder ──
  useEffect(() => {
    const handleSupportMessage = (event: Event) => {
      if (getPushPermission() !== "granted") return;
      if (!localStorage.getItem(TOKEN_KEY)) return;
      const detail = (event as CustomEvent<{ title?: string; body?: string; data?: Record<string, unknown> }>).detail;
      void showLocalNotification(
        detail?.title || "Exegesis Support replied",
        detail?.body || "You have a new support message.",
        detail?.data,
      ).catch(error => console.warn('[push] Socket display failed:', error));
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
        if (parsed.owner && parsed.owner === storedAccount()) {
          setSubscriptionTier(parsed.tier || 'free');
          setAccessExpiresAt(parsed.expires || null);
        }
      }
    } catch { /* ignore */ }

    // Fetch fresh data from backend (async update)
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Other tabs must not keep a previous account's mounted private pages or
  // entitlements after login/logout changes shared localStorage.
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== null && event.key !== TOKEN_KEY && event.key !== USER_KEY) return;
      setSubscriptionTier('free'); setAccessExpiresAt(null);
      void clearLegacyPrivateCaches();
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        setUserInfoState(token && user ? { ...user, token } : null);
        if (token && user) void fetchSubscriptionStatus();
      } catch { setUserInfoState(null); }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [fetchSubscriptionStatus]);

  const setUserInfo = useCallback((user: UserInfo | null) => {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    setIsGuest(false);
    void clearLegacyPrivateCaches();
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setSubscriptionTier('free');
    setAccessExpiresAt(null);
    if (user) {
      const { token, ...userData } = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUserInfoState(user);
      // Fetch subscription status on login
      fetchSubscriptionStatus();
      // Re-point any existing push token at the just-logged-in user.
      // Only if permission was already granted — never prompts from here.
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SUBSCRIPTION_KEY);
      setUserInfoState(null);
      setSubscriptionTier("free");
      setAccessExpiresAt(null);
      // Best-effort: remove this device's push token from the backend so the
      // previous user stops receiving pushes on shared computers.
      void disableWebPush(false);
    }
  }, [fetchSubscriptionStatus]);

  const logout = useCallback(async () => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;

    try {
      // Keep the backend token available while unregistering this device's push token.
      await Promise.allSettled([disableWebPush(false), signOut(auth)]);
    } finally {
      await clearLegacyPrivateCaches();
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      setIsGuest(false);
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

  const startGuest = useCallback(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      navigate(routes.bibleReader.path);
      return;
    }
    sessionStorage.setItem(GUEST_SESSION_KEY, '1');
    setIsGuest(true);
    navigate(routes.bibleReader.path);
  }, [navigate]);

  const value = useMemo(() => ({
    userInfo,
    setUserInfo,
    isAuthenticated: !!userInfo?.token,
    isGuest: isGuest && !userInfo?.token,
    startGuest,
    loading,
    authLoading: loading,
    logout,
    subscriptionTier,
    accessExpiresAt,
    subscriptionLoading,
    fetchSubscriptionStatus,
  }), [
    userInfo,
    isGuest,
    startGuest,
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
