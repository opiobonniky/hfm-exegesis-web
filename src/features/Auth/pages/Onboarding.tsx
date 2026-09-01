import { routes } from "@/components/Routes/routes";
import { useOnboardingPage } from "../hooks/useOnboardingPage";
import { SLIDES, completeOnboarding } from "../constants";
import {
  OnboardingSlideArea,
  OnboardingLayout, OnboardingTopBar,
  OnboardingBottomControls, OnboardingBranding,
  OnboardingControls, AuthBackButton, AuthSkipButton, AuthSlideButton, AuthAccountLink,
  OnboardingSlidesRenderer,
} from "../components";

export default function OnboardingPage() {
  const { slide, goNext, goPrev } = useOnboardingPage();
  const totalSlides = SLIDES.length;
  const isFirst = slide === 0;
  const isLast = slide === totalSlides - 1;

  return (
    <OnboardingLayout gradient={SLIDES[slide].bgGradient}>
      <OnboardingTopBar>
        {!isFirst && <AuthBackButton onClick={goPrev} />}
        {!isLast && <AuthSkipButton onClick={() => { completeOnboarding(); window.location.href = routes.register.path; }} />}
      </OnboardingTopBar>

      <OnboardingSlideArea>
        <OnboardingSlidesRenderer slides={SLIDES} activeIndex={slide} />
      </OnboardingSlideArea>

      <OnboardingBottomControls>
        <OnboardingControls total={totalSlides} current={slide}>
          <AuthSlideButton onClick={goNext} isLast={isLast} />
          {(isFirst || isLast) && (
            <AuthAccountLink onClick={() => { completeOnboarding(); window.location.href = routes.login.path; }}
              label={isFirst ? "I already have an account" : "Sign in instead"} />
          )}
        </OnboardingControls>
        <OnboardingBranding />
      </OnboardingBottomControls>
    </OnboardingLayout>
  );
}
