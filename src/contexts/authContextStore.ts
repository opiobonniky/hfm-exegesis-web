import { createContext, useContext } from 'react';

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
  mustChangePassword?: boolean;
}

export type AuthContextType = {
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

// Route/provider-independent so provider hot updates preserve context identity.
export const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
