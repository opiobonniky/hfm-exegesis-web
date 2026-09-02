"use client";

import { useSowerPage } from "../hooks/useSowerPage";
import { SowerHero } from "../components/SowerHero";
import { SowerTiersGrid } from "../components/SowerTiersGrid";
import { SowerFeatureComparison } from "../components/SowerFeatureComparison";
import { SowerBanner } from "../components/SowerBanner";
import { SowerFAQ } from "../components/SowerFAQ";
import { SowerFooter } from "../components/SowerFooter";

export default function SowerPage() {
  const h = useSowerPage();
  const { billingInterval, setBillingInterval, checkoutLoading, portalLoading, isPayingUser, tierLabel, handleSubscribe, handleManageSubscription } = h;
  const isLegacySower = tierLabel === "legacy_sower";
  const isCovenantSower = tierLabel === "covenant_sower";

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }} dir={h.isRtl ? "rtl" : "ltr"}>
      <SowerHero billingInterval={billingInterval} setBillingInterval={setBillingInterval} />
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
