// ── Gate ──────────────────────────────────────────────────────────────────────
// Wraps children behind a subscription tier check. If the user's tier meets the
// requirement (and is not expired), children render normally. Otherwise, the
// user is automatically redirected to the /sower subscription page. While the
// subscription status is still loading a loading state is shown (never a blank
// screen), and a LockedFeatureBadge is rendered as an immediate fallback while
// the redirect resolves.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription, formatTierLabel } from "@/hooks/useSubscription";
import LockedFeatureBadge from "./LockedFeatureBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { routes } from "@/components/Routes/routes";

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
  const { hasAccess, subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const userHasAccess = hasAccess(tier);

  // Automatically redirect the user to the subscription page when they have no
  // subscription or their subscription has expired. Wait for the subscription
  // status to load first so we don't redirect paying users before it resolves.
  useEffect(() => {
    if (subscriptionLoading) return;
    if (userHasAccess) return;
    if (showChildrenWhenLocked) return;
    navigate(routes.sower.path, { replace: true });
  }, [subscriptionLoading, userHasAccess, showChildrenWhenLocked, navigate]);

  if (userHasAccess) return <>{children}</>;
  if (showChildrenWhenLocked) return <>{children}</>;

  const defaultNames: Record<string, string> = {
    legacy_sower: "Legacy Sower Feature",
    covenant_sower: "Covenant Sower Feature",
  };

  // While the subscription status is loading, keep showing a spinner rather
  // than a blank screen or a premature redirect.
  if (subscriptionLoading) {
    return <LoadingState />;
  }

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
