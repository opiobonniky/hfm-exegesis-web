import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  CalendarDays,
  Sparkles,
  Globe,
  Mail as MailIcon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Facebook,
  ArrowRight,
  Check,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/languages/languageProvider";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import lordsbookImage from "@/assets/logos/lordsbook.png";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function LordsBookIcon({ className }: { className?: string }) {
  return <img src={lordsbookImage} alt="LordsBook" className={className} />;
}

const PublicLayout = () => {
  const { t, setLanguage, lang: currentLang, isLoading: langLoading } = useLanguage();
  const navigate = useNavigate();
  const { userInfo, authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  const menuItems = useMemo<{ label: string; href?: string; icon: React.ElementType; description?: string; mobileColor?: string; subItems?: { label: string; href: string }[] }[]>(
    () => [
      { label: t.landing?.navHome || "Home", href: "/", icon: BookOpen, description: t.landing?.navHomeDesc || "Welcome & daily verse", mobileColor: "#FFD68A" },
      {
        label: t.landing?.navAbout || "About Us", icon: Users, description: t.landing?.navAboutDesc || "Learn about our mission", mobileColor: "#99F6E4",
        subItems: [
          { label: t.landing?.aboutSubWhoWeAre || "Who We Are", href: "/who-we-are" },
          { label: t.landing?.aboutSubVision || "Our Vision", href: "/our-vision" },
          { label: t.landing?.aboutSubMission || "Our Mission", href: "/our-mission" },
          { label: t.landing?.aboutSubGoals || "Our Goals", href: "/our-goals" },
          { label: t.landing?.aboutSubLeadership || "Leadership", href: "/leadership" },
          { label: t.landing?.aboutSubFounders || "Founders", href: "/founders" },
        ],
      },
      { label: t.landing?.navExegesisDaily || "Exegesis", href: "/", icon: CalendarDays, description: t.landing?.navExegesisDailyDesc || "Daily devotionals", mobileColor: "#FFB4B4" },
      { label: t.landing?.navFeatures || "Features", href: "/#features", icon: Sparkles, description: t.landing?.navFeaturesDesc || "App features & tools", mobileColor: "#A7F3D0" },
      { label: t.landing?.navResources || "Resources", href: "/", icon: Globe, description: t.landing?.navResourcesDesc || "Bible studies & guides", mobileColor: "#C7D2FE" },
      { label: t.landing?.navContact || "Contact Us", href: "/#contact", icon: MailIcon, description: t.landing?.navContactDesc || "Get in touch", mobileColor: "#FBCFE8" },
    ],
    [t],
  );

  const socialLinks = useMemo<{ name: string; url: string; icon: React.ElementType }[]>(
    () => [
      { name: t.landing?.socialLordsBook || "LordsBook", url: "https://lordsbook.com", icon: LordsBookIcon },
      { name: t.landing?.socialFacebook || "Facebook", url: "https://facebook.com", icon: Facebook },
      { name: t.landing?.socialTikTok || "TikTok", url: "https://tiktok.com/@exegesis", icon: TikTokIcon },
      { name: t.landing?.socialWhatsApp || "WhatsApp", url: "https://wa.me/1234567890", icon: WhatsAppIcon },
    ],
    [t],
  );

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const bigint = parseInt(full, 16);
    return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleScrollClose = () => { setMobileMenuOpen(false); setExpandedMobileSection(null); };
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollClose);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (menuPanelRef.current && target && !menuPanelRef.current.contains(target)) {
        setMobileMenuOpen(false);
        setExpandedMobileSection(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileMenuOpen]);

  const handleMenuClick = (href?: string) => {
    if (!href) return;
    setMobileMenuOpen(false);
    setExpandedMobileSection(null);
    if (href.startsWith("#")) {
      navigate("/", { state: { scrollTo: href.slice(1) } });
      return;
    }
    navigate(href);
  };

  return (
    <div className="w-full bg-brand-bg text-slate-900 overflow-x-hidden">
      <style>{`
        .mobile-scroll-snap { scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
        .mobile-scroll-snap > * { scroll-snap-align: start; flex-shrink: 0; }
        section { max-width: 100vw; overflow-x: hidden; }
      `}</style>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-slate-200" : "bg-white/95 backdrop-blur-md border-b border-slate-200"}`}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <Link to="/" className="items-center gap-2 sm:gap-3 hidden sm:flex">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-transparent flex items-center justify-center overflow-hidden p-0">
                <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-base sm:text-xl text-brand-primary font-[family-name:var(--font-heading)] tracking-tighter">
                {t.landing?.siteTitle || "EXEGESIS PROJECT"}
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 absolute left-1/2 -translate-x-1/2">
              {menuItems.map((item) =>
                item.subItems ? (
                  <div key={item.label} className="relative group">
                    <button className="px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 text-[10px] text-slate-500 hover:text-brand-primary hover:bg-brand-bg flex items-center gap-1">
                      {item.label}
                      <ChevronDown className="w-2.5 h-2.5 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[180px] overflow-hidden">
                        {item.subItems.map((sub) => (
                          <button key={sub.label} onClick={() => handleMenuClick(sub.href)} className="w-full text-left px-5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-500 hover:text-brand-primary hover:bg-brand-bg transition-colors">
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button key={item.label} onClick={() => handleMenuClick(item.href)} className="px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 text-[10px] text-slate-500 hover:text-brand-primary hover:bg-brand-bg">
                    {item.label}
                  </button>
                )
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-200">
                <Globe className="w-3 h-3 text-slate-400" />
                <Select value={currentLang} onValueChange={(value) => setLanguage(value as Language)} disabled={langLoading}>
                  <SelectTrigger className="h-6 text-[10px] border-0 bg-transparent shadow-none p-0 gap-1 text-slate-500 hover:text-slate-700 focus:ring-0 [&>svg]:hidden">
                    <SelectValue><span className="font-bold">{LANGUAGE_NAMES[currentLang]}</span></SelectValue>
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
                                {code !== 'en' && <span className="text-muted-foreground/60 text-[9px]">({getLanguageName(code, 'en')})</span>}
                              </div>
                              {code === currentLang && <Check className="w-2.5 h-2.5 text-primary shrink-0" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-500 hover:text-brand-primary font-black uppercase tracking-widest text-[10px]">
                  {t.landing?.signIn || "Sign In"}
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark font-black px-6 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs">
                  {t.landing?.getStartedBtn || "Get Started"}
                </Button>
              </Link>
            </div>

            {/* Mobile nav */}
            <div className="flex lg:hidden items-center justify-between w-full">
              <button className="p-2 rounded-xl transition-colors text-brand-primary hover:bg-slate-50" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-transparent flex items-center justify-center overflow-hidden p-0">
                  <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
                </div>
                <span className="font-black text-xs text-brand-primary font-[family-name:var(--font-heading)] tracking-tighter">
                  {t.landing?.siteTitle || "EXEGESIS PROJECT"}
                </span>
              </div>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-black text-xs uppercase tracking-wider px-3 py-2 text-brand-primary">
                  {t.landing?.signIn || "Sign In"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] overflow-hidden">
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} ref={menuPanelRef} className="absolute top-0 left-0 bottom-0 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-brand-bg">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-brand-primary rounded-full" />
                <span className="font-black text-brand-primary uppercase tracking-widest text-sm">{t.landing?.menu || "Menu"}</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            </div>
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
                          <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</div>
                          {item.description && <div className="text-[11px] font-medium text-slate-400 truncate">{item.description}</div>}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${expandedMobileSection === item.label ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${expandedMobileSection === item.label ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                        <div className="pl-14 pr-3 space-y-0.5 pb-1">
                          {item.subItems.map((sub) => (
                            <button key={sub.label} onClick={() => handleMenuClick(sub.href)} className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-brand-primary hover:bg-brand-bg transition-colors uppercase tracking-wider">
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button key={item.label} onClick={() => handleMenuClick(item.href)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(item.mobileColor || "#396284", 0.15), color: item.mobileColor || "#396284" }}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</div>
                        {item.description && <div className="text-[11px] font-medium text-slate-400 truncate">{item.description}</div>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand-primary transition-colors" />
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <Select value={currentLang} onValueChange={(value) => setLanguage(value as Language)} disabled={langLoading}>
                  <SelectTrigger className="h-6 text-xs border-0 bg-transparent shadow-none p-0 gap-1 text-slate-500 hover:text-slate-700 focus:ring-0 [&>svg]:hidden flex-1">
                    <SelectValue><span className="font-bold">{LANGUAGE_NAMES[currentLang]}</span></SelectValue>
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
                                {code !== 'en' && <span className="text-muted-foreground/60 text-[9px]">({getLanguageName(code, 'en')})</span>}
                              </div>
                              {code === currentLang && <Check className="w-2.5 h-2.5 text-primary shrink-0" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 space-y-3 bg-brand-bg/50">
              <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-brand-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-primary/20 text-base uppercase tracking-widest">
                  {t.landing?.getStartedBtn || "Get Started"}
                </Button>
              </Link>
            </div>
          </motion.div>
          <div className="absolute inset-0 -z-10" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Page content */}
      <div className="pt-14 sm:pt-16 lg:pt-20">
        <Outlet />
      </div>

      {/* FOOTER */}
      <footer id="contact" className="bg-brand-dark pt-16 sm:pt-24 pb-0">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-12">
            <div className="w-full lg:w-1/3">
              <p className="text-brand-accent/80 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed max-w-sm">
                &ldquo;{t.landing?.footerVerse || "Write the vision, and make it plain upon tables, that he may run that readeth it."}&rdquo;
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4">
                — {t.landing?.footerVerseRef || "Habakkuk 2:2"}
              </p>
            </div>
            <div className="w-full lg:w-1/3 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                  <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter">{t.landing?.siteTitle || "EXEGESIS PROJECT"}</span>
              </div>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                {t.landing?.footerDesc || "Helping you shine with excellence and integrity through the power of the Word."}
              </p>
            </div>
            <div className="w-full lg:w-1/3 lg:text-right">
              <h4 className="text-brand-accent font-serif text-lg sm:text-xl mb-6">
                {t.landing?.footerConnect || "Connect With Us"}
              </h4>
              <div className="flex items-center lg:justify-end gap-4">
                <TooltipProvider>
                  {socialLinks.map((s) => (
                    <Tooltip key={s.name}>
                      <TooltipTrigger asChild>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-white transition-all duration-300 border border-brand-accent/30" aria-label={s.name}>
                          <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">{s.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-white/10 my-12 sm:my-16" />
        </div>
        <div className="bg-black/40 border-t border-white/5 py-5 sm:py-6 px-4">
          <div className="w-full max-w-5xl mx-auto flex flex-row justify-between items-center gap-3 text-center sm:text-left px-4 sm:px-6">
            <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
              {(t.landing?.footerCopyright || "© {year} Exegesis. Built for Kingdom Impact.").replace("{year}", String(new Date().getFullYear()))}
            </p>
            <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
              {t.landing?.footerPoweredBy || "Powered by Him First Media Group."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
