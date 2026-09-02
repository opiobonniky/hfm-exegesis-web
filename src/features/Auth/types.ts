// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin";
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  gender: string;
  dateOfBirth: string;
}

export interface GoogleAuthData {
  credential: string;
  clientId: string;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  description?: string;
  mobileColor?: string;
  subItems?: { label: string; href: string }[];
}

export interface LoginPageModel {
  isRtl: boolean;
  setLanguage: (lang: string) => Promise<void>;
  currentLang: string;
  langLoading: boolean;
  email: string;
  password: string;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  emailFocused: boolean;
  passwordFocused: boolean;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailFocus: (id: string | null) => void;
  handlePasswordFocus: (id: string | null) => void;
  handleEmailBlur: () => void;
  handlePasswordBlur: () => void;
  taglineStart: string;
  taglineEnd: string;
  wordLabel: string;
  quote: string;
  attribution: string;
  title: string;
  subtitle: string;
  languageLabels: Record<string, string | undefined>;
  emailLabel: string;
  passwordLabel: string;
  forgotPasswordLabel: string;
  signInLabel: string;
  termsLabel: string;
  termsLinkLabel: string;
  privacyLabel: string;
  privacyLinkLabel: string;
  additionalNote: string;
}
