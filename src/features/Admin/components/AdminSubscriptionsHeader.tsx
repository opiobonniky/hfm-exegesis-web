// AdminSubscriptionsHeader — header section for admin subscriptions page
import { CreditCard, RefreshCw, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  activeTab: string;
  seeding: boolean;
  onSeed: () => void;
  onCreateTier: () => void;
}

export function AdminSubscriptionsHeader({
  activeTab,
  seeding,
  onSeed,
  onCreateTier,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Subscription Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage subscription tiers and subscribers
          </p>
        </div>
      </div>
      {activeTab === "tiers" && (
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onSeed}
            disabled={seeding}
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            <span className="hidden sm:inline">Seed Defaults</span>
            <span className="sm:hidden">Seed</span>
          </Button>
          <Button size="sm" onClick={onCreateTier}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">New Tier</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      )}
    </div>
  );
}
