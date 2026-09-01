/**
 * OnboardingSlide — single slide in the onboarding carousel.
 */
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface OnboardingSlideProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  iconBg: string;
  iconColor: string;
  isActive: boolean;
}

export function OnboardingSlide({ icon: Icon, title, subtitle, description, iconBg, iconColor, isActive }: OnboardingSlideProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center px-8 py-12 min-h-[70vh] transition-opacity duration-500",
      isActive ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none",
    )}>
      <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-black/20", iconBg)}>
        <Icon className={cn("w-12 h-12", iconColor)} strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl font-black text-white text-center mb-2 leading-tight">{title}</h2>
      <p className="text-base font-semibold text-white/70 text-center mb-6">{subtitle}</p>
      <p className="text-sm text-white/60 text-center max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
