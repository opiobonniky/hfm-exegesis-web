import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLandingPage } from "../hooks/useLandingPage";
import { NavBar, HeroSection, FeaturesSection, BibleStatsSection, ExegesisSection, AboutSection, CTASection, FooterSection } from "../components/landing";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const Landing = () => {
  const p = useLandingPage();
  const { navigate, mobileMenuOpen, setMobileMenuOpen, menuPanelRef, scrolled, expandedMobileSection, setExpandedMobileSection, authLoading }:any = p;
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
    return (
      <Skeleton/>
    );
  }
  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      <style>{`
        .nav-hero .nav-menu-item { color: rgba(255,255,255,0.85) !important; background: transparent !important; }
        .nav-hero .nav-menu-item:hover { color: white !important; background: rgba(255,255,255,0.1) !important; }
        .nav-hero .nav-lang-selector { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.2) !important; }
        .nav-hero .nav-lang-selector .globe-icon { color: rgba(255,255,255,0.6) !important; }
        .nav-hero .nav-lang-selector [role="combobox"] { color: rgba(255,255,255,0.85) !important; }
        .nav-hero .nav-signin { color: rgba(255,255,255,0.85) !important; }
        .nav-hero .nav-signin:hover { color: white !important; background: rgba(255,255,255,0.1) !important; }
      `}</style>
      <div className="relative z-10">
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
      </div>
    </div>
  );
};

export default Landing;
