import { ChevronLeft } from "lucide-react";
import { AuthLoadingSpinner } from "./AuthLoadingSpinner";

interface RegisterStepButtonsProps {
  backLabel: string;
  submitLabel: string;
  isLoading: boolean;
  onBack: () => void;
}

export function RegisterStepButtons({ backLabel, submitLabel, isLoading, onBack }: RegisterStepButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onBack}
        className="h-12 px-6 rounded-2xl border border-border font-bold text-sm flex items-center gap-2 hover:bg-muted transition-all"
      >
        <ChevronLeft className="w-4 h-4" />{backLabel}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {isLoading ? <AuthLoadingSpinner size="sm" /> : submitLabel}
      </button>
    </div>
  );
}
