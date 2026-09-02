// SowerTiersGrid — renders tier cards in a grid, moves .map() out of page
import { TierCard, TIERS, type TierId } from "./SowerTierCards";

interface TierInfo {
  id: string;
  [key: string]: unknown;
}

interface SowerTiersGridProps {
  billingInterval: string;
  isPaying: boolean;
  isLegacySower: boolean;
  isCovenantSower: boolean;
  checkoutLoading: boolean;
  portalLoading: boolean;
  onSubscribe: (id: TierId) => void;
  onManage: () => void;
}

export function SowerTiersGrid({
  billingInterval,
  isPaying,
  isLegacySower,
  isCovenantSower,
  checkoutLoading,
  portalLoading,
  onSubscribe,
  onManage,
}: SowerTiersGridProps) {
  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-6 -mt-8 sm:-mt-10 pb-10 sm:pb-12 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isCurrentTier =
            (tier.id === "free" && !isPaying) ||
            (tier.id === "legacy_sower" && isLegacySower) ||
            (tier.id === "covenant_sower" && isCovenantSower);
          return (
            <TierCard
              key={tier.id}
              tier={tier}
              billingInterval={billingInterval}
              isCurrentTier={isCurrentTier}
              isPaying={isPaying}
              onSubscribe={(id) => onSubscribe(id)}
              onManage={onManage}
              checkoutLoading={checkoutLoading}
              portalLoading={portalLoading}
              isLegacySower={isLegacySower}
              isCovenantSower={isCovenantSower}
            />
          );
        })}
      </div>
    </section>
  );
}
