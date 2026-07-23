// ── Onboarding ───────────────────────────────────────────────────────────────
// Welcome / onboarding flow for first-time users.
// Shows 4 slides:
//   1. The Word — clean Bible reading
//   2. The Tools — tap verses and words for Strong's
//   3. The Lab — Look, Listen, Learn, Abide workflow
//   4. The Legacy Ledger — save reflections into private journal
// Saves `onboarding_completed = true` on finish.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookText,
  Microscope,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";

const ONBOARDING_KEY = "onboarding_completed";

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
}

interface Slide {
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
  description: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
}

const SLIDES: Slide[] = [
  {
    icon: BookOpen,
    title: "The Word",
    subtitle: "Read deeply. Study clearly.",
    description:
      "Read the Bible in a clean, distraction-free space. Every translation, every chapter, every verse — always accessible.",
    bgGradient: "from-indigo-600 to-indigo-800",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  {
    icon: BookText,
    title: "The Tools",
    subtitle: "Discover the original languages",
    description:
      "Tap verses and words to discover context, Strong's definitions, cross-references, and study helps. The Bible comes alive when you understand the original meaning.",
    bgGradient: "from-violet-600 to-violet-800",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  {
    icon: Microscope,
    title: "The Lab",
    subtitle: "A guided study journey",
    description:
      "Learn to study Scripture through the 4-step Exegesis Lab: Look, Listen, Learn, and Abide. Each step draws you deeper into the Word.",
    bgGradient: "from-emerald-600 to-emerald-800",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  {
    icon: Heart,
    title: "The Legacy Ledger",
    subtitle: "Your private journal",
    description:
      "Save your reflections, prayers, and studies into your private journal. Build a lifelong archive of what God is teaching you through His Word.",
    bgGradient: "from-amber-500 to-amber-700",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
];

// ── Slide Content ───────────────────────────────────────────────────────────

function OnboardingSlide({
  slide,
  isActive,
}: {
  slide: Slide;
  isActive: boolean;
}) {
  const Icon = slide.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-8 py-12 min-h-[70vh] transition-opacity duration-500",
        isActive ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-black/20",
          slide.iconBg,
        )}
      >
        <Icon className={cn("w-12 h-12", slide.iconColor)} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-3xl font-black text-white text-center mb-2 leading-tight">
        {slide.title}
      </h2>

      {/* Subtitle */}
      <p className="text-base font-semibold text-white/70 text-center mb-6">
        {slide.subtitle}
      </p>

      {/* Description */}
      <p className="text-sm text-white/60 text-center max-w-xs leading-relaxed">
        {slide.description}
      </p>
    </div>
  );
}

// ── Dot Indicators ──────────────────────────────────────────────────────────

function DotIndicators({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i === current
              ? "w-6 h-2 bg-white"
              : "w-2 h-2 bg-white/30",
          )}
        />
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const totalSlides = SLIDES.length;
  const isFirst = slide === 0;
  const isLast = slide === totalSlides - 1;
  const current = SLIDES[slide];

  const goNext = () => {
    if (isLast) {
      completeOnboarding();
      navigate(routes.register.path, { replace: true });
      return;
    }
    setTransitioning(true);
    setSlide((s) => s + 1);
    setTimeout(() => setTransitioning(false), 300);
  };

  const goPrev = () => {
    if (isFirst) return;
    setTransitioning(true);
    setSlide((s) => s - 1);
    setTimeout(() => setTransitioning(false), 300);
  };

  const skipAll = () => {
    completeOnboarding();
    navigate(routes.register.path, { replace: true });
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-gradient-to-b transition-all duration-700",
        current.bgGradient,
      )}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        {/* Skip button (hidden on first slide) */}
        {!isFirst ? (
          <button
            onClick={goPrev}
            className="flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div /> /* Spacer */
        )}

        {/* Skip to end */}
        {!isLast && (
          <button
            onClick={skipAll}
            className="text-sm font-semibold text-white/40 hover:text-white/70 transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* ── Slide area ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {SLIDES.map((s, i) => (
          <OnboardingSlide key={i} slide={s} isActive={i === slide} />
        ))}
      </div>

      {/* ── Bottom controls ── */}
      <div className="px-6 pb-10 pt-4">
        <div className="flex items-center justify-between mb-6">
          <DotIndicators total={totalSlides} current={slide} />

          <span className="text-xs font-semibold text-white/40">
            {slide + 1} / {totalSlides}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={goNext}
            className={cn(
              "w-full h-14 text-base font-bold gap-2 rounded-2xl transition-all active:scale-[0.98]",
              "bg-white text-gray-900 hover:bg-white/90 hover:shadow-xl",
              "shadow-lg shadow-black/20",
            )}
          >
            {isLast ? (
              <>
                <Sparkles className="w-5 h-5" />
                Create Account
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {/* Show "I already have an account" on first slide and last slide */}
          {(isFirst || isLast) && (
            <button
              onClick={() => {
                completeOnboarding();
                navigate(routes.login.path, { replace: true });
              }}
              className="w-full text-sm font-semibold text-white/50 hover:text-white/80 transition-colors py-2"
            >
              {isFirst ? "I already have an account" : "Sign in instead"}
            </button>
          )}
        </div>

        {/* Footer branding */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <span className="text-[10px] font-medium text-white/30 tracking-wider uppercase">
            Exegesis Project
          </span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] text-white/30 italic">The Living Text</span>
        </div>
      </div>
    </div>
  );
}
