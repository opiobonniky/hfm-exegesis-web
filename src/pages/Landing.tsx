import { Link, useNavigate } from "react-router-dom";
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
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    if (!authLoading && userInfo) {
      navigate("/dashboard", { replace: true });
    }
  }, [userInfo, authLoading, navigate]);

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setVerseLoading(true);
        const response = await sendPostRequest("bible", "get-todays-verse", {});
        if (response.returnCode === 200 && response.returnData) {
          setDailyVerse(response.returnData);
        }
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
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileMenuOpen]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <Loader2 className="w-10 h-10 animate-spin text-[#f4a620]" />
      </div>
    );
  }

  const handleMenuClick = (href: string) => {
    // close mobile menu if open
    setMobileMenuOpen(false);

    // if it's an anchor, scroll smoothly to the section
    if (href.startsWith("#")) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    // otherwise navigate normally
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
    // clear animation state after a short delay so repeated answers animate
    setTimeout(() => setResultAnim(null), 900);
  };

  const nextTrivia = () => {
    setTriviaSelected(null);
    setTriviaIndex((i) => (i + 1) % triviaQuestions.length);
  };

  const currentQ = triviaQuestions[triviaIndex];

  return (
    <div className="w-full bg-[#1a1a2e] text-white">
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
      `}</style>
      {/* Background video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=80"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-clouds-and-blue-sky-1567/1080p.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/90 via-[#1a1a2e]/80 to-[#1a1a2e]/95" />
      </div>

      <div className="relative z-10">
        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/10">
          <div className=" mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img
                    src={logoImage}
                    alt="Exegesis"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg md:text-xl font-bold text-white font-[family-name:var(--font-heading)]">
                  Exegesis
                </span>
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-0.5">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleMenuClick(item.href)}
                    className="px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-[#f4a620] text-[#1a1a2e] hover:bg-[#f4a620]/90 font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-[#1a1a2e]/95 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                ref={menuPanelRef}
                className="absolute top-0 left-0 right-0 z-41 bg-[#1a1a2e] border-t border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-4 space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-white">Menu</span>
                    <button
                      className="p-2 text-white hover:bg-white/10 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleMenuClick(item.href)}
                      className="flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors text-left hover:scale-[1.01]"
                      style={{
                        background: hexToRgba(
                          item.mobileColor || "#f4a620",
                          0.04,
                        ),
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: hexToRgba(
                            item.mobileColor || "#f4a620",
                            0.12,
                          ),
                        }}
                      >
                        <item.icon
                          className="w-5 h-5"
                          style={{ color: item.mobileColor }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-white/40 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </button>
                  ))}

                  <div className="pt-4 space-y-2 border-t border-white/10 mt-2">
                    <Link
                      to="/login"
                      className="block w-full text-center py-3 bg-[#f4a620] text-[#1a1a2e] rounded-lg font-semibold mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section
          id="home"
          className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-12"
        >
          <div className="px-10 mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6 md:space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 w-fit">
                  <Sparkles className="w-4 h-4 text-[#f4a620]" />
                  <span className="text-sm text-white/90">
                    Discover deeper meaning
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Search The
                  <span className="block text-[#f4a620]">Scriptures Daily</span>
                </h1>

                <p className="text-lg md:text-xl text-white/80 max-w-xl">
                  Exegesis is the process of carefully studying Scripture to
                  discover the original meaning in its historical and literary
                  context.
                </p>

                <div className="flex items-center gap-6 md:gap-8 pt-2">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      31K+
                    </div>
                    <div className="text-xs md:text-sm text-white/60">
                      Verses
                    </div>
                  </div>
                  <div className="h-8 md:h-12 w-px bg-white/20" />
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      66
                    </div>
                    <div className="text-xs md:text-sm text-white/60">
                      Books
                    </div>
                  </div>
                  <div className="h-8 md:h-12 w-px bg-white/20" />
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      150+
                    </div>
                    <div className="text-xs md:text-sm text-white/60">
                      Explanations
                    </div>
                  </div>
                </div>

                {/* CTA moved below so it sits centered at the bottom of the hero */}
              </div>

              {/* Desktop: Today's verse card */}
              <div className="hidden lg:flex justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#f4a620] animate-pulse" />
                    <span className="text-sm text-white/70">Today's Verse</span>
                  </div>
                  {verseLoading ? (
                    <div className="space-y-3">
                      <div className="h-6 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 bg-white/10 rounded w-4/5 animate-pulse" />
                    </div>
                  ) : dailyVerse ? (
                    <>
                      <blockquote className="text-xl lg:text-2xl text-white leading-relaxed mb-6">
                        "
                        {getVerseText(
                          dailyVerse.bookName,
                          dailyVerse.chapter,
                          dailyVerse.verseNumber,
                        )}
                        "
                      </blockquote>
                      <div className="flex justify-between items-center">
                        <span className="text-[#f4a620] font-medium">
                          {dailyVerse.bookName} {dailyVerse.chapter}:
                          {dailyVerse.verseNumber}
                        </span>
                        <Heart className="w-5 h-5 text-white/50 hover:text-[#f4a620] cursor-pointer" />
                      </div>
                    </>
                  ) : (
                    <p className="text-white/60 text-sm">No verse scheduled</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/login" className="w-full sm:w-auto">
                <Button className="bg-[#f4a620] text-[#1a1a2e] text-base md:text-lg px-8 md:px-10 py-4 md:py-5 font-semibold shadow-lg">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile: Today's verse */}
        <section className="lg:hidden px-4 pb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#f4a620] animate-pulse" />
              <span className="text-sm text-white/70">Today's Verse</span>
            </div>
            {verseLoading ? (
              <div className="space-y-3">
                <div className="h-5 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-3/5 animate-pulse" />
              </div>
            ) : dailyVerse ? (
              <>
                <blockquote className="text-lg text-white leading-relaxed mb-4">
                  "
                  {getVerseText(
                    dailyVerse.bookName,
                    dailyVerse.chapter,
                    dailyVerse.verseNumber,
                  )}
                  "
                </blockquote>
                <div className="flex justify-between items-center">
                  <span className="text-[#f4a620] font-medium text-sm">
                    {dailyVerse.bookName} {dailyVerse.chapter}:
                    {dailyVerse.verseNumber}
                  </span>
                  <Heart className="w-5 h-5 text-white/50" />
                </div>
              </>
            ) : (
              <p className="text-white/60 text-sm">No verse scheduled</p>
            )}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          className="px-4 sm:px-6 lg:px-12 py-12 md:py-16 bg-[#1a1a2e]/80 backdrop-blur-sm"
        >
          <div className="mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
                Everything You Need for{" "}
                <span className="text-[#f4a620]">Deeper Study</span>
              </h2>
              <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
                Our comprehensive tools help you understand, apply, and live out
                Scripture every day.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Verse Explanations",
                  emoji: "📚",
                  desc: "In-depth analysis including historical context, word studies, and cross-references for deeper understanding.",
                },
                {
                  title: "Exegesis Insights",
                  emoji: "✨",
                  desc: "Discover how to apply ancient wisdom to modern life with actionable insights and reflections.",
                },
                {
                  title: "Daily Inspiration",
                  emoji: "✝️",
                  desc: "Start each day with a carefully selected verse and reflection to guide your spiritual journey.",
                },
              ].map((f) => (
                <div key={f.title} className="group">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-full border border-white/10 hover:border-[#f4a620]/50 transition-all duration-300">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#f4a620]/20 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#f4a620]/30 transition-colors">
                      <span className="text-2xl">{f.emoji}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-3 font-[family-name:var(--font-heading)]">
                      {f.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm md:text-base">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXEGESIS DAILY ── */}
        <section
          id="exegesis-daily"
          className="px-4 sm:px-6 lg:px-12 py-14 md:py-20"
        >
          <div className=" mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4a620]/20 border border-[#f4a620]/30 mb-3">
                  <CalendarDays className="w-4 h-4 text-[#f4a620]" />
                  <span className="text-xs text-[#f4a620] font-medium">
                    Daily Devotionals
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                  Exegesis <span className="text-[#f4a620]">Daily</span>
                </h2>
                <p className="text-white/60 mt-2 max-w-lg">
                  Fresh devotional content every morning rooted in careful
                  Scripture study.
                </p>
              </div>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-white/20 text-primary hover:bg-white/10 whitespace-nowrap"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {devotionals.map((d) => (
                <div
                  key={d.title}
                  className="bg-white/5 border border-white/10 hover:border-[#f4a620]/40 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{d.date}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#f4a620]/20 text-[#f4a620] font-medium">
                      {d.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-[#f4a620] transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-[#f4a620] text-sm font-medium mb-3">
                      {d.book}
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                      {d.excerpt}
                    </p>
                  </div>
                  <div className="mt-auto pt-2">
                    <Link
                      to="/login"
                      className="text-sm text-[#f4a620] hover:underline inline-flex items-center gap-1"
                    >
                      Read full devotional <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRAYER WALL ── */}
        <section
          id="prayer-wall"
          className="px-4 sm:px-6 lg:px-12 py-14 md:py-20 bg-[#1a1a2e]/80 backdrop-blur-sm"
        >
          <div className=" mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4a620]/20 border border-[#f4a620]/30 mb-3">
                  <HandHeart className="w-4 h-4 text-[#f4a620]" />
                  <span className="text-xs text-[#f4a620] font-medium">
                    Community
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                  Prayer <span className="text-[#f4a620]">Wall</span>
                </h2>
                <p className="text-white/60 mt-2 max-w-lg">
                  Lift each other up. Submit a request or pray for someone right
                  now.
                </p>
              </div>
              <Link to="/login">
                <Button className="bg-[#f4a620] text-[#1a1a2e] font-semibold hover:bg-[#f4a620]/90 whitespace-nowrap">
                  Add Prayer Request
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {prayers.map((p) => (
                <div
                  key={p.name}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4a620]/20 flex items-center justify-center text-[#f4a620] font-bold text-sm shrink-0">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-white/40 text-xs">
                        {p.location} · {p.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {p.request}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button className="flex items-center gap-2 text-xs text-white/50 hover:text-[#f4a620] transition-colors">
                      <HandHeart className="w-4 h-4" />
                      <span>Praying ({p.likes})</span>
                    </button>
                    <Link
                      to="/login"
                      className="text-xs text-[#f4a620] hover:underline"
                    >
                      Pray with them →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-white/40 text-sm mt-8">
              "Bear one another's burdens, and so fulfill the law of Christ." —
              Galatians 6:2
            </p>
          </div>
        </section>

        {/* ── TESTIFY ── */}
        <section id="testify" className="px-4 sm:px-6 lg:px-12 py-14 md:py-20">
          <div className=" mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4a620]/20 border border-[#f4a620]/30 mb-3">
                  <Mic2 className="w-4 h-4 text-[#f4a620]" />
                  <span className="text-xs text-[#f4a620] font-medium">
                    Testimonies
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                  Testify
                </h2>
                <p className="text-white/60 mt-2 max-w-lg">
                  God is still writing stories. Share yours and inspire
                  thousands.
                </p>
              </div>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-white/20 text-primary hover:bg-white/10 whitespace-nowrap"
                >
                  Share Your Story <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonies.map((t) => (
                <div
                  key={t.name}
                  className="bg-white/5 border border-white/10 hover:border-[#f4a620]/40 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300"
                >
                  <Quote className="w-8 h-8 text-[#f4a620]/40" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t.story}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#f4a620]/20 flex items-center justify-center text-[#f4a620] font-bold text-xs">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-[#f4a620]">{t.verse}</p>
                      </div>
                    </div>
                    <Heart className="w-4 h-4 text-white/30 hover:text-[#f4a620] cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BIBLE TRIVIA ── */}
        <section
          id="bible-trivia"
          className="px-4 sm:px-6 lg:px-12 py-14 md:py-20 bg-[#1a1a2e]/80 backdrop-blur-sm"
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4a620]/20 border border-[#f4a620]/30 mb-4">
              <Trophy className="w-4 h-4 text-[#f4a620]" />
              <span className="text-xs text-[#f4a620] font-medium">
                Bible Trivia
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-3">
              Test Your <span className="text-[#f4a620]">Knowledge</span>
            </h2>
            <p className="text-white/60 mb-10">
              A quick taste of what awaits inside. How well do you know the
              Word?
            </p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-white/40">
                  Question {triviaIndex + 1} of {triviaQuestions.length}
                </span>
                <span className="relative text-xs px-3 py-1 rounded-full bg-[#f4a620]/20 text-[#f4a620] font-medium inline-flex items-center">
                  Score: {triviaScore}
                  {showScorePulse && (
                    <span className="absolute -top-3 right-0 text-xs text-green-200 score-pulse">
                      +1
                    </span>
                  )}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-8 text-white">
                {currentQ.question}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {currentQ.options.map((opt) => {
                  const isSelected = triviaSelected === opt;
                  const isCorrect = opt === currentQ.answer;
                  let cls =
                    "py-4 px-5 rounded-xl border text-sm font-medium transition-all duration-300 text-left transform ";
                  if (!triviaSelected) {
                    cls +=
                      "border-white/20 text-white hover:border-[#f4a620] hover:bg-[#f4a620]/10 cursor-pointer hover:scale-105";
                  } else if (isCorrect) {
                    cls +=
                      "border-green-400/60 bg-green-400/20 text-green-300 scale-105 shadow-lg";
                  } else if (isSelected) {
                    cls +=
                      "border-red-400/60 bg-red-400/20 text-red-300 animate-shake";
                  } else {
                    cls += "border-white/10 text-white/30 opacity-70";
                  }

                  return (
                    <button
                      key={opt}
                      className={cls}
                      onClick={() => handleTriviaAnswer(opt)}
                      aria-pressed={isSelected}
                    >
                      <span className="inline-block align-middle">{opt}</span>
                      {isCorrect && triviaSelected && (
                        <span className="ml-2 inline-block text-green-300 fade-in-up">
                          ✓
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="ml-2 inline-block text-red-300 fade-in-up">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {triviaSelected && (
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                  <p className="text-white/60 text-sm flex-1 text-left fade-in-up">
                    {triviaSelected === currentQ.answer ? (
                      <>
                        <span className="mr-2">🎉</span>
                        <span className="font-semibold text-white">
                          Correct!
                        </span>
                        <span className="ml-2 text-white/60">Well done.</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-white">
                          Incorrect.
                        </span>
                        <span className="ml-2 text-white/60">
                          The correct answer is "{currentQ.answer}".
                        </span>
                      </>
                    )}
                  </p>
                  <button
                    onClick={nextTrivia}
                    className="text-sm font-semibold text-[#f4a620] hover:underline whitespace-nowrap"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </div>

            <p className="text-white/40 text-sm mt-6">
              Hundreds more questions await inside the full app.
            </p>
            <Link to="/login" className="inline-block mt-4">
              <Button className="bg-[#f4a620] text-[#1a1a2e] font-semibold hover:bg-[#f4a620]/90">
                Play Full Trivia
              </Button>
            </Link>
          </div>
        </section>

        {/* ── ABOUT US ── */}
        <section id="about" className="px-4 sm:px-6 lg:px-12 py-14 md:py-20">
          <div className=" mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4a620]/20 border border-[#f4a620]/30 mb-4">
                  <Users className="w-4 h-4 text-[#f4a620]" />
                  <span className="text-xs text-[#f4a620] font-medium">
                    About Us
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-6">
                  Built for Those Who{" "}
                  <span className="text-[#f4a620]">Hunger for the Word</span>
                </h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    Exegesis was born out of a simple conviction: every believer
                    deserves more than a surface-level reading of Scripture. We
                    believe the Bible is living, active, and inexhaustibly deep.
                  </p>
                  <p>
                    Our team of theologians, developers, and creatives built
                    this platform to make rigorous biblical scholarship
                    accessible to everyone—whether you're a new believer or a
                    seminary graduate.
                  </p>
                  <p>
                    Rooted in faith, driven by community, and guided by the
                    Spirit. That's who we are.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-6 mt-8">
                  {[
                    { stat: "50K+", label: "Community members" },
                    { stat: "150+", label: "Devotionals written" },
                    { stat: "12+", label: "Countries reached" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-bold text-[#f4a620]">
                        {s.stat}
                      </p>
                      <p className="text-xs text-white/50 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: BookOpen,
                    title: "Rooted in Truth",
                    desc: "Every devotional and explanation is grounded in sound biblical scholarship.",
                  },
                  {
                    icon: HandHeart,
                    title: "Community First",
                    desc: "Pray, testify, and grow alongside thousands of believers worldwide.",
                  },
                  {
                    icon: Sparkles,
                    title: "Spirit-Led",
                    desc: "We believe the Holy Spirit illuminates Scripture for every sincere seeker.",
                  },
                  {
                    icon: FlameKindling,
                    title: "Always Growing",
                    desc: "New content, trivia, and features released weekly by our dedicated team.",
                  },
                ].map((v) => (
                  <div
                    key={v.title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >
                    <v.icon className="w-6 h-6 text-[#f4a620] mb-3" />
                    <h4 className="font-bold text-sm mb-1">{v.title}</h4>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-4 sm:px-6 lg:px-12 py-12 md:py-16 bg-[#1a1a2e]/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-heading)] mb-4 md:mb-6">
              Ready to Go <span className="text-[#f4a620]">Deeper?</span>
            </h2>
            <p className="text-white/70 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of believers who are transforming their Bible study
              experience. Start your journey today.
            </p>
            <Link to="/login">
              <Button
                size="lg"
                className="bg-[#f4a620] hover:bg-[#f4a620]/90 text-[#1a1a2e] text-base md:text-lg px-8 md:px-12 py-4 md:py-6 font-semibold w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── BLOG / ARTICLES ── */}
        <section className="px-4 sm:px-6 lg:px-12 py-14 md:py-20">
          <div className=" mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-3">
                From Our <span className="text-[#f4a620]">Blog</span>
              </h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Articles, reflections, and theology written to challenge and
                encourage you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tag: "Theology",
                  title: "What Does It Really Mean to Fear God?",
                  excerpt:
                    "The Hebrew concept of yirat Adonai is far richer than simple terror. It's an awe that draws you closer—not drives you away.",
                  readTime: "5 min read",
                  date: "Apr 10, 2026",
                },
                {
                  tag: "Discipleship",
                  title: "How to Build a Bible Study Habit That Sticks",
                  excerpt:
                    "Most people quit within 21 days. Here are five scripture-anchored practices that have helped thousands remain consistent.",
                  readTime: "4 min read",
                  date: "Apr 7, 2026",
                },
                {
                  tag: "History",
                  title: "The Dead Sea Scrolls and Why They Matter",
                  excerpt:
                    "Discovered in 1947, these ancient manuscripts confirmed the remarkable accuracy of the Old Testament text across millennia.",
                  readTime: "7 min read",
                  date: "Apr 3, 2026",
                },
              ].map((post) => (
                <article
                  key={post.title}
                  className="bg-white/5 border border-white/10 hover:border-[#f4a620]/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group"
                >
                  <div className="h-40 bg-gradient-to-br from-[#f4a620]/20 to-white/5 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-[#f4a620]/40" />
                  </div>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[#f4a620]/20 text-[#f4a620] font-medium">
                        {post.tag}
                      </span>
                      <span className="text-xs text-white/30">{post.date}</span>
                    </div>
                    <h3 className="font-bold text-base group-hover:text-[#f4a620] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
                      <span className="text-xs text-white/30">
                        {post.readTime}
                      </span>
                      <Link
                        to="/login"
                        className="text-xs text-[#f4a620] hover:underline inline-flex items-center gap-1"
                      >
                        Read more <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-white/20 text-primary hover:bg-white/10"
                >
                  Browse All Articles <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          id="contact"
          className="px-4 sm:px-6 lg:px-12 py-8 md:py-12 border-t border-white/10 bg-[#1a1a2e]/95"
        >
          <div className=" mx-auto">
            {/* Top grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-[#f4a620]" />
                  <span className="font-bold text-white">Exegesis</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  Helping believers go deeper into Scripture since 2024.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-white">
                  Explore
                </h4>
                <ul className="space-y-2">
                  {menuItems.slice(0, 4).map((m) => (
                    <li key={m.label}>
                      <button
                        onClick={() => handleMenuClick(m.href)}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {m.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-white">More</h4>
                <ul className="space-y-2">
                  {menuItems.slice(4).map((m) => (
                    <li key={m.label}>
                      <button
                        onClick={() => handleMenuClick(m.href)}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {m.label}
                      </button>
                    </li>
                  ))}
                  {footerLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-white">
                  Contact
                </h4>
                <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                  <MailIcon className="w-4 h-4 text-[#f4a620] shrink-0" />
                  <span>contact@exegesis.com</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-sm text-white/70 hover:bg-[#f4a620] hover:text-[#1a1a2e] transition-colors font-medium"
                    >
                      <s.icon className="w-4 h-4" />
                      <span>{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-white/10">
              <p className="text-xs text-white/30 mb-2">
                © 2026 All rights reserved. Built with faith for deeper study.
              </p>
              <a
                href="https://himfirstmedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/30 hover:text-[#f4a620] transition-colors"
              >
                Powered by Him First Media Group
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
