import { useLandingPage } from "../hooks/useLandingPage";
import {
  AboutSection,
  CTASection,
  FeaturesSection,
  FooterSection,
  HeroSection,
  LandingShell,
  NavBar,
  PlanComparisonSection,
  ReadingPlansSection,
  StudyApproachSection,
} from "../components/landing";
import { LANDING_FEATURES, LANDING_FEATURED_PLANS, LANDING_HERO, LANDING_PLAN_COLUMNS, LANDING_SECTIONS, LANDING_STUDY_STEPS } from "../constants/landing";

export default function Landing() {
  const { data, actions } = useLandingPage();

  return (
    <LandingShell>
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
      <HeroSection
        eyebrow={LANDING_HERO.eyebrow}
        title={LANDING_HERO.title}
        body={LANDING_HERO.body}
        support={LANDING_HERO.support}
        primaryLabel={LANDING_HERO.primaryLabel}
        primaryHref={LANDING_HERO.primaryHref}
        secondaryLabel={LANDING_HERO.secondaryLabel}
        onSecondaryClick={actions.handleExploreFeatures}
        previewVerse={LANDING_HERO.previewVerse}
        previewReference={LANDING_HERO.previewReference}
        previewTranslation={LANDING_HERO.previewTranslation}
      />
      <FeaturesSection
        eyebrow={LANDING_SECTIONS.features.eyebrow}
        title={LANDING_SECTIONS.features.title}
        lead={LANDING_SECTIONS.features.lead}
        features={LANDING_FEATURES}
        ctaLabel={LANDING_SECTIONS.features.ctaLabel}
        ctaTarget={LANDING_SECTIONS.features.ctaTarget}
        onCtaClick={actions.handleExploreStudyTools}
        note={LANDING_SECTIONS.features.note}
      />
      <StudyApproachSection
        eyebrow={LANDING_SECTIONS.approach.eyebrow}
        title={LANDING_SECTIONS.approach.title}
        lead={LANDING_SECTIONS.approach.lead}
        steps={LANDING_STUDY_STEPS}
        ctaLabel={LANDING_SECTIONS.approach.ctaLabel}
        ctaHref={LANDING_SECTIONS.approach.ctaHref}
      />
      <ReadingPlansSection
        eyebrow={LANDING_SECTIONS.plans.eyebrow}
        title={LANDING_SECTIONS.plans.title}
        body={LANDING_SECTIONS.plans.body}
        plans={LANDING_FEATURED_PLANS}
        ctaLabel={LANDING_SECTIONS.plans.ctaLabel}
        ctaHref={LANDING_SECTIONS.plans.ctaHref}
      />
      <AboutSection
        eyebrow={LANDING_SECTIONS.purpose.eyebrow}
        title={LANDING_SECTIONS.purpose.title}
        paragraphs={LANDING_SECTIONS.purpose.paragraphs}
        ctaLabel={LANDING_SECTIONS.purpose.ctaLabel}
        ctaHref={LANDING_SECTIONS.purpose.ctaHref}
      />
      <PlanComparisonSection
        eyebrow={LANDING_SECTIONS.choosePlan.eyebrow}
        title={LANDING_SECTIONS.choosePlan.title}
        body={LANDING_SECTIONS.choosePlan.body}
        bodySecondary={LANDING_SECTIONS.choosePlan.bodySecondary}
        columns={LANDING_PLAN_COLUMNS}
        primaryLabel={LANDING_SECTIONS.choosePlan.primaryLabel}
        primaryHref={LANDING_SECTIONS.choosePlan.primaryHref}
        secondaryLabel={LANDING_SECTIONS.choosePlan.secondaryLabel}
        secondaryHref={LANDING_SECTIONS.choosePlan.secondaryHref}
      />
      <CTASection
        title={LANDING_SECTIONS.cta.title}
        body={LANDING_SECTIONS.cta.body}
        primaryLabel={LANDING_SECTIONS.cta.primaryLabel}
        primaryHref={LANDING_SECTIONS.cta.primaryHref}
        secondaryLabel={LANDING_SECTIONS.cta.secondaryLabel}
        secondaryHref={LANDING_SECTIONS.cta.secondaryHref}
      />
      <FooterSection id="contact" />
    </LandingShell>
  );
}
