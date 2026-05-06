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
  Quote,
  Mic2,
  Trophy,
  Users,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { sendPostRequest } from "@/services/api";
import { getVerseText } from "@/utilities/bibleUtils";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

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
  href: string;
  icon: React.ElementType;
  description?: string;
  mobileColor?: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Home",
    href: "#home",
    icon: BookOpen,
    description: "Welcome & daily verse",
    mobileColor: "#FFD68A",
  },
  {
    label: "Exegesis Daily",
    href: "#exegesis-daily",
    icon: CalendarDays,
    description: "Daily devotionals",
    mobileColor: "#FFB4B4",
  },
  {
    label: "Prayer Wall",
    href: "#prayer-wall",
    icon: HandHeart,
    description: "Community prayers",
    mobileColor: "#A7F3D0",
  },
  {
    label: "Testify",
    href: "#testify",
    icon: Mic2,
    description: "Share your story",
    mobileColor: "#C7D2FE",
  },
  {
    label: "Bible Trivia",
    href: "#bible-trivia",
    icon: Trophy,
    description: "Test your knowledge",
    mobileColor: "#FFD6A5",
  },
  {
    label: "About Us",
    href: "#about",
    icon: Users,
    description: "Our mission",
    mobileColor: "#99F6E4",
  },
  {
    label: "Contact Us",
    href: "#contact",
    icon: MailIcon,
    description: "Get in touch",
    mobileColor: "#FBCFE8",
  },
];

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Support Center", href: "#" },
];

const socialLinks: { name: string; url: string; icon: React.ElementType }[] = [
  { name: "Facebook", url: "https://facebook.com", icon: Facebook },
  { name: "Twitter", url: "https://twitter.com", icon: Twitter },
  { name: "Instagram", url: "https://instagram.com", icon: Instagram },
];

const devotionals = [
  {
    date: "Today",
    title: "Walking in Faith, Not Fear",
    book: "Joshua 1:9",
    excerpt:
      "God's command to Joshua was clear: be strong and courageous. Not because circumstances were easy, but because God promised His presence through every difficulty.",
    tag: "Faith",
  },
  {
    date: "Yesterday",
    title: "The Bread of Life",
    book: "John 6:35",
    excerpt:
      "Jesus declares Himself the bread that truly satisfies—nourishment not for the body, but for the eternal soul that hungers for meaning and purpose.",
    tag: "Grace",
  },
  {
    date: "2 days ago",
    title: "Still Waters, Restored Soul",
    book: "Psalm 23:2–3",
    excerpt:
      "The Shepherd does not just guide us—He restores us. He leads us to stillness so He can mend what life has broken inside us.",
    tag: "Rest",
  },
];

const prayers = [
  {
    name: "Sarah M.",
    location: "Nairobi, KE",
    request:
      "Please pray for my mother's healing. She was admitted to hospital yesterday and we trust God for a miracle.",
    likes: 42,
    time: "2h ago",
  },
  {
    name: "James O.",
    location: "Lagos, NG",
    request:
      "Seeking God's direction for a new job. I have an interview next week and I need wisdom and favour.",
    likes: 29,
    time: "5h ago",
  },
  {
    name: "Grace K.",
    location: "Kampala, UG",
    request:
      "Thank you all for praying for my marriage. God has restored what I thought was lost. He is faithful!",
    likes: 87,
    time: "1d ago",
  },
];

const testimonies = [
  {
    name: "David N.",
    title: "God Saved My Business",
    story:
      "When my company was on the verge of collapse, I turned to this app and found Joshua 1:9 in Exegesis Daily. Three weeks later, a contract appeared out of nowhere. God is real.",
    verse: "Joshua 1:9",
    avatar: "DN",
  },
  {
    name: "Ruth A.",
    title: "Healed from Depression",
    story:
      "For two years I battled hopelessness. The Prayer Wall community prayed with me. Psalm 34:18 became my anchor. I am standing today as living proof of God's love.",
    verse: "Psalm 34:18",
    avatar: "RA",
  },
  {
    name: "Peter L.",
    title: "My Family Came to Faith",
    story:
      "I started sharing Exegesis Daily devotionals with my wife every morning. Within six months, my entire household gave their lives to Christ.",
    verse: "Acts 16:31",
    avatar: "PL",
  },
];

