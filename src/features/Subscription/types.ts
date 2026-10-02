import type { ReactNode } from "react";

// ─── Subscription Types ────────────────────────────────────────────────────────

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  sortOrder?: number;
  maxSlots?: number | null;
}

export interface SubscribedUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  tierId: string;
  tierName: string;
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "expired";
  stripeSubscriptionId?: string;
}

export interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  churnRate: number;
}

export interface PlansShellProps {
  children: ReactNode;
}

export interface PlansHeroProps {
  eyebrow: string;
  title: string;
  body: string;
}

export interface PlansCtaProps {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface PlanMatrixItem {
  label: string;
  free: boolean;
  legacy: boolean;
  covenant: boolean;
}

export interface PlanMatrixCategory {
  category: string;
  items: PlanMatrixItem[];
}

export interface PlansFeatureMatrixProps {
  eyebrow: string;
  title: string;
  lead: string;
  categories: PlanMatrixCategory[];
  tierNames: string[];
  featuredTierIndex: number;
}

export interface PlansTierStripProps {
  eyebrow: string;
  title: string;
  lead: string;
}

export interface PlansCtaNoteProps {
  text: string;
}
