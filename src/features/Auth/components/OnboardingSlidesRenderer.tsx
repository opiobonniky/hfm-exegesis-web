// OnboardingSlidesRenderer — renders all slides from the SLIDES constant
import { OnboardingSlide } from "./OnboardingSlide";
import { Slide } from "../constants";

interface OnboardingSlidesRendererProps {
  slides: Slide[];
  activeIndex: number;
}

export function OnboardingSlidesRenderer({ slides, activeIndex }: OnboardingSlidesRendererProps) {
  return (
    <div className="relative w-full min-h-[70vh]">
      {slides.map((s, i) => (
        <OnboardingSlide
          key={i}
          icon={s.icon}
          title={s.title}
          subtitle={s.subtitle}
          description={s.description}
          iconBg={s.iconBg}
          iconColor={s.iconColor}
          isActive={i === activeIndex}
        />
      ))}
    </div>
  );
}
