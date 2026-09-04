// SubscriptionsSummaryCards — summary stat strip for admin subscriptions
import { Users, UserCheck, Ban, Clock, RefreshCw, AlertTriangle, CalendarX } from "lucide-react";
import { TriviaStatCard } from "./TriviaStatCard";
import type { SubscriptionsSummary } from "../types";

interface Props {
  summary: SubscriptionsSummary | null;
  loading: boolean;
}

export function SubscriptionsSummaryCards({ summary, loading }: Props) {
  if (loading || !summary) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      <TriviaStatCard
        label="Paid Subscribers"
        value={summary.paid ?? 0}
        icon={Users}
        color="bg-primary/10 text-primary"
      />
      <TriviaStatCard
        label="Active"
        value={summary.active ?? 0}
        icon={UserCheck}
        color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
      />
      <TriviaStatCard
        label="Suspended"
        value={summary.suspended ?? 0}
        icon={Ban}
        color="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
      />
      <TriviaStatCard
        label="Expired"
        value={summary.expired ?? 0}
        icon={CalendarX}
        color="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
      />
      <TriviaStatCard
        label="Expiring Soon"
        value={summary.expiringSoon ?? 0}
        icon={Clock}
        color="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
      />
      <TriviaStatCard
        label="Out of Sync"
        value={summary.outOfSync ?? 0}
        icon={RefreshCw}
        color="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
      />
      <TriviaStatCard
        label="Stripe Only"
        value={summary.stripeOnly ?? 0}
        icon={AlertTriangle}
        color="bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400"
      />
    </div>
  );
}
