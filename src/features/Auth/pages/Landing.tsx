import { useLandingPage } from "../hooks/useLandingPage";
import { NavBar, HeroSection, FeaturesSection, BibleStatsSection, ExegesisSection, AboutSection, CTASection, FooterSection } from "../components/landing";
import { Skeleton } from "@/components/ui/skeleton";
import { LandingContentWrapper } from "../components";

const Landing = () => {
  const p = useLandingPage();
  const { navigate, mobileMenuOpen, setMobileMenuOpen, menuPanelRef, scrolled, expandedMobileSection, setExpandedMobileSection, authLoading } = p;

  const handleMenuClick = (href?: string) => {
    if (!href) return;
    setMobileMenuOpen(false);
    setExpandedMobileSection(null);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    navigate(href);
  };

  if (authLoading) {
    return <Skeleton />;
  }

  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      <LandingContentWrapper>
        <NavBar
          scrolled={scrolled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          menuPanelRef={menuPanelRef}
          expandedMobileSection={expandedMobileSection}
          setExpandedMobileSection={setExpandedMobileSection}
          onMenuClick={handleMenuClick}
        />
        <HeroSection />
        <FeaturesSection />
        <BibleStatsSection />
        <ExegesisSection />
        <AboutSection />
        <CTASection />
        <FooterSection />
      </LandingContentWrapper>
    </div>
  );
};

export default Landing;
