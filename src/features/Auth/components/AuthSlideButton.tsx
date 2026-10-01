/**
 * AuthSlideButton — slide navigation button for Onboarding.
 * Replaces raw <button className="..."> in pages.
 */
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tt } from '@/components/languages/hardcodedTranslate';

interface AuthSlideButtonProps {
  onClick: () => void;
  isLast: boolean;
}

export function AuthSlideButton({ onClick, isLast }: AuthSlideButtonProps) {
  return (
    <Button onClick={onClick} className={cn(
      "w-full h-14 text-base font-bold gap-2 rounded-2xl transition-all active:scale-[0.98]",
      "bg-card text-gray-900 hover:bg-card/90 hover:shadow-xl", "shadow-lg shadow-black/20",
    )}>
      <span className={isLast ? "inline-flex" : "invisible absolute inline-flex"} aria-hidden={!isLast}>
        <Sparkles className="w-5 h-5" />
      </span>
      <span className="grid">
        <span className={isLast ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}>{tt("Create Account")}</span>
        <span className={isLast ? "invisible col-start-1 row-start-1" : "col-start-1 row-start-1"}>{tt("Continue")}</span>
      </span>
      <span className={isLast ? "invisible absolute inline-flex" : "inline-flex"} aria-hidden={isLast}>
        <ChevronRight className="w-5 h-5" />
      </span>
    </Button>
  );
}
