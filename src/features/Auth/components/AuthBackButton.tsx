/**
 * AuthBackButton — back navigation button for Auth pages.
 * Replaces raw <button className="..."> in pages.
 */
import { ChevronLeft } from "lucide-react";

interface AuthBackButtonProps {
  onClick: () => void;
  label?: string;
}

export function AuthBackButton({ onClick, label = "Back" }: AuthBackButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white transition-colors">
      <ChevronLeft className="w-4 h-4" />{label}
    </button>
  );
}
