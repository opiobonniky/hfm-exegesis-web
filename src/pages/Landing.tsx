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
  FlameKindling,
  HandHeart,
  Twitter,
  Instagram,
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
import { Button } from "@/components/ui/button";
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
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaSelected, setTriviaSelected] = useState<string | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [resultAnim, setResultAnim] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [showScorePulse, setShowScorePulse] = useState(false);
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
          { label: "Who We Are", href: "#about" },
          { label: "Our Vision", href: "#" },
          { label: "Our Mission", href: "#" },
          { label: "Our Goals", href: "#" },
          { label: "Leadership", href: "#" },
          { label: "Founders", href: "#" },
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
        label: "Features",
        href: "#features",
        icon: Sparkles,
        description: "App features & tools",
        mobileColor: "#A7F3D0",
      },
      {
        label: "Resources",
        href: "#",
        icon: Globe,
        description: "Bible studies & guides",
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
          name: t.landing?.socialFacebook || "Facebook",
          url: "https://facebook.com",
          icon: Facebook,
        },
        {
          name: t.landing?.socialTwitter || "Twitter",
          url: "https://twitter.com",
          icon: Twitter,
        },
        {
          name: t.landing?.socialInstagram || "Instagram",
          url: "https://instagram.com",
          icon: Instagram,
        },
      ],
      [t],
    );

  const prayers = useMemo(
    () => [
      {
        name: "Sarah M.",
        location: "Nairobi, KE",
        request:
          t.landing?.prayerCard1Request ||
          "Please pray for my mother's healing. She was admitted to hospital yesterday and we trust God for a miracle.",
        likes: 42,
        time: "2h ago",
      },
      {
        name: "James O.",
        location: "Lagos, NG",
        request:
          t.landing?.prayerCard2Request ||
          "Seeking God's direction for a new job. I have an interview next week and I need wisdom and favour.",
        likes: 29,
        time: "5h ago",
      },
      {
        name: "Grace K.",
        location: "Kampala, UG",
        request:
          t.landing?.prayerCard3Request ||
          "Thank you all for praying for my marriage. God has restored what I thought was lost. He is faithful!",
        likes: 87,
        time: "1d ago",
      },
    ],
    [t],
  );

  const testimonies = useMemo(
    () => [
      {
        name: "David N.",
        title: t.landing?.testyCard1Title || "God Saved My Business",
        story:
          t.landing?.testyCard1Story ||
          "When my company was on the verge of collapse, I turned to this app and found Joshua 1:9 in Exegesis Daily. Three weeks later, a contract appeared out of nowhere. God is real.",
        verse: "Joshua 1:9",
        avatar: "DN",
      },
      {
        name: "Ruth A.",
        title: t.landing?.testyCard2Title || "Healed from Depression",
        story:
          t.landing?.testyCard2Story ||
          "For two years I battled hopelessness. The Prayer Wall community prayed with me. Psalm 34:18 became my anchor. I am standing today as living proof of God's love.",
        verse: "Psalm 34:18",
        avatar: "RA",
      },
      {
        name: "Peter L.",
        title: t.landing?.testyCard3Title || "My Family Came to Faith",
        story:
          t.landing?.testyCard3Story ||
          "I started sharing Exegesis Daily devotionals with my wife every morning. Within six months, my entire household gave their lives to Christ.",
        verse: "Acts 16:31",
        avatar: "PL",
      },
    ],
    [t],
  );

  const triviaQuestions = useMemo(
    () => [
      {
        question: t.landing?.triviaQ1 || "How many books are in the Old Testament?",
        answer: "39",
        options: ["27", "39", "66", "46"],
      },
      {
        question: t.landing?.triviaQ2 || "Who built the ark?",
        answer: "Noah",
        options: ["Moses", "Abraham", "Noah", "David"],
      },
      {
        question: t.landing?.triviaQ3 || "Which book comes first in the New Testament?",
        answer: "Matthew",
        options: ["Mark", "John", "Luke", "Matthew"],
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

  const handleTriviaAnswer = (option: string) => {
    if (triviaSelected) return;
    setTriviaSelected(option);
    const correct = option === triviaQuestions[triviaIndex].answer;
    if (correct) {
      setTriviaScore((s) => s + 1);
      setResultAnim("correct");
      setShowScorePulse(true);
      setTimeout(() => setShowScorePulse(false), 900);
    } else {
      setResultAnim("incorrect");
    }
    setTimeout(() => setResultAnim(null), 900);
  };

  const nextTrivia = () => {
    setTriviaSelected(null);
    setTriviaIndex((i) => (i + 1) % triviaQuestions.length);
  };

  const currentQ = triviaQuestions[triviaIndex];

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
              <div className={`items-center gap-2 sm:gap-3 hidden sm:flex transition-all duration-300 ${scrolled ? "" : "gap-3 sm:gap-4"}`}>
                <div className={`rounded-xl bg-brand-bg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-1 transition-all duration-300 ${scrolled ? "w-9 h-9 sm:w-11 sm:h-11" : "w-11 h-11 sm:w-14 sm:h-14"}`}>
                  <img
                    src={logoImage}
                    alt="Exegesis"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className={`font-black font-[family-name:var(--font-heading)] tracking-tighter transition-all duration-300 ${scrolled ? "text-base sm:text-xl text-brand-primary" : "text-xl sm:text-2xl md:text-3xl text-white"}`}>
                  EXEGESIS
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
                <div className="flex items-center gap-1.5">
                  <div className={`rounded-lg flex items-center justify-center overflow-hidden p-0.5 transition-all duration-300 ${scrolled ? "w-6 h-6" : "w-7 h-7"}`}>
                    <img
                      src={logoImage}
                      alt="Exegesis"
                      className={`w-full h-full object-contain transition-all duration-300 ${scrolled ? "" : "brightness-0 invert"}`}
                    />
                  </div>
                  <span className={`font-black font-[family-name:var(--font-heading)] tracking-tighter transition-all duration-300 ${scrolled ? "text-xs text-brand-primary" : "text-sm text-white"}`}>
                    EXEGESIS
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
              <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={logoImage}
                    alt="Exegesis"
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-white font-black text-xl sm:text-2xl md:text-3xl tracking-tighter font-[family-name:var(--font-heading)]">
                  EXEGESIS
                </span>
              </div>

              {/* Tagline */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                {"Welcome To The "}
                <span className="text-brand-accent">Exegesis project!</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mt-4 sm:mt-6 font-medium max-w-3xl mx-auto leading-relaxed">
                Searching The Scriptures Daily
              </p>

              {/* Two buttons */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center mt-8 sm:mt-10">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8 sm:px-10 py-6 rounded-[2rem] font-black text-sm sm:text-base backdrop-blur-sm uppercase tracking-widest transition-all"
                  >
                    {t.landing?.signIn || "Sign In"}
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full bg-brand-accent text-white hover:bg-brand-accent-dark px-8 sm:px-10 py-6 rounded-[2rem] font-black text-sm sm:text-base shadow-2xl shadow-brand-accent/30 hover:scale-105 transition-all uppercase tracking-widest">
                    {t.landing?.getStarted || "Start Your Journey"}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter">
                    31K+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest mt-0.5">
                    {t.landing?.statVerses || "Holy Verses"}
                  </div>
                </div>

                <div className="w-px h-8 sm:h-10 bg-white/10" />

                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter">
                    66
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest mt-0.5">
                    {t.landing?.statSacredBooks || "Sacred Books"}
                  </div>
                </div>

                <div className="w-px h-8 sm:h-10 bg-white/10" />

                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter">
                    150+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest mt-0.5">
                    {t.landing?.statExplanations || "Explanations"}
                  </div>
                </div>
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
                {
                  title: "Bible App",
                  icon: Globe,
                  desc: "Access the full Scriptures anytime, anywhere. Multiple translations for deeper study and understanding.",
                },
                {
                  title: "Bible Studies",
                  icon: BookOpen,
                  desc: "Structured study guides that walk you through books of the Bible with rich insights and historical context.",
                },
                {
                  title: "Verse by Verse Teaching",
                  icon: Mic2,
                  desc: "Detailed verse-by-verse explanations to uncover the depth and meaning of every passage of Scripture.",
                },
                {
                  title: "Verse Devotionals",
                  icon: Heart,
                  desc: "Daily devotionals centered on specific verses to help you meditate on God's Word and apply it to your life.",
                },
                {
                  title: "Journaling",
                  icon: Sparkles,
                  desc: "Capture your thoughts, prayers, and reflections as you journey through Scripture with guided journal prompts.",
                },
                {
                  title: "Challenges",
                  icon: Trophy,
                  desc: "Engage in Bible reading challenges and trivia to grow your knowledge and stay consistent in the Word.",
                },
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
                  {" of God"}
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
                  {
                    title: "Verse by Verse Teaching",
                    icon: Mic2,
                    desc: "Explanation and application with a learn more tab just like our Lordsbook dailies verse by verse.",
                  },
                  {
                    title: "Verse Devotionals",
                    icon: Heart,
                    desc: "Daily devotionals centered on specific verses to help you meditate on God's Word and apply it to your life.",
                  },
                  {
                    title: "Bible Study",
                    icon: BookOpen,
                    desc: "Structured study guides that walk you through books of the Bible with rich insights and historical context.",
                  },
                  {
                    title: "Journaling",
                    icon: Sparkles,
                    desc: "Capture your thoughts, prayers, and reflections as you journey through Scripture with guided journal prompts.",
                  },
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

        {/* ── PRAYER WALL ── */}
        <section
          id="prayer-wall"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14 md:mb-20">
              <motion.div
                variants={animSlideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bg border border-slate-200 mb-5">
                  <HandHeart className="w-3.5 h-3.5 text-brand-accent" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    {t.landing?.prayerBadge || "Community"}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.landing?.prayerTitle || "Prayer"}{" "}
                  <span className="text-brand-accent">
                    {t.landing?.prayerTitleHighlight || "Wall"}
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-md font-medium">
                  {t.landing?.prayerDesc ||
                    "Lift each other up in faith. Submit a request or stand in the gap."}
                </p>
              </motion.div>
              <motion.div
                variants={animSlideRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="self-start lg:self-auto"
              >
                <Link to="/login">
                  <Button className="bg-brand-primary text-white px-6 sm:px-8 py-5 sm:py-6 rounded-[1.5rem] font-black text-sm sm:text-base shadow-2xl shadow-brand-primary/30 hover:bg-brand-primary-dark transition-all uppercase tracking-widest whitespace-nowrap">
                    {t.landing?.addRequest || "Add Request"}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Mobile: horizontal scroll cards */}
            <motion.div
              variants={animStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto pb-4 lg:pb-0 mobile-scroll-snap -mx-4 px-4 lg:mx-0 lg:px-0"
            >
              {prayers.map((p, i) => (
                <motion.div
                  key={p.name}
                  variants={animCardUp}
                  className="bg-brand-bg rounded-[1.75rem] p-5 sm:p-7 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group w-[80vw] sm:w-[60vw] lg:w-auto flex-shrink-0"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-primary font-black text-base border border-slate-100">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base tracking-tight">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {p.location} · {p.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed font-bold italic mb-5">
                    "{p.request}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-primary transition-colors uppercase tracking-widest">
                      <HandHeart className="w-4 h-4" />
                      {(t.landing?.prayingLabel || "Praying ({n})").replace(
                        "{n}",
                        String(p.likes),
                      )}
                    </button>
                    <Link
                      to="/login"
                      className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:underline"
                    >
                      {t.landing?.prayNow || "PRAY NOW →"}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── TESTIFY ── */}
        <section
          id="testify"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-brand-bg"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14 md:mb-20">
              <motion.div
                variants={animSlideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-5">
                  <Mic2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    {t.landing?.testifyBadge || "Testimonies"}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  {t.landing?.testifyTitle || "Testify &"}{" "}
                  <span className="text-brand-primary">
                    {t.landing?.testifyTitleHighlight || "Inspire"}
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-md font-medium">
                  {t.landing?.testifyDesc ||
                    "God is still writing amazing stories. Share your journey and help others see His power."}
                </p>
              </motion.div>
              <Link to="/login" className="self-start lg:self-auto">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-white px-6 sm:px-8 py-5 sm:py-6 rounded-2xl font-black text-sm sm:text-base shadow-sm whitespace-nowrap"
                >
                  {t.landing?.shareStory || "Share Your Story"}{" "}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <motion.div
              variants={animStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto pb-4 lg:pb-0 mobile-scroll-snap -mx-4 px-4 lg:mx-0 lg:px-0"
            >
              {testimonies.map((tItem, i) => (
                <motion.div
                  key={tItem.name}
                  variants={animScaleIn}
                  className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 flex flex-col group relative w-[80vw] sm:w-[60vw] lg:w-auto flex-shrink-0"
                >
                  <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary/10 absolute top-6 right-6" />
                  <h3 className="text-xl sm:text-2xl font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight group-hover:text-brand-accent transition-colors">
                    {tItem.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium italic mb-6">
                    "{tItem.story}"
                  </p>
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary font-black text-xs border border-slate-100">
                        {tItem.avatar}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tight">
                          {tItem.name}
                        </p>
                        <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">
                          {tItem.verse}
                        </p>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-slate-200 hover:text-brand-accent transition-colors cursor-pointer" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── BIBLE TRIVIA ── */}
        <section
          id="bible-trivia"
          className="px-4 sm:px-6 lg:px-12 py-14 sm:py-20 md:py-28 bg-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-brand-primary/5 rounded-full blur-[100px] -z-10" />
          <div className="w-full max-w-screen-xl mx-auto text-center">
            <motion.div
              variants={animFadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bg border border-slate-200 mb-5">
                <Trophy className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest">
                  {t.landing?.triviaBadge || "Bible Challenge"}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] mb-5 leading-tight tracking-tighter">
                {t.landing?.triviaTitle || "Test Your"}{" "}
                <span className="text-brand-primary">
                  {t.landing?.triviaTitleHighlight || "Knowledge"}
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 sm:mb-14 max-w-xl mx-auto leading-relaxed font-medium">
                {t.landing?.triviaDesc ||
                  "Grow in the Word through our interactive challenges. Hide His Word in your heart while having fun!"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-[0_24px_48px_-12px_rgba(57,98,132,0.1)] relative z-10"
            >
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    {(t.landing?.questionOf || "Question {n} of {total}")
                      .replace("{n}", String(triviaIndex + 1))
                      .replace("{total}", String(triviaQuestions.length))}
                  </span>
                  <div className="flex gap-1">
                    {triviaQuestions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === triviaIndex ? "w-8 bg-brand-primary" : idx < triviaIndex ? "w-4 bg-brand-primary/30" : "w-4 bg-slate-100"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <span className="text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-brand-accent text-white font-black inline-flex items-center shadow-lg shadow-brand-accent/20 uppercase tracking-widest">
                    {(t.landing?.score || "Score: {n}").replace(
                      "{n}",
                      String(triviaScore),
                    )}
                  </span>
                  {showScorePulse && (
                    <span className="absolute -top-7 right-0 text-xl text-green-500 font-black score-pulse">
                      +1
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-8 sm:mb-10 text-brand-primary leading-tight font-[family-name:var(--font-heading)] tracking-tight text-left">
                {currentQ.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {currentQ.options.map((opt) => {
                  const isSelected = triviaSelected === opt;
                  const isCorrect = opt === currentQ.answer;
                  let cls =
                    "py-4 sm:py-5 px-5 sm:px-7 rounded-[1.25rem] border-2 text-sm sm:text-base font-black transition-all duration-300 text-left relative overflow-hidden ";
                  if (!triviaSelected) {
                    cls +=
                      "border-slate-100 bg-brand-bg/50 text-slate-600 hover:border-brand-primary hover:bg-white hover:text-brand-primary cursor-pointer hover:scale-[1.02]";
                  } else if (isCorrect) {
                    cls +=
                      "border-green-500 bg-green-50 text-green-600 scale-[1.03] shadow-lg shadow-green-500/10";
                  } else if (isSelected) {
                    cls +=
                      "border-red-500 bg-red-50 text-red-600 animate-shake";
                  } else {
                    cls +=
                      "border-slate-50 bg-slate-50/30 text-slate-300 opacity-50";
                  }
                  return (
                    <button
                      key={opt}
                      className={cls}
                      onClick={() => handleTriviaAnswer(opt)}
                      aria-pressed={isSelected}
                    >
                      <span className="relative z-10 flex items-center justify-between w-full">
                        <span>{opt}</span>
                        {isCorrect && triviaSelected && (
                          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs fade-in-up">
                            ✓
                          </div>
                        )}
                        {isSelected && !isCorrect && (
                          <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs fade-in-up">
                            ✕
                          </div>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {triviaSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-between gap-5 pt-8 border-t border-slate-100"
                >
                  <p className="text-brand-primary text-base sm:text-lg font-bold italic font-[family-name:var(--font-heading)] tracking-tight text-center sm:text-left">
                    {triviaSelected === currentQ.answer ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="text-brand-accent w-5 h-5" />
                        {t.landing?.wellDoneMsg ||
                          "Well done! You're growing in wisdom."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="text-red-500 w-5 h-5" />
                        {t.landing?.keepStudyingMsg ||
                          "Keep studying! The Word is a lamp to your feet."}
                      </span>
                    )}
                  </p>
                  <Button
                    onClick={nextTrivia}
                    className="w-full sm:w-auto bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-5 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-brand-primary/20 uppercase tracking-widest"
                  >
                    {t.landing?.nextChallenge || "Next Challenge"}
                  </Button>
                </motion.div>
              )}
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
                    EXEGESIS
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
                  {t.landing?.footerFollowUs || "Follow Us"}
                </h4>
                <div className="flex items-center lg:justify-end gap-4">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-white transition-all duration-300 border border-brand-accent/30"
                      aria-label={s.name}
                    >
                      <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
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
                {t.landing?.footerPoweredBy || "Powered by Him First media Group."}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
