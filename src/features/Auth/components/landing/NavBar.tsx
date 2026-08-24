import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, CalendarDays, Globe, ChevronDown, ChevronRight, Menu, X, ArrowRight, Mail as MailIcon, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/languages/languageProvider";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import type { RefObject } from "react";

interface MenuItem {
  label: string; href?: string; icon: React.ElementType; description?: string;
  mobileColor?: string; subItems?: { label: string; href: string }[];
}
interface NavBarProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  menuPanelRef: RefObject<HTMLDivElement | null>;
  expandedMobileSection: string | null;
  setExpandedMobileSection: (v: string | null) => void;
  onMenuClick: (href?: string) => void;
const hexToRgba = (hex: string, alpha = 1) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
};
const LanguageSelector = ({ value, onChange, disabled, className }: { value: string; onChange: (v: string) => void; disabled: boolean; className?: string }) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className={className}>
      <SelectValue><span className="font-bold">{LANGUAGE_NAMES[value as Language]}</span></SelectValue>
    </SelectTrigger>
    <SelectContent className="min-w-[140px]">
      {[
        { label: "Primary", languages: ["en"] as Language[] },
        { label: "European", languages: ["de", "fr", "es", "pt", "it", "el", "ru"] as Language[] },
        { label: "Indian", languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"] as Language[] },
        { label: "Other", languages: ["ar", "sw", "ne", "fil"] as Language[] },
      ].map((group) => (
        <SelectGroup key={group.label}>
          <SelectLabel className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/50">{group.label}</SelectLabel>
          {group.languages.map((code) => (
            <SelectItem key={code} value={code} className="py-1 text-[11px]">
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1 min-w-0">
                  <span>{LANGUAGE_NAMES[code]}</span>
                  {code !== "en" && <span className="text-muted-foreground/60 text-[9px]">({getLanguageName(code, "en")})</span>}
                </div>
                {code === value && <Check className="w-2.5 h-2.5 text-primary shrink-0" />}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </SelectContent>
  </Select>
);
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent nav-hero"}`}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <div className={`items-center gap-2 sm:gap-3 hidden sm:flex transition-all duration-300 ${scrolled ? "translate-y-0" : "gap-3 sm:gap-4 translate-y-10 sm:translate-y-14"}`}>
              <div className={`rounded-xl bg-transparent flex items-center justify-center shrink-0 overflow-hidden p-0 transition-all duration-300 ${scrolled ? "w-9 h-9 sm:w-11 sm:h-11" : "w-28 h-28 sm:w-32 sm:h-32"}`}>
                <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
              <span className={`font-black font-[family-name:var(--font-heading)] tracking-tighter transition-all duration-300 ${scrolled ? "text-base sm:text-xl text-brand-primary" : "hidden"}`}>
                {t.landing?.siteTitle || "EXEGESIS PROJECT"}
              </span>
            </div>
            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 absolute left-1/2 -translate-x-1/2">
              {menuItems.map((item) =>
                item.subItems ? (
                  <div key={item.label} className="relative group">
                    <button className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item flex items-center gap-1 ${scrolled ? "text-[10px] text-muted-foreground hover:text-primary hover:bg-muted" : "text-xs sm:text-sm text-white/90"}`}>
                      {item.label}<ChevronDown className="w-2.5 h-2.5 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-card rounded-2xl shadow-2xl border border-border py-2 min-w-[180px] overflow-hidden">
                        {item.subItems.map((sub) => (
                          <button key={sub.label} onClick={() => onMenuClick(sub.href)} className="w-full text-left px-5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button key={item.label} onClick={() => onMenuClick(item.href)} className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item ${scrolled ? "text-[10px] text-muted-foreground hover:text-primary hover:bg-muted" : "text-xs sm:text-sm text-white/90"}`}>
                    {item.label}
                  </button>
                )
              )}
            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border border-border nav-lang-selector">
                <Globe className="w-3 h-3 text-muted-foreground globe-icon" />
                <LanguageSelector value={currentLang} onChange={(v) => setLanguage(v as Language)} disabled={langLoading}
                  className="h-6 text-[10px] border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground focus:ring-0 [&>svg]:hidden" />
              <Link to="/login">
                <Button variant="ghost" className="bg-brand-primary text-white hover:bg-brand-primary-dark font-black px-6 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs">
                  {t.landing?.signIn || "Sign In"}
                </Button>
              </Link>
            {/* Mobile nav */}
            <div className="flex lg:hidden items-center justify-between w-full">
              <button className={`p-2 rounded-xl transition-colors ${scrolled ? "text-brand-primary hover:bg-muted" : "text-white hover:bg-white/10"}`} onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] overflow-hidden">
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} ref={menuPanelRef} className="absolute top-0 left-0 bottom-0 w-[82%] max-w-xs bg-card shadow-2xl flex flex-col h-full">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-brand-primary rounded-full" />
                <span className="font-black text-brand-primary uppercase tracking-widest text-sm">{t.landing?.menu || "Menu"}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <div className="grid gap-1.5">
                {menuItems.map((item) =>
                  item.subItems ? (
                    <div key={item.label}>
                      <button onClick={() => setExpandedMobileSection(expandedMobileSection === item.label ? null : item.label)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(item.mobileColor || "#396284", 0.15), color: item.mobileColor || "#396284" }}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-foreground uppercase tracking-widest">{item.label}</div>
                          {item.description && <div className="text-[11px] font-medium text-muted-foreground truncate">{item.description}</div>}
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedMobileSection === item.label ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${expandedMobileSection === item.label ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                        <div className="pl-14 pr-3 space-y-0.5 pb-1">
                          {item.subItems.map((sub) => (
                            <button key={sub.label} onClick={() => onMenuClick(sub.href)} className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-muted transition-colors uppercase tracking-wider">
                              {sub.label}
                            </button>
                          ))}
                  ) : (
                    <button key={item.label} onClick={() => onMenuClick(item.href)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(item.mobileColor || "#396284", 0.15), color: item.mobileColor || "#396284" }}>
                        <item.icon className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-foreground uppercase tracking-widest">{item.label}</div>
                        {item.description && <div className="text-[11px] font-medium text-muted-foreground truncate">{item.description}</div>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )
                )}
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/15 text-brand-primary"><ArrowRight className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-foreground uppercase tracking-widest">{t.landing?.signIn || "Sign In"}</div>
                    <div className="text-[11px] font-medium text-muted-foreground truncate">{t.landing?.signInDesc || "Access your account"}</div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted border border-border">
                <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  className="h-6 text-xs border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground focus:ring-0 [&>svg]:hidden flex-1" />
            <div className="p-5 border-t border-border space-y-3 bg-muted/50">
              <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-brand-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-primary/20 text-base uppercase tracking-widest">
                  {t.landing?.getStartedBtn || "Get Started"}
          </motion.div>
          <div className="absolute inset-0 -z-10" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
