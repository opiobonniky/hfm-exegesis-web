// TiersTab — tiers list tab content for admin subscriptions
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionTierCard } from "./SubscriptionTierCard";
import type { SubscriptionTier } from "../types";

interface Props {
  tiers: SubscriptionTier[];
  loading: boolean;
  counts?: Record<string, number>;
  onEdit: (tier: SubscriptionTier) => void;
  onDelete: (id: string) => void;
}

export function TiersTab({ tiers, loading, counts, onEdit, onDelete }: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">All Tiers ({tiers.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : tiers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <CreditCard className="w-10 h-10 mb-3 text-muted-foreground/40" />
            <p className="font-medium">No tiers created yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;Seed Defaults&quot; or create one manually
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {tiers.map((tier) => (
              <SubscriptionTierCard
                key={tier.id}
                id={tier.id}
                name={tier.name}
                price={tier.price}
                interval={tier.interval}
                description={tier.description}
                features={tier.features}
                isActive={tier.isActive}
                memberCount={counts?.[tier.id.replace(/_monthly$/, "")] ?? counts?.[tier.id]}
                onEdit={() => onEdit(tier)}
                onDelete={() => onDelete(tier.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
