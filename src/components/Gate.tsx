// ── Gate ──────────────────────────────────────────────────────────────────────
// Wraps children behind a subscription tier check. If the user's tier meets the
// requirement, children render normally. Otherwise, a LockedFeatureBadge is
// shown (upsell prompt to upgrade).

import { useSubscription, formatTierLabel } from "@/hooks/useSubscription";
import LockedFeatureBadge from "./LockedFeatureBadge";

export interface GateProps {
  children: React.ReactNode;
  /** Minimum tier required. Default: "legacy_sower" */
  tier?: "free" | "legacy_sower" | "covenant_sower";
  /** Feature name shown in the locked badge. Auto-derived if omitted. */
  featureName?: string;
  /** Feature description shown in the locked badge. */
  featureDescription?: string;
  /** Extra classes passed to the LockedFeatureBadge wrapper */
  className?: string;
  /** If true, render children normally even when locked (for progressive disclosure) */
  showChildrenWhenLocked?: boolean;
}

export function Gate({
  children,
  tier = "legacy_sower",
  featureName,
  featureDescription,
  className,
  showChildrenWhenLocked = false,
}: GateProps) {
  const { hasAccess } = useSubscription();
  const userHasAccess = hasAccess(tier);

  if (userHasAccess) return <>{children}</>;
  if (showChildrenWhenLocked) return <>{children}</>;

  const defaultNames: Record<string, string> = {
    legacy_sower: "Legacy Sower Feature",
    covenant_sower: "Covenant Sower Feature",
  };

  return (
    <LockedFeatureBadge
      featureName={featureName || defaultNames[tier] || "Premium Feature"}
      featureDescription={
        featureDescription ||
        `Upgrade to ${tier === "covenant_sower" ? "Covenant Sower" : "Legacy Sower or Covenant Sower"} to unlock this feature.`
      }

      className={className}
    />
  );
}

export default Gate;
