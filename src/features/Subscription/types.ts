export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  isActive: boolean;
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
export interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  churnRate: number;
