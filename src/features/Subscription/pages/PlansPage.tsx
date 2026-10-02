"use client";

import { usePublicNav } from "@/features/Auth/hooks/usePublicNav";
import { NavBar, FooterSection } from "@/features/Auth/components/landing";
import { tt } from "@/components/languages/hardcodedTranslate";
import { PlansShell } from "../components/PlansShell";
import { PlansHero } from "../components/PlansHero";
import { PlansTierStrip } from "../components/PlansTierStrip";
import { PlansFeatureMatrix } from "../components/PlansFeatureMatrix";
import { PlansCta } from "../components/PlansCta";
import { FEATURED_TIER_INDEX, PLAN_TIER_NAMES, PUBLIC_PLAN_MATRIX } from "../constants";

export default function PlansPage() {
  const { data, actions } = usePublicNav();

  return (
    <PlansShell>
      <NavBar
        scrolled={data.scrolled}
        mobileMenuOpen={data.mobileMenuOpen}
        setMobileMenuOpen={actions.setMobileMenuOpen}
        menuPanelRef={data.menuPanelRef}
        expandedMobileSection={data.expandedMobileSection}
        setExpandedMobileSection={actions.setExpandedMobileSection}
        onMenuClick={actions.handleMenuClick}
        menuItems={data.menuItems}
      />
      <PlansHero
        eyebrow={tt("CHOOSE YOUR PLAN")}
        title={tt("Compare Plans")}
        body={tt(
          "Bible reading is always free. Compare the available plans to see which study tools fit the way you learn."
        )}
      />
      <PlansTierStrip
        eyebrow={tt("WHAT EACH PLAN INCLUDES")}
        title={tt("Start Free, Go Deeper When You Are Ready")}
        lead={tt(
          "Every plan includes the free Bible reader. Paid plans add study tools, journaling, and insights that grow your understanding."
        )}
      />
      <PlansFeatureMatrix
        eyebrow={tt("FEATURE BY FEATURE")}
        title={tt("Everything You Need to Grow in Scripture")}
        lead={tt("Free and paid tools, side by side, so you can choose with confidence.")}
        categories={PUBLIC_PLAN_MATRIX}
        tierNames={PLAN_TIER_NAMES}
        featuredTierIndex={FEATURED_TIER_INDEX}
      />
      <PlansCta
        title={tt("Start Reading Free")}
        body={tt(
          "Create a free account to begin reading Scripture today, then explore paid plans when you are ready for deeper study tools."
        )}
        primaryLabel={tt("Create Your Free Account")}
        primaryHref="/register"
        secondaryLabel={tt("Back to Home")}
        secondaryHref="/"
      />
      <FooterSection id="contact" />
    </PlansShell>
  );
}