const triviaQuestions = [
  {
    question: "How many books are in the Old Testament?",
    answer: "39",
    options: ["27", "39", "66", "46"],
  },
  {
    question: "Who built the ark?",
    answer: "Noah",
    options: ["Moses", "Abraham", "Noah", "David"],
  },
  {
    question: "Which book comes first in the New Testament?",
    answer: "Matthew",
    options: ["Mark", "John", "Luke", "Matthew"],
  },
];

const Landing = () => {
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
    const handleScrollClose = () => setMobileMenuOpen(false);
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
      )
        setMobileMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileMenuOpen]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const handleMenuClick = (href: string) => {
    setMobileMenuOpen(false);
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
      `}</style>

      <div className="relative z-10">
        {/* ── MOBILE HERO (ONLY SMALL SCREENS) ── */}
        <div className="block lg:hidden w-full bg-white pt-16 pb-4 px-4 text-center">
          <div className="flex flex-col items-center justify-center">
            {/* Logo */}
            <img
              src={logoImage}
              alt="Exegesis"
              className="w-32 h-auto object-contain mb-3"
            />

            {/* Bible Text */}
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-brand-primary leading-[0.95] tracking-tighter break-words mt-1 border-1 border-t">
              Search The
              <span className="block text-brand-accent">Scriptures Daily</span>
            </h1>
          </div>
        </div>
        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="w-full px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
              {/* Logo */}
              <div className="items-center gap-2 sm:gap-3 hidden sm:flex">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-brand-bg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img
                    src={logoImage}
                    alt="Exegesis"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-base sm:text-xl font-black text-brand-primary font-[family-name:var(--font-heading)] tracking-tighter">
                  EXEGESIS
                </span>
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-2 xl:gap-4 absolute left-1/2 -translate-x-1/2">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleMenuClick(item.href)}
                    className="px-3 py-2 text-[10px] font-black text-slate-500 hover:text-brand-primary hover:bg-brand-bg rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:flex items-center gap-4">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-slate-500 hover:text-brand-primary font-black uppercase tracking-widest text-[10px]"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark font-black px-6 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile: sign in + hamburger */}
              {/* Mobile nav */}
              <div className="flex lg:hidden items-center justify-between w-full">
                {/* Left: Menu */}
                <button
                  className="p-2 text-brand-primary hover:bg-slate-50 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Right: Sign In */}
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-primary font-black text-xs uppercase tracking-wider px-3 py-2"
                  >
                    Sign In
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
                    Menu
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
                  {menuItems.map((item) => (
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
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 space-y-3 bg-brand-bg/50">
                <Link
                  to="/login"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-brand-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-primary/20 text-base uppercase tracking-widest">
                    Get Started
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
          className=" sm:pt-28 lg:pt-36 pb-12 sm:pb-20 lg:pb-28 bg-brand-bg overflow-x-hidden"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
              {/* LEFT */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col space-y-5 sm:space-y-8 text-center lg:text-left w-full max-w-full"
              >
               

                {/* Heading */}

                {/* Paragraph */}
                <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0 text-center lg:text-left break-words">
                  Exegesis is the process of carefully studying Scripture to
                  discover the original meaning in its historical and literary
                  context.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2 w-full">
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button className="w-full bg-brand-accent text-white text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-[2rem] font-black shadow-2xl shadow-brand-accent/30 hover:bg-brand-accent-dark hover:scale-105 transition-all uppercase tracking-widest">
                      Start Your Journey
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10 pt-4 sm:pt-8 flex-wrap">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tighter">
                      31K+
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Holy Verses
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-10 bg-slate-200" />

                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tighter">
                      66
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Sacred Books
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-10 bg-slate-200" />

                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tighter">
                      150+
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Explanations
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT CARD */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full max-w-full"
              >
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(57,98,132,0.15)] border border-slate-100 relative z-10 w-full">
                  <div className="flex items-center gap-3 mb-5 sm:mb-8">
                    <div className="w-2.5 h-2.5 sm:w-3 rounded-full bg-brand-accent animate-pulse" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Today's Word
                    </span>
                  </div>

                  {verseLoading ? (
                    <div className="space-y-4">
                      <div className="h-6 sm:h-8 bg-brand-bg rounded-2xl animate-pulse" />
                      <div className="h-6 sm:h-8 bg-brand-bg rounded-2xl animate-pulse w-4/5" />
                      <div className="h-4 sm:h-5 bg-brand-bg rounded-2xl animate-pulse w-1/3 mt-4" />
                    </div>
                  ) : dailyVerse ? (
                    <>
                      <blockquote className="text-xl sm:text-2xl md:text-3xl font-black text-brand-primary leading-tight mb-6 sm:mb-8 italic tracking-tight break-words">
                        "
                        {getVerseText(
                          dailyVerse.bookName,
                          dailyVerse.chapter,
                          dailyVerse.verseNumber,
                        )}
                        "
                      </blockquote>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-brand-accent text-base sm:text-lg md:text-xl font-black tracking-tighter">
                            {dailyVerse.bookName} {dailyVerse.chapter}:
                            {dailyVerse.verseNumber}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Holy Bible
                          </span>
                        </div>

                        <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-slate-300 hover:text-brand-accent hover:bg-brand-accent/10 transition-all">
                          <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400 text-base font-bold">
                      Seeking inspiration...
                    </p>
                  )}
                </div>

                {/* Glow */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-accent/10 rounded-full blur-[50px] -z-10" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-[60px] -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── MOTTO BAR ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="bg-white py-8 sm:py-12 md:py-16 border-y border-slate-100"
        >
          <div className="w-[85vw] max-w-sm sm:max-w-md lg:max-w-none">
            <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-24 flex-wrap">
              {[
                { icon: ShieldCheck, label: "Quality" },
                { icon: Zap, label: "Service" },
                { icon: Globe, label: "Integrity" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-bg flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                  </div>
                  <span className="text-brand-primary font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tighter">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <div className="text-center mb-10 sm:mb-16 md:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bg border border-slate-200 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Our Services
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-5 sm:mb-8 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  Our <span className="text-brand-primary">Spirit-Led</span>{" "}
                  Features
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                  We are passionate Jesus followers dedicated to helping you
                  shine with excellence and integrity in everything you do.
                </p>
              </motion.div>
            </div>

            {/* Mobile: 1-col, Tablet: 2-col, Desktop: 3-col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  title: "Deep Biblical Exegesis",
                  icon: BookOpen,
                  desc: "Reach a deeper understanding of the Word. Discover original meanings through historical and literary context.",
                },
                {
                  title: "Daily Kingdom Insights",
                  icon: Sparkles,
                  desc: "Start each day with purpose-driven devotionals that reflect your mission and message in Christ.",
                },
                {
                  title: "Community Prayer Wall",
                  icon: HandHeart,
                  desc: "Build strong engagement and spread the Gospel through our dedicated community prayer platform.",
                },
                {
                  title: "Bible Knowledge Trivia",
                  icon: Trophy,
                  desc: "Engage with the Word right where you are. Be found searching for truth, hope, and deeper wisdom.",
                },
                {
                  title: "Spirit-Filled Growth",
                  icon: FlameKindling,
                  desc: "We walk with you every step of the way, providing tools for your calling and Kingdom impact.",
                },
                {
                  title: "Kingdom Mobile App",
                  icon: Globe,
                  desc: "Take the Word with you everywhere. Reach your community right where they are—on their phones.",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
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
            </div>
          </div>
        </section>

        {/* ── EXEGESIS DAILY ── */}
        <section
          id="exegesis-daily"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-brand-card"
        >
          <div className="w-full max-w-screen-xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14 md:mb-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-5 shadow-sm">
                  <CalendarDays className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Inspiration
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  Exegesis <span className="text-brand-primary">Daily</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-md font-medium">
                  Fresh devotional content every morning rooted in careful
                  Scripture study.
                </p>
              </motion.div>
              <Link to="/login" className="self-start lg:self-auto">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-white px-6 sm:px-8 py-5 sm:py-6 rounded-2xl font-black text-sm sm:text-base shadow-sm whitespace-nowrap"
                >
                  Explore All <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile: horizontal scroll, Desktop: grid */}
            <div className="flex lg:grid lg:grid-cols-3 gap-5 sm:gap-8 overflow-x-auto pb-4 lg:pb-0 mobile-scroll-snap -mx-4 px-4 lg:mx-0 lg:px-0">
              {devotionals.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 flex flex-col group cursor-pointer w-[80vw] sm:w-[60vw] lg:w-auto"
                >
                  <div className="flex items-center justify-between mb-5 sm:mb-8">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                      {d.date}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-brand-bg text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                      {d.tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-primary mb-1 group-hover:text-brand-accent transition-colors font-[family-name:var(--font-heading)] tracking-tight">
                    {d.title}
                  </h3>
                  <p className="text-brand-accent font-black text-base sm:text-lg tracking-tighter mb-4">
                    {d.book}
                  </p>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium line-clamp-4 italic mb-6">
                    "{d.excerpt}"
                  </p>
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center text-brand-primary font-black uppercase tracking-widest text-[10px] sm:text-xs gap-2 group-hover:gap-4 transition-all">
                    Read Devotional <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bg border border-slate-200 mb-5">
                  <HandHeart className="w-3.5 h-3.5 text-brand-accent" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Community
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  Prayer <span className="text-brand-accent">Wall</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-md font-medium">
                  Lift each other up in faith. Submit a request or stand in the
                  gap.
                </p>
              </motion.div>
              <Link to="/login" className="self-start lg:self-auto">
                <Button className="bg-brand-primary text-white px-6 sm:px-8 py-5 sm:py-6 rounded-[1.5rem] font-black text-sm sm:text-base shadow-2xl shadow-brand-primary/30 hover:bg-brand-primary-dark transition-all uppercase tracking-widest whitespace-nowrap">
                  Add Request
                </Button>
              </Link>
            </div>

            {/* Mobile: horizontal scroll cards */}
            <div className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto pb-4 lg:pb-0 mobile-scroll-snap -mx-4 px-4 lg:mx-0 lg:px-0">
              {prayers.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
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
                      Praying ({p.likes})
                    </button>
                    <Link
                      to="/login"
                      className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:underline"
                    >
                      PRAY NOW →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
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
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-5">
                  <Mic2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Testimonies
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
                  Testify & <span className="text-brand-primary">Inspire</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-md font-medium">
                  God is still writing amazing stories. Share your journey and
                  help others see His power.
                </p>
              </motion.div>
              <Link to="/login" className="self-start lg:self-auto">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-white px-6 sm:px-8 py-5 sm:py-6 rounded-2xl font-black text-sm sm:text-base shadow-sm whitespace-nowrap"
                >
                  Share Your Story <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto pb-4 lg:pb-0 mobile-scroll-snap -mx-4 px-4 lg:mx-0 lg:px-0">
              {testimonies.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 flex flex-col group relative w-[80vw] sm:w-[60vw] lg:w-auto flex-shrink-0"
                >
                  <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary/10 absolute top-6 right-6" />
                  <h3 className="text-xl sm:text-2xl font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight group-hover:text-brand-accent transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium italic mb-6">
                    "{t.story}"
                  </p>
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary font-black text-xs border border-slate-100">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tight">
                          {t.name}
                        </p>
                        <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">
                          {t.verse}
                        </p>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-slate-200 hover:text-brand-accent transition-colors cursor-pointer" />
                  </div>
                </motion.div>
              ))}
            </div>
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bg border border-slate-200 mb-5">
                <Trophy className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest">
                  Bible Challenge
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] mb-5 leading-tight tracking-tighter">
                Test Your <span className="text-brand-primary">Knowledge</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 sm:mb-14 max-w-xl mx-auto leading-relaxed font-medium">
                Grow in the Word through our interactive challenges. Hide His
                Word in your heart while having fun!
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
                    Question {triviaIndex + 1} of {triviaQuestions.length}
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
                    Score: {triviaScore}
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
                        Well done! You're growing in wisdom.
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="text-red-500 w-5 h-5" />
                        Keep studying! The Word is a lamp to your feet.
                      </span>
                    )}
                  </p>
                  <Button
                    onClick={nextTrivia}
                    className="w-full sm:w-auto bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-5 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-brand-primary/20 uppercase tracking-widest"
                  >
                    Next Challenge
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
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-5">
                  <Users className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest">
                    Our Calling
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-[family-name:var(--font-heading)] mb-6 leading-tight tracking-tighter">
                  Built for Kingdom{" "}
                  <span className="text-brand-primary">Impact</span>
                </h2>
                <div className="space-y-4 text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
                  <p>
                    At Exegesis, we believe your spiritual journey deserves more
                    than just a casual reading—it deserves a powerful,
                    purpose-driven digital footprint rooted in faith and fueled
                    by the Gospel.
                  </p>
                  <p>
                    We're not just another app—we're passionate Jesus followers,
                    tech experts, and creative visionaries who live to serve the
                    Lord in everything we do.
                  </p>
                  <p className="font-black text-brand-accent italic text-xl sm:text-2xl tracking-tight">
                    Quality, Service, & Integrity — Built for His Glory.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10">
                  {[
                    { stat: "31K+", label: "Verses Explored" },
                    { stat: "150+", label: "Daily Insights" },
                    { stat: "Global", label: "Kingdom Reach" },
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Rooted in Truth",
                    desc: "Every insight and explanation is grounded in sound biblical scholarship and prayer.",
                  },
                  {
                    icon: Globe,
                    title: "Global Community",
                    desc: "Pray, testify, and grow alongside believers from every corner of the world.",
                  },
                  {
                    icon: Sparkles,
                    title: "Spirit-Led Tech",
                    desc: "We use modern technology to illuminate ancient wisdom for today's generation.",
                  },
                  {
                    icon: Zap,
                    title: "Always Growing",
                    desc: "Constant updates and fresh content to keep your spiritual journey vibrant and active.",
                  },
                ].map((v, i) => (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
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
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 text-center relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-brand-card/50 -z-10" />
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-heading)] mb-6 sm:mb-8 leading-tight text-brand-primary tracking-tighter">
                Ready to Deepen Your <br className="hidden sm:block" />
                <span className="text-brand-accent">Kingdom Impact?</span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed font-medium">
                Join thousands of believers who are searching the Scriptures and
                living out their calling with excellence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button className="w-full bg-brand-primary text-white px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] font-black text-base sm:text-xl hover:bg-brand-primary-dark hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                    Start Your Journey Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-600 px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] font-black text-base sm:text-xl hover:bg-white hover:border-brand-primary hover:text-brand-primary transition-all uppercase tracking-widest"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          id="contact"
          className="bg-brand-dark pt-14 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-12 border-t border-white/5"
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
              <div className="space-y-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                    <img
                      src={logoImage}
                      alt="Exegesis"
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter">
                    EXEGESIS
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Helping you shine with excellence and integrity through the
                  power of the Word.
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-accent hover:text-white transition-all duration-300 border border-white/5"
                    >
                      <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-brand-accent font-black text-[10px] sm:text-xs mb-6 uppercase tracking-widest opacity-80">
                  Navigation
                </h4>
                <ul className="space-y-3">
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <button
                        onClick={() => handleMenuClick(item.href)}
                        className="text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-[10px] sm:text-[11px]"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-brand-accent font-black text-[10px] sm:text-xs mb-6 uppercase tracking-widest opacity-80">
                  Resources
                </h4>
                <ul className="space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-[10px] sm:text-[11px]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-brand-accent font-black text-[10px] sm:text-xs mb-6 uppercase tracking-widest opacity-80">
                  Our Motto
                </h4>
                <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 backdrop-blur-sm">
                  <p className="text-white font-black text-xl sm:text-2xl tracking-tighter uppercase italic leading-none">
                    Quality, <br />
                    Service, & <br />
                    Integrity!
                  </p>
                  <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    Built for His Glory
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                © {new Date().getFullYear()} Exegesis. Built for Kingdom Impact.
              </p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                Made with{" "}
                <Heart className="w-3.5 h-3.5 text-brand-accent fill-brand-accent" />{" "}
                for the Glory of God
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
