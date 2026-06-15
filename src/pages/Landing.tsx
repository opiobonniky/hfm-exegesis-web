import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Heart,
  ArrowRight,
  Loader2,
  Menu,
  X,
  Mail as MailIcon,
  CalendarDays,
  Facebook,
  ChevronRight,
  ChevronDown,
  Quote,
  Mic2,
  Trophy,
  Users,
  ShieldCheck,
  Zap,
  Globe,
  Check,
} from "lucide-react";

// ── Social SVG Icons (not in lucide) ─────────────────────────────────────

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
  return (
    <img src={lordsbookImage} alt="LordsBook" className={className} />
  );
}

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useRef, useMemo } from "react";
import { sendPostRequest } from "@/services/api";
import { getVerseText } from "@/utilities/bibleUtils";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import lordsbookImage from "@/assets/logos/lordsbook.png";
import heroBgImage from "@/assets/logos/hero-bg.jpeg";

interface DailyVerse {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  reflection: string;
  published: boolean;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  description?: string;
  mobileColor?: string;
  subItems?: { label: string; href: string }[];
}

const Landing = () => {
  const { t, setLanguage, lang: currentLang, isLoading: langLoading } = useLanguage();
  const navigate = useNavigate();
  const { userInfo, loading: authLoading } = useAuth();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        label: t.landing?.navHome || "Home",
        href: "#home",
        icon: BookOpen,
        description: t.landing?.navHomeDesc || "Welcome & daily verse",
        mobileColor: "#FFD68A",
      },
      {
        label: t.landing?.navAbout || "About Us",
        icon: Users,
        description: t.landing?.navAboutDesc || "Learn about our mission",
        mobileColor: "#99F6E4",
        subItems: [
          { label: t.landing?.aboutSubWhoWeAre || "Who We Are", href: "/who-we-are" },
          { label: t.landing?.aboutSubVision || "Our Vision", href: "/our-vision" },
          { label: t.landing?.aboutSubMission || "Our Mission", href: "/our-mission" },
          { label: t.landing?.aboutSubGoals || "Our Goals", href: "/our-goals" },
          { label: t.landing?.aboutSubLeadership || "Leadership", href: "/leadership" },
          { label: t.landing?.aboutSubFounders || "Founders", href: "/founders" },
        ],
      },
      {
        label: t.landing?.navExegesisDaily || "Exegesis",
        href: "#exegesis-daily",
        icon: CalendarDays,
        description: t.landing?.navExegesisDailyDesc || "Daily devotionals",
        mobileColor: "#FFB4B4",
      },
      {
        label: t.landing?.navFeatures || "Features",
        href: "#features",
        icon: Sparkles,
        description: t.landing?.navFeaturesDesc || "App features & tools",
        mobileColor: "#A7F3D0",
      },
      {
        label: t.landing?.navResources || "Resources",
        href: "#",
        icon: Globe,
        description: t.landing?.navResourcesDesc || "Bible studies & guides",
        mobileColor: "#C7D2FE",
      },
      {
        label: t.landing?.navContact || "Contact Us",
        href: "#contact",
        icon: MailIcon,
        description: t.landing?.navContactDesc || "Get in touch",
        mobileColor: "#FBCFE8",
      },
    ],
    [t],
  );

  const socialLinks: { name: string; url: string; icon: React.ElementType }[] =
    useMemo(
      () => [
        {
          name: t.landing?.socialLordsBook || "LordsBook",
          url: "https://lordsbook.com",
          icon: LordsBookIcon,
        },
        {
          name: t.landing?.socialFacebook || "Facebook",
          url: "https://facebook.com",
          icon: Facebook,
        },
        {
          name: t.landing?.socialTikTok || "TikTok",
          url: "https://tiktok.com/@exegesis",
          icon: TikTokIcon,
        },
        {
          name: t.landing?.socialWhatsApp || "WhatsApp",
          url: "https://wa.me/1234567890",
          icon: WhatsAppIcon,
        },
      ],
      [t],
    );

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const bigint = parseInt(full, 16);
    return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
  };

  // ── Animation variants ──
  const easeOut: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

  const animFadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }
  };
  const animSlideLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } }
  };
  const animSlideRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } }
  };
  const animScaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } }
  };
  const animCardUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
  };
  const animStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  useEffect(() => {
    if (!authLoading && userInfo) navigate("/dashboard", { replace: true });
  }, [userInfo, authLoading, navigate]);

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setVerseLoading(true);
        const response = await sendPostRequest("bible", "get-todays-verse", {});
        if (response.returnCode === 200 && response.returnData)
          setDailyVerse(response.returnData);
      } catch (error) {
        console.error("Failed to fetch daily verse:", error);
      } finally {
        setVerseLoading(false);
      }
    };
    fetchDailyVerse();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleScrollClose = () => {
      setMobileMenuOpen(false);
      setExpandedMobileSection(null);
    };
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollClose);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        menuPanelRef.current &&
        target &&
        !menuPanelRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
        setExpandedMobileSection(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const handleMenuClick = (href?: string) => {
    if (!href) return;
    setMobileMenuOpen(false);
    setExpandedMobileSection(null);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigate(href);
  };

  return (
    <div className="w-full bg-brand-bg text-slate-900 overflow-x-hidden">
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
        }
        .animate-shake { animation: shake 600ms ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { animation: fadeUp 280ms ease forwards; }
        @keyframes scorePop { 0% { transform: translateY(0) scale(1); opacity: 1 } 50% { transform: translateY(-12px) scale(1.1); opacity: 1 } 100% { transform: translateY(-20px) scale(1); opacity: 0 } }
        .score-pulse { animation: scorePop 800ms ease forwards; }

        /* Mobile-first scroll snap for cards */
        .mobile-scroll-snap {
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .mobile-scroll-snap > * {
          scroll-snap-align: start;
          flex-shrink: 0;
        }

  /* Prevent overflow on all sections */
  section { max-width: 100vw; overflow-x: hidden; }

  /* Nav over hero - text turns white when transparent */
  .nav-hero .nav-menu-item { color: rgba(255,255,255,0.85) !important; background: transparent !important; }
  .nav-hero .nav-menu-item:hover { color: white !important; background: rgba(255,255,255,0.1) !important; }
  .nav-hero .nav-lang-selector { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.2) !important; }
  .nav-hero .nav-lang-selector .globe-icon { color: rgba(255,255,255,0.6) !important; }
  .nav-hero .nav-lang-selector [role="combobox"] { color: rgba(255,255,255,0.85) !important; }
  .nav-hero .nav-signin { color: rgba(255,255,255,0.85) !important; }
  .nav-hero .nav-signin:hover { color: white !important; background: rgba(255,255,255,0.1) !important; }

      `}</style>

      <div className="relative z-10">
  {/* ── NAV ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-slate-200" : "bg-transparent nav-hero"}`}>
          <div className="w-full px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
              {/* Logo */}
              <div className={`items-center gap-2 sm:gap-3 hidden sm:flex transition-all duration-300 ${scrolled ? "translate-y-0" : "gap-3 sm:gap-4 translate-y-10 sm:translate-y-14"}`}>
                <div className={`rounded-xl bg-transparent flex items-center justify-center shrink-0 overflow-hidden p-0 transition-all duration-300 ${scrolled ? "w-9 h-9 sm:w-11 sm:h-11" : "w-28 h-28 sm:w-32 sm:h-32"}`}>
                  <img
                    src={logoImage}
                    alt="Exegesis"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className={`font-black font-[family-name:var(--font-heading)] tracking-tighter transition-all duration-300 ${scrolled ? "text-base sm:text-xl text-brand-primary" : "hidden"}`}>
                  {t.landing?.siteTitle || "EXEGESIS PROJECT"}
                </span>
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-2 xl:gap-4 absolute left-1/2 -translate-x-1/2">
                {menuItems.map((item) =>
                  item.subItems ? (
                    <div key={item.label} className="relative group">
                      <button
                        className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item flex items-center gap-1 ${scrolled ? "text-[10px] text-slate-500 hover:text-brand-primary hover:bg-brand-bg" : "text-xs sm:text-sm text-white/90"}`}
                      >
                        {item.label}
                        <ChevronDown className="w-2.5 h-2.5 transition-transform group-hover:rotate-180" />
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[180px] overflow-hidden">
                          {item.subItems.map((sub) => (
                            <button
                              key={sub.label}
                              onClick={() => handleMenuClick(sub.href)}
                              className="w-full text-left px-5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-500 hover:text-brand-primary hover:bg-brand-bg transition-colors"
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => handleMenuClick(item.href)}
                      className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item ${scrolled ? "text-[10px] text-slate-500 hover:text-brand-primary hover:bg-brand-bg" : "text-xs sm:text-sm text-white/90"}`}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Language Selector */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 nav-lang-selector">
                  <Globe className="w-3 h-3 text-slate-400 globe-icon" />
                  <Select
                    value={currentLang}
                    onValueChange={(value) => setLanguage(value as Language)}
                    disabled={langLoading}
                  >
                    <SelectTrigger className="h-6 text-[10px] border-0 bg-transparent shadow-none p-0 gap-1 text-slate-500 hover:text-slate-700 focus:ring-0 [&>svg]:hidden">
                      <SelectValue>
                        <span className="font-bold">{LANGUAGE_NAMES[currentLang]}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="min-w-[140px]">
                      {[
                        { label: "Primary", languages: ["en"] as Language[] },
                        { label: "European", languages: ["de", "fr", "es", "pt", "it", "el", "ru"] as Language[] },
                        { label: "Indian", languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"] as Language[] },
                        { label: "Other", languages: ["ar", "sw", "ne", "fil"] as Language[] },
                      ].map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/50">
                            {group.label}
                          </SelectLabel>
                          {group.languages.map((code) => (
                            <SelectItem key={code} value={code} className="py-1 text-[11px]">
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span>{LANGUAGE_NAMES[code]}</span>
                                  {code !== 'en' && (
                                    <span className="text-muted-foreground/60 text-[9px]">
                                      ({getLanguageName(code, 'en')})
                                    </span>
                                  )}
                                </div>
                                {code === currentLang && (
                                  <Check className="w-2.5 h-2.5 text-primary shrink-0" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-slate-500 hover:text-brand-primary font-black uppercase tracking-widest text-[10px] nav-signin"
                  >
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
                {/* Left: Menu */}
                <button
                  className={`p-2 rounded-xl transition-colors ${scrolled ? "text-brand-primary hover:bg-slate-50" : "text-white hover:bg-white/10"}`}
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Center: Compact Logo */}
                <div className={`flex items-center gap-1.5 transition-all duration-300 ${scrolled ? "translate-y-0" : "translate-y-1 sm:translate-y-1.5"}`}>
                  <div className={`rounded-lg bg-transparent flex items-center justify-center overflow-hidden p-0 transition-all duration-300 ${scrolled ? "w-6 h-6" : "w-10 h-10 sm:w-12 sm:h-12"}`}>
                    <img
                      src={logoImage}
                      alt="Exegesis"
                      className={`w-full h-full object-contain transition-all duration-300 ${scrolled ? "" : "brightness-0 invert"}`}
                    />
                  </div>
                  <span className={`font-black font-[family-name:var(--font-heading)] tracking-tighter transition-all duration-300 ${scrolled ? "text-xs text-brand-primary" : "text-sm sm:text-base text-white"}`}>
                    {t.landing?.siteTitle || "EXEGESIS PROJECT"}
                  </span>
                </div>

                {/* Right: Sign In */}
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`font-black text-xs uppercase tracking-wider px-3 py-2 ${scrolled ? "text-brand-primary" : "text-white hover:bg-white/10"}`}
                  >
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
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={menuPanelRef}
              className="absolute top-0 left-0 bottom-0 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col h-full"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-brand-bg">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-brand-primary rounded-full" />
                  <span className="font-black text-brand-primary uppercase tracking-widest text-sm">
                    {t.landing?.menu || "Menu"}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="grid gap-1.5">
                  {menuItems.map((item) =>
                    item.subItems ? (
                      <div key={item.label}>
                        <button
                          onClick={() =>
                            setExpandedMobileSection(
                              expandedMobileSection === item.label ? null : item.label
                            )
                          }
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: hexToRgba(
                                item.mobileColor || "#396284",
                                0.15,
                              ),
                              color: item.mobileColor || "#396284",
                            }}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-[11px] font-medium text-slate-400 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${expandedMobileSection === item.label ? "rotate-180" : ""}`}
                          />
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-200 ${
                            expandedMobileSection === item.label
                              ? "max-h-80 opacity-100 mt-1"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="pl-14 pr-3 space-y-0.5 pb-1">
                            {item.subItems.map((sub) => (
                              <button
                                key={sub.label}
                                onClick={() => handleMenuClick(sub.href)}
                                className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-brand-primary hover:bg-brand-bg transition-colors uppercase tracking-wider"
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => handleMenuClick(item.href)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: hexToRgba(
                              item.mobileColor || "#396284",
                              0.15,
                            ),
                            color: item.mobileColor || "#396284",
                          }}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-[11px] font-medium text-slate-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand-primary transition-colors" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Language Selector - Mobile */}
              <div className="px-5 py-3 border-t border-slate-100">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 border border-slate-200">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <Select
                    value={currentLang}
                    onValueChange={(value) => setLanguage(value as Language)}
                    disabled={langLoading}
                  >
                    <SelectTrigger className="h-6 text-xs border-0 bg-transparent shadow-none p-0 gap-1 text-slate-500 hover:text-slate-700 focus:ring-0 [&>svg]:hidden flex-1">
                      <SelectValue>
                        <span className="font-bold">{LANGUAGE_NAMES[currentLang]}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="min-w-[140px]">
                      {[
                        { label: "Primary", languages: ["en"] as Language[] },
                        { label: "European", languages: ["de", "fr", "es", "pt", "it", "el", "ru"] as Language[] },
                        { label: "Indian", languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"] as Language[] },
                        { label: "Other", languages: ["ar", "sw", "ne", "fil"] as Language[] },
                      ].map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/50">
                            {group.label}
                          </SelectLabel>
                          {group.languages.map((code) => (
                            <SelectItem key={code} value={code} className="py-1 text-[11px]">
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span>{LANGUAGE_NAMES[code]}</span>
                                  {code !== 'en' && (
                                    <span className="text-muted-foreground/60 text-[9px]">
                                      ({getLanguageName(code, 'en')})
                                    </span>
                                  )}
                                </div>
                                {code === currentLang && (
                                  <Check className="w-2.5 h-2.5 text-primary shrink-0" />
                                )}
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
                <Link
                  to="/login"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-brand-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-primary/20 text-base uppercase tracking-widest">
                    {t.landing?.getStartedBtn || "Get Started"}
                  </Button>
                </Link>
              </div>
            </motion.div>
            <div
              className="absolute inset-0 -z-10"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* ── HERO ── */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Full-viewport background image */}
          <div className="absolute inset-0">
            <img
              src={heroBgImage}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-28 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Logo badge */}

              {/* Tagline */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter whitespace-nowrap">
                {t.landing?.welcome || "Welcome To The"}{" "}
                <span className="text-brand-accent">{t.landing?.heroTitle || "Exegesis Project!"}</span>
              </h1>

              {/* Two buttons */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center mt-8 sm:mt-24 mx-auto">
                <Link to="/login" className="w-full sm:w-80">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-6 sm:px-8 py-6 rounded-[2rem] font-black text-sm sm:text-base backdrop-blur-sm uppercase tracking-widest transition-all"
                  >
                    {t.landing?.watchIntro || "Watch The Intro"}
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-80">
                  <Button className="w-full bg-brand-accent text-white hover:bg-brand-accent-dark px-6 sm:px-8 py-6 rounded-[2rem] font-black text-sm sm:text-base shadow-2xl shadow-brand-accent/30 hover:scale-105 transition-all uppercase tracking-widest">
                    {t.landing?.getStarted || "Get Started"}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              </div>


            </motion.div>
          </div>
        </section>

       
        <section
          id="features"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <div className="text-center mb-10 sm:mb-16 md:mb-10">
              <motion.div
                variants={animSlideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-80px" }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-5 sm:mb-8 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.landing?.featuresTitle || "Our"}{" "}
                  <span className="text-brand-primary">
                    {t.landing?.featuresTitleHighlight || "Spirit-Led"}
                  </span>
                  <span className="block sm:inline"> {t.landing?.features || "Features"}</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                  {t.landing?.featuresDesc ||
                    "We are passionate Jesus followers dedicated to helping you shine with excellence and integrity in everything you do."}
                </p>
              </motion.div>
            </div>

            {/* Mobile: 1-col, Tablet: 2-col, Desktop: 3-col */}
            <motion.div
              variants={animStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-60px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {[
                { title: t.landing?.featureBibleAppTitle || "Bible App", icon: Globe, desc: t.landing?.featureBibleAppDesc || "Access the full Scriptures anytime, anywhere. Multiple translations for deeper study and understanding." },
                { title: t.landing?.featureBibleStudiesTitle || "Bible Studies", icon: BookOpen, desc: t.landing?.featureBibleStudiesDesc || "Structured study guides that walk you through books of the Bible with rich insights and historical context." },
                { title: t.landing?.featureVVTeachingTitle || "Verse by Verse Teaching", icon: Mic2, desc: t.landing?.featureVVTeachingDesc || "Detailed verse-by-verse explanations to uncover the depth and meaning of every passage of Scripture." },
                { title: t.landing?.featureVDevotionalsTitle || "Verse Devotionals", icon: Heart, desc: t.landing?.featureVDevotionalsDesc || "Daily devotionals centered on specific verses to help you meditate on God's Word and apply it to your life." },
                { title: t.landing?.featureJournalingTitle || "Journaling", icon: Sparkles, desc: t.landing?.featureJournalingDesc || "Capture your thoughts, prayers, and reflections as you journey through Scripture with guided journal prompts." },
                { title: t.landing?.featureChallengesTitle || "Challenges", icon: Trophy, desc: t.landing?.featureChallengesDesc || "Engage in Bible reading challenges and trivia to grow your knowledge and stay consistent in the Word." },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={animCardUp}
                  className="group"
                >
                  <div className="p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] bg-brand-bg border border-slate-100 hover:border-brand-primary/30 hover:shadow-[0_24px_48px_-12px_rgba(57,98,132,0.1)] transition-all duration-500 h-full flex flex-col">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center mb-5 sm:mb-7 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
                      <f.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
                      {f.desc}
                    </p>
                    <div className="mt-auto pt-6">
                      <div className="w-8 h-1 bg-slate-200 group-hover:w-16 group-hover:bg-brand-accent transition-all duration-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── BIBLE STATS ── */}
        <section className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-brand-card border-y border-slate-100">
          <div className="w-full max-w-4xl mx-auto">
            <motion.div
              variants={animFadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-80px" }}
            >
              <div className="text-center mb-10 sm:mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-5 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    {t.landing?.bibleStatsBadge || "The Holy Scriptures"}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.landing?.bibleStatsTitle || "The"}{" "}
                  <span className="text-brand-primary">
                    {t.landing?.bibleStatsTitleHighlight || "Word"}
                  </span>
                  {t.landing?.bibleStatsOfGod || " of God"}
                </h2>
              </div>

              <motion.div
                variants={animStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-60px" }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
              >
                {[
                  { stat: "66", label: t.landing?.bibleStatsBooks || "Books", icon: BookOpen },
                  { stat: "1,189", label: t.landing?.bibleStatsChapters || "Chapters", icon: CalendarDays },
                  { stat: "31,102", label: t.landing?.bibleStatsVerses || "Verses", icon: Quote },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={animScaleIn}
                    className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-slate-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 text-center group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-bg flex items-center justify-center mx-auto mb-4 sm:mb-5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                      <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-primary tracking-tighter mb-1">
                      {item.stat}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </div>
                    <div className="w-8 h-1 bg-slate-200 group-hover:w-12 group-hover:bg-brand-accent transition-all duration-500 mx-auto mt-4 rounded-full" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── EXEGESIS DAILY ── */}
        <section
          id="exegesis-daily"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-brand-card"
        >
          <div className="w-full max-w-screen-xl mx-auto">
            <motion.div
              variants={animFadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-80px" }}
            >
              <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.landing?.exegesisProjectTitle || "EXEGESIS"}{" "}
                  <span className="text-brand-primary">
                    {t.landing?.exegesisProjectTitleHighlight || "PROJECT"}
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
                  {t.landing?.exegesisProjectDesc ||
                    "We're going to want to make each section follow the features of the app"}
                </p>
              </div>

              {/* 4 feature cards */}
              <motion.div
                variants={animStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-60px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
              >
                {[
                  { title: t.landing?.exegesisVVTeachingTitle || "Verse by Verse Teaching", icon: Mic2, desc: t.landing?.exegesisVVTeachingDesc || "Explanation and application with a learn more tab just like our Lordsbook dailies verse by verse." },
                  { title: t.landing?.exegesisVDevotionalsTitle || "Verse Devotionals", icon: Heart, desc: t.landing?.exegesisVDevotionalsDesc || "Daily devotionals centered on specific verses to help you meditate on God's Word and apply it to your life." },
                  { title: t.landing?.exegesisBibleStudyTitle || "Bible Study", icon: BookOpen, desc: t.landing?.exegesisBibleStudyDesc || "Structured study guides that walk you through books of the Bible with rich insights and historical context." },
                  { title: t.landing?.exegesisJournalingTitle || "Journaling", icon: Sparkles, desc: t.landing?.exegesisJournalingDesc || "Capture your thoughts, prayers, and reflections as you journey through Scripture with guided journal prompts." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={animCardUp}
                    className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-bg flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
                      <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                    <div className="mt-6">
                      <div className="w-8 h-1 bg-slate-200 group-hover:w-16 group-hover:bg-brand-accent transition-all duration-500" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>



        {/* ── ABOUT ── */}
        <section
          id="about"
          className="px-4 sm:px-6 lg:px-12 py-14 sm:py-20 md:py-28 bg-brand-card"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                variants={animSlideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-5">
                  <Users className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest">
                    {t.landing?.aboutBadge || "Our Calling"}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] mb-6 leading-tight tracking-tighter">
                  {t.landing?.aboutTitle || "Built for Kingdom"}{" "}
                  <span className="text-brand-primary">
                    {t.landing?.aboutTitleHighlight || "Impact"}
                  </span>
                </h2>
                <div className="space-y-4 text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
                  <p>
                    {t.landing?.aboutPara1 ||
                      "At Exegesis, we believe your spiritual journey deserves more than just a casual reading—it deserves a powerful, purpose-driven digital footprint rooted in faith and fueled by the Gospel."}
                  </p>
                  <p>
                    {t.landing?.aboutPara2 ||
                      "We're not just another app—we're passionate Jesus followers, tech experts, and creative visionaries who live to serve the Lord in everything we do."}
                  </p>
                  <p className="font-black text-brand-accent italic text-xl sm:text-2xl tracking-tight">
                    {t.landing?.aboutMotto ||
                      "Quality, Service, & Integrity — Built for His Glory."}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10">
                  {[
                    {
                      stat: t.landing?.aboutStatVerses || "31K+",
                      label: t.landing?.aboutStatVersesLabel ||
                        "Verses Explored",
                    },
                    {
                      stat: t.landing?.aboutStatDaily || "150+",
                      label: t.landing?.aboutStatDailyLabel ||
                        "Daily Insights",
                    },
                    {
                      stat: t.landing?.aboutStatGlobal || "Global",
                      label: t.landing?.aboutStatGlobalLabel ||
                        "Kingdom Reach",
                    },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tighter">
                        {s.stat}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={animStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
              >
                {[
                  {
                    icon: ShieldCheck,
                    title: t.landing?.aboutValueRootedTitle ||
                      "Rooted in Truth",
                    desc: t.landing?.aboutValueRootedDesc ||
                      "Every insight and explanation is grounded in sound biblical scholarship and prayer.",
                  },
                  {
                    icon: Globe,
                    title: t.landing?.aboutValueGlobalTitle ||
                      "Global Community",
                    desc: t.landing?.aboutValueGlobalDesc ||
                      "Pray, testify, and grow alongside believers from every corner of the world.",
                  },
                  {
                    icon: Sparkles,
                    title: t.landing?.aboutValueSpiritTitle ||
                      "Spirit-Led Tech",
                    desc: t.landing?.aboutValueSpiritDesc ||
                      "We use modern technology to illuminate ancient wisdom for today's generation.",
                  },
                  {
                    icon: Zap,
                    title: t.landing?.aboutValueGrowingTitle ||
                      "Always Growing",
                    desc: t.landing?.aboutValueGrowingDesc ||
                      "Constant updates and fresh content to keep your spiritual journey vibrant and active.",
                  },
                ].map((v, i) => (
                  <motion.div
                    key={v.title}
                    variants={animCardUp}
                    className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-7 hover:shadow-xl transition-all duration-500 group"
                  >
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-brand-bg flex items-center justify-center mb-4 group-hover:bg-brand-primary/10 transition-colors">
                      <v.icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                    </div>
                    <h4 className="font-black text-base sm:text-lg text-brand-primary mb-2 font-[family-name:var(--font-heading)] tracking-tight">
                      {v.title}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {v.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 text-center relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-brand-card/50 -z-10" />
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <motion.div
              variants={animScaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-heading)] mb-6 sm:mb-8 leading-tight text-brand-primary tracking-tighter">
                {t.landing?.ctaTitle || "Ready to Deepen Your"}{" "}
                <br className="hidden sm:block" />
                <span className="text-brand-accent">
                  {t.landing?.ctaTitleHighlight || "Kingdom Impact?"}
                </span>
              </h2>
             
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-16">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button className="w-full bg-brand-primary text-white px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] font-black text-base sm:text-xl hover:bg-brand-primary-dark hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                    {t.landing?.ctaButton || "Start Your Journey Today"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 bg-transparent text-slate-600 px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] font-black text-base sm:text-xl hover:bg-white hover:border-brand-primary hover:text-brand-primary transition-all uppercase tracking-widest"
                  >
                    {t.landing?.signIn || "Sign In"}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          id="contact"
          className="bg-brand-dark pt-16 sm:pt-24 pb-0"
        >
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-12">
              {/* LEFT: Scripture verse */}
              <motion.div
                variants={animSlideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="w-full lg:w-1/3"
              >
                <p className="text-brand-accent/80 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed max-w-sm">
                  &ldquo;{t.landing?.footerVerse || "Write the vision, and make it plain upon tables, that he may run that readeth it."}&rdquo;
                </p>
                <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4">
                  — {t.landing?.footerVerseRef || "Habakkuk 2:2"}
                </p>
              </motion.div>

              {/* MIDDLE: Logo & Brand */}
              <motion.div
                variants={animFadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="w-full lg:w-1/3 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                    <img
                      src={logoImage}
                      alt="Exegesis"
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter">
                    {t.landing?.siteTitle || "EXEGESIS PROJECT"}
                  </span>
                </div>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                  {t.landing?.footerDesc ||
                    "Helping you shine with excellence and integrity through the power of the Word."}
                </p>
              </motion.div>

              {/* RIGHT: Follow Us */}
              <motion.div
                variants={animSlideRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="w-full lg:w-1/3 lg:text-right"
              >
                <h4 className="text-brand-accent font-serif text-lg sm:text-xl mb-6">
                  {t.landing?.footerConnect || "Connect With Us"}
                </h4>
                <div className="flex items-center lg:justify-end gap-4">                    <TooltipProvider>
                      {socialLinks.map((s) => (
                        <Tooltip key={s.name}>
                          <TooltipTrigger asChild>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-white transition-all duration-300 border border-brand-accent/30"
                              aria-label={s.name}
                            >
                              <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {s.name}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                </div>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 my-12 sm:my-16" />
          </div>

          {/* Copyright bar */}
          <div className="bg-black/40 border-t border-white/5 py-5 sm:py-6 px-4">
            <div className="w-full max-w-5xl mx-auto flex flex-row justify-between items-center gap-3 text-center sm:text-left px-4 sm:px-6">
              <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                {(t.landing?.footerCopyright || "© {year} Exegesis. Built for Kingdom Impact.").replace(
                  "{year}",
                  String(new Date().getFullYear()),
                )}
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                {t.landing?.footerPoweredBy || "Powered by Him First Media Group."}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
