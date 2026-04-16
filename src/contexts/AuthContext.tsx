// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "user_data";
const TOKEN_KEY = "auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // ← add this back
  const { toast } = useToast();

  useEffect(() => {
    const loadAuth = () => {
      if (userInfo) {
        navigate("/dashboard", { replace: true });
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

  const setUserInfo = (user: UserInfo | null) => {
    if (user) {
      const { token, ...userData } = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUserInfoState(user);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUserInfoState(null);
    }
  };

  const logout = () => {
    setUserInfo(null);
    toast({
      title: "Signed out",
      description: "You have been logged out.",
    });
    navigate("/login", { replace: true });
  };

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
  }, [logout, toast]); // ← dependencies fixed

  const value = {
    userInfo,
    setUserInfo,
    isAuthenticated: !!userInfo?.token,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
