import { Link } from "react-router-dom";
import { BookOpen, Sparkles, CalendarDays, Globe, Menu, X, ArrowRight, Mail as MailIcon, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import type { RefObject } from "react";
import { MenuItem } from "../../types";
import { LanguageSelector } from "../LanguageSelector";
import { NavMenuItem } from "../NavMenuItem";
import { MobileNavMenu } from "../MobileNavMenu";

interface NavBarProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  menuPanelRef: RefObject<HTMLDivElement | null>;
  expandedMobileSection: string | null;
  setExpandedMobileSection: (v: string | null) => void;
  onMenuClick: (href?: string) => void;
}

export function NavBar({ scrolled, mobileMenuOpen, setMobileMenuOpen, menuPanelRef, expandedMobileSection, setExpandedMobileSection, onMenuClick }: NavBarProps) {
  const { t, setLanguage, lang: currentLang, isLoading: langLoading } = useLanguage();

  const menuItems: MenuItem[] = [
    { label: t.landing?.navHome || "Home", href: "#home", icon: BookOpen, description: t.landing?.navHomeDesc || "Welcome & daily verse", mobileColor: "#FFD68A" },
    { label: t.landing?.navAbout || "About Us", icon: Users, description: t.landing?.navAboutDesc || "Learn about our mission", mobileColor: "#99F6E4", subItems: [
      { label: t.landing?.aboutSubWhoWeAre || "Who We Are", href: "/who-we-are" },
      { label: t.landing?.aboutSubVision || "Our Vision", href: "/our-vision" },
      { label: t.landing?.aboutSubMission || "Our Mission", href: "/our-mission" },
      { label: t.landing?.aboutSubGoals || "Our Goals", href: "/our-goals" },
      { label: t.landing?.aboutSubLeadership || "Leadership", href: "/leadership1" },
      { label: t.landing?.aboutSubFounders || "Founders", href: "/founders1" },
    ]},
    { label: t.landing?.navExegesisDaily || "Exegesis", href: "#exegesis-daily", icon: CalendarDays, description: t.landing?.navExegesisDailyDesc || "Daily devotionals", mobileColor: "#FFB4B4" },
    { label: t.landing?.navFeatures || "Features", href: "#features", icon: Sparkles, description: t.landing?.navFeaturesDesc || "App features & tools", mobileColor: "#A7F3D0" },
    { label: t.landing?.navResources || "Resources", href: "#", icon: Globe, description: t.landing?.navResourcesDesc || "Bible studies & guides", mobileColor: "#C7D2FE" },
    { label: t.landing?.navContact || "Contact Us", href: "#contact", icon: MailIcon, description: t.landing?.navContactDesc || "Get in touch", mobileColor: "#FBCFE8" },
  ];

  return (
    <>
      {/* Desktop Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent nav-hero"}`}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className={`flex items-center justify-between transition-[height] duration-300 ${scrolled ? "h-12 sm:h-14 lg:h-16" : "h-14 sm:h-16 lg:h-20"}`}>
            <div className={`flex items-center transition-all duration-300 ${scrolled ? "gap-2 sm:gap-3 translate-y-0" : "gap-3 sm:gap-4 translate-y-14"}`}>
              <div className={`rounded-xl bg-transparent flex items-center justify-center shrink-0 overflow-hidden p-0 transition-all duration-300 ${scrolled ? "w-8 h-8 sm:w-10 sm:h-10" : "w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32"}`}>
                <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
              </div>
              <span className={`font-black font-[family-name:var(--font-heading)] tracking-tighter whitespace-nowrap transition-all duration-300 ${scrolled ? "text-sm sm:text-lg lg:text-xl text-brand-primary opacity-100" : "text-xs opacity-0 pointer-events-none w-0 overflow-hidden"}`}>
                {t.landing?.siteTitle || "EXEGESIS PROJECT"}
              </span>
            </div>

            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 absolute left-1/2 -translate-x-1/2">
              {menuItems.map((item) => (
                <NavMenuItem key={item.label} item={item} scrolled={scrolled} onMenuClick={onMenuClick} />
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border border-border nav-lang-selector">
                <Globe className="w-3 h-3 text-muted-foreground globe-icon" />
                <LanguageSelector value={currentLang} onChange={(v) => setLanguage(v as Language)} disabled={langLoading}
                  className="h-6 text-[10px] border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground focus:ring-0 [&>svg]:hidden" />
              </div>
              <Link to="/login">
                <Button variant="ghost" className="bg-brand-primary text-white hover:bg-brand-primary-dark font-black px-6 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs nav-signin">
                  {t.landing?.signIn || "Sign In"}
                </Button>
              </Link>
            </div>

            {/* Mobile nav */}
            <div className="flex lg:hidden items-center ml-auto">
              <button className={`rounded-xl transition-all duration-300 ${scrolled ? "p-1.5 text-brand-primary hover:bg-muted" : "p-2 text-white hover:bg-white/10"}`} onClick={() => setMobileMenuOpen(true)}>
                <Menu className={`transition-all duration-300 ${scrolled ? "w-5 h-5" : "w-6 h-6"}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileNavMenu 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        menuPanelRef={menuPanelRef} 
        expandedMobileSection={expandedMobileSection} 
        setExpandedMobileSection={setExpandedMobileSection} 
        menuItems={menuItems} 
        onMenuClick={onMenuClick} 
        t={t} 
        currentLang={currentLang} 
        setLanguage={setLanguage} 
        langLoading={langLoading} 
      />
    </>
  );
}
