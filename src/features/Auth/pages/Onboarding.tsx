import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import { useOnboardingPage } from "../hooks/useOnboardingPage";
import { SLIDES, completeOnboarding } from "../constants";
import {
  OnboardingSlide, OnboardingLayout, OnboardingTopBar,
  OnboardingSlideArea, OnboardingBottomControls, OnboardingBranding, OnboardingControls,
} from "../components";

export default function OnboardingPage() {
  const { slide, goNext, goPrev } = useOnboardingPage();
  const totalSlides = SLIDES.length;
  const isFirst = slide === 0;
  const isLast = slide === totalSlides - 1;
  const current = SLIDES[slide];

  return (
    <OnboardingLayout gradient={current.bgGradient}>
      <OnboardingTopBar>
        {!isFirst ? (
          <button onClick={goPrev} className="flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
        ) : (<></>)}
        {!isLast && (
          <button onClick={() => { completeOnboarding(); window.location.href = routes.register.path; }}
            className="text-sm font-semibold text-white/40 hover:text-white/70 transition-colors">
            Skip
          </button>
        )}
      </OnboardingTopBar>

      <OnboardingSlideArea>
        {SLIDES.map((s, i) => (
          <OnboardingSlide key={i} icon={s.icon} title={s.title} subtitle={s.subtitle}
            description={s.description} iconBg={s.iconBg} iconColor={s.iconColor} isActive={i === slide} />
        ))}
      </OnboardingSlideArea>

      <OnboardingBottomControls>
        <OnboardingControls total={totalSlides} current={slide}>
          <Button onClick={goNext} className={cn(
            "w-full h-14 text-base font-bold gap-2 rounded-2xl transition-all active:scale-[0.98]",
            "bg-card text-gray-900 hover:bg-card/90 hover:shadow-xl", "shadow-lg shadow-black/20",
          )}>
            {isLast ? (
              <><Sparkles className="w-5 h-5" />Create Account</>
            ) : (
              <>Continue<ChevronRight className="w-5 h-5" /></>
            )}
          </Button>
          {(isFirst || isLast) && (
            <button onClick={() => { completeOnboarding(); window.location.href = routes.login.path; }}
              className="w-full text-sm font-semibold text-white/50 hover:text-white/80 transition-colors py-2">
              {isFirst ? "I already have an account" : "Sign in instead"}
            </button>
          )}
        </OnboardingControls>
        <OnboardingBranding />
      </OnboardingBottomControls>
    </OnboardingLayout>
  );
}
