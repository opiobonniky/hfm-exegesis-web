import { Link } from "react-router-dom";
import { Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import type { Language } from "@/components/languages/type";
import { tt } from "@/components/languages/hardcodedTranslate";
import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import { LanguageSelector } from "../LanguageSelector";
import { NavMenuItem } from "../NavMenuItem";
import { MobileNavMenu } from "../MobileNavMenu";
import { landingCopy } from "../../utils";
import type { LandingNavProps } from "../../types";

export function NavBar({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  menuPanelRef,
  expandedMobileSection,
  setExpandedMobileSection,
  onMenuClick,
  menuItems,
  activeNavKey,
}: LandingNavProps) {
  const { t, setLanguage, lang: currentLang, isLoading: langLoading } = useLanguage();

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent nav-hero"}`}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className={`flex items-center justify-between transition-[height] duration-300 ${scrolled ? "h-12 sm:h-14 lg:h-16" : "h-14 sm:h-16 lg:h-20"}`}>
            <Link to="/" className="flex items-center transition-all duration-300">
              <div className={`rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-all duration-300 ${scrolled ? "w-8 h-8 sm:w-10 sm:h-10" : "w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20"}`}>
                <img src={logoImage} alt={tt("Exegesis")} className="w-full h-full object-contain" />
              </div>
              <span className={`ml-3 font-black font-[family-name:var(--font-heading)] tracking-tighter whitespace-nowrap transition-all duration-300 ${scrolled ? "text-sm sm:text-lg lg:text-xl text-brand-primary" : "text-xs text-white opacity-0 pointer-events-none w-0 overflow-hidden"}`}>
                {landingCopy(t, "siteTitle", tt("EXEGESIS PROJECT"))}
              </span>
            </Link>

            <div className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {menuItems.map((item) => (
                <NavMenuItem
                  key={item.href ?? item.label}
                  item={item}
                  scrolled={scrolled}
                  onMenuClick={onMenuClick}
                  active={item.subItems ? item.subItems.some((sub) => sub.href === activeNavKey) : Boolean(item.href) && item.href === activeNavKey}
                />
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border border-border nav-lang-selector">
                <Globe className="w-3 h-3 text-muted-foreground globe-icon" />
                <LanguageSelector
                  value={currentLang}
                  onChange={(value) => setLanguage(value as Language)}
                  disabled={langLoading}
                  className="h-6 text-[10px] border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground focus:ring-0 [&>svg]:hidden"
                />
              </div>
              <Link to="/login">
                <Button variant="ghost" className="bg-brand-primary text-white hover:bg-brand-primary-dark font-black px-6 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs nav-signin">
                  {landingCopy(t, "signIn", tt("Sign In"))}
                </Button>
              </Link>
            </div>

            <div className="flex xl:hidden items-center gap-2 ml-auto">
              <Link to="/register" className="hidden sm:block">
                <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark font-black px-5 py-4 rounded-xl uppercase tracking-widest text-[10px]">
                  {landingCopy(t, "getStartedBtn", tt("Get Started"))}
                </Button>
              </Link>
              <button
                type="button"
                aria-label={landingCopy(t, "menu", tt("Menu"))}
                className={`rounded-xl transition-all duration-300 ${scrolled ? "p-1.5 text-brand-primary hover:bg-muted" : "p-2 text-white hover:bg-white/10"}`}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className={`transition-all duration-300 ${scrolled ? "w-5 h-5" : "w-6 h-6"}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileNavMenu
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        menuPanelRef={menuPanelRef}
        expandedMobileSection={expandedMobileSection}
        setExpandedMobileSection={setExpandedMobileSection}
        menuItems={menuItems}
        onMenuClick={onMenuClick}
        activeNavKey={activeNavKey}
        currentLang={currentLang}
        setLanguage={setLanguage}
        langLoading={langLoading}
      />
    </>
  );
}