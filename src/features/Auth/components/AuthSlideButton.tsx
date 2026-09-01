/**
 * AuthSlideButton — slide navigation button for Onboarding.
 * Replaces raw <button className="..."> in pages.
 */
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      {isLast ? (
        <><Sparkles className="w-5 h-5" />Create Account</>
      ) : (
        <>Continue<ChevronRight className="w-5 h-5" /></>
      )}
    </Button>
  );
}
