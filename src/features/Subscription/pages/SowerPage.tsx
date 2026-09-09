"use client";

import { useSowerPage } from "../hooks/useSowerPage";
import { SowerHero } from "../components/SowerHero";
import { SowerTiersGrid } from "../components/SowerTiersGrid";
import { SowerFeatureComparison } from "../components/SowerFeatureComparison";
import { SowerBanner } from "../components/SowerBanner";
import { SowerFAQ } from "../components/SowerFAQ";
import { SowerFooter } from "../components/SowerFooter";

export default function SowerPage() {
  const { data, actions } = useSowerPage();
  const h = { ...data, ...actions };
  const {
    billingInterval,
    setBillingInterval,
    checkoutLoading,
    portalLoading,
    isPayingUser,
    isLegacySower,
    isCovenantSower,
    handleSubscribe,
    handleManageSubscription,
  } = h;

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
      dir={h.isRtl ? "rtl" : "ltr"}
    >
      <SowerHero
        billingInterval={billingInterval}
        setBillingInterval={setBillingInterval}
      />
      <SowerTiersGrid
        billingInterval={billingInterval}
        isPaying={isPayingUser}
        isLegacySower={isLegacySower}
        isCovenantSower={isCovenantSower}
        checkoutLoading={checkoutLoading}
        portalLoading={portalLoading}
        onSubscribe={handleSubscribe}
        onManage={handleManageSubscription}
      />
      <SowerFeatureComparison />
      <SowerBanner />
      <SowerFAQ />
      <SowerFooter />
    </div>
  );
}
