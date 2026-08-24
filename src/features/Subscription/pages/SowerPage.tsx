"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSowerPage } from "../hooks/useSowerPage";
import { useLanguage } from "@/components/languages/languageProvider";
import { SowerHero } from "../components/SowerHero";
import { TierCard, TIERS, type TierId } from "../components/SowerTierCards";
import { SowerFeatureComparison } from "../components/SowerFeatureComparison";
import { SowerBanner } from "../components/SowerBanner";
import { SowerFAQ } from "../components/SowerFAQ";
import { SowerFooter } from "../components/SowerFooter";
export default function SowerPage() {
  const h = useSowerPage();
  const { t, isRtl } = useLanguage();
  const { billingInterval, setBillingInterval, checkoutLoading, portalLoading, isPayingUser, tierLabel, handleSubscribe, handleManageSubscription } = h;
  const isLegacySower = tierLabel === "legacy_sower";
  const isCovenantSower = tierLabel === "covenant_sower";
  const isPaying = isPayingUser;
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <SowerHero billingInterval={billingInterval} setBillingInterval={setBillingInterval} />
      <section className="max-w-6xl mx-auto px-5 sm:px-6 -mt-8 sm:-mt-10 pb-10 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const isCurrentTier = (tier.id === "free" && !isPaying) || (tier.id === "legacy_sower" && isLegacySower) || (tier.id === "covenant_sower" && isCovenantSower);
            return (
              <TierCard
                key={tier.id} tier={tier} billingInterval={billingInterval}
                isCurrentTier={isCurrentTier} isPaying={isPaying}
                onSubscribe={(id) => handleSubscribe(id)} onManage={handleManageSubscription}
                checkoutLoading={checkoutLoading} portalLoading={portalLoading}
                isLegacySower={isLegacySower} isCovenantSower={isCovenantSower}
              />
            );
          })}
        </div>
      </section>
      <SowerFeatureComparison />
      <SowerBanner />
      <SowerFAQ />
      <SowerFooter />
    </div>
  );
}
