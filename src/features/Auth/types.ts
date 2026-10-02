// ─── Auth Types ────────────────────────────────────────────────────────────────

import type { RefObject } from "react";
import type { Language } from "@/components/languages/type";

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
  registerPromptLabel: string;
  registerLabel: string;
  signInWithGoogleLabel: string;
  termsLabel: string;
  termsLinkLabel: string;
  privacyLabel: string;
  privacyLinkLabel: string;
  additionalNote: string;
}

// ─── Landing Page ────────────────────────────────────────────────────────────────

export interface LandingNavProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  menuPanelRef: RefObject<HTMLDivElement | null>;
  expandedMobileSection: string | null;
  setExpandedMobileSection: (v: string | null) => void;
  onMenuClick: (href?: string) => void;
  menuItems: MenuItem[];
  activeNavKey: string | null;
}

export interface NavMenuItemProps {
  item: MenuItem;
  scrolled: boolean;
  onMenuClick: (href?: string) => void;
  active: boolean;
}

export type MobileNavMenuProps = Omit<LandingNavProps, "scrolled"> & {
  currentLang: string;
  setLanguage: (lang: Language) => void;
  langLoading: boolean;
};

export interface HeroSectionProps {
  eyebrow: string;
  title: string;
  body: string;
  support: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  onSecondaryClick: () => void;
  previewVerse: string;
  previewReference: string;
  previewTranslation: string;
}

export interface LandingFeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  eyebrow: string;
  title: string;
  lead: string;
  features: LandingFeatureItem[];
  ctaLabel: string;
  ctaTarget: string;
  onCtaClick: () => void;
  note: string;
}

export interface LandingStepItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

export interface StudyApproachSectionProps {
  eyebrow: string;
  title: string;
  lead: string;
  steps: LandingStepItem[];
  ctaLabel: string;
  ctaHref: string;
}

export interface LandingPlanItem {
  title: string;
  meta: string;
  description: string;
}

export interface ReadingPlansSectionProps {
  eyebrow: string;
  title: string;
  body: string;
  plans: LandingPlanItem[];
  ctaLabel: string;
  ctaHref: string;
}

export interface AboutSectionProps {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface LandingPlanColumn {
  title: string;
  description: string;
  items: string[];
  featured: boolean;
}

export interface PlanComparisonSectionProps {
  eyebrow: string;
  title: string;
  body: string;
  bodySecondary: string;
  columns: LandingPlanColumn[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface CtaSectionProps {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface FooterSectionProps {
  id: string;
}

export interface LandingShellProps {
  children: React.ReactNode;
}

export interface LandingSectionHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  tone?: "default" | "onDark";
}

export interface LandingContentWrapperProps {
  children: React.ReactNode;
}
