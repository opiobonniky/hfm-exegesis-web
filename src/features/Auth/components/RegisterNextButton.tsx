import { ChevronRight } from "lucide-react";

interface RegisterNextButtonProps {
  label: string;
  onClick: () => void;
}

export function RegisterNextButton({ label, onClick }: RegisterNextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
    >
      {label} <ChevronRight className="w-4 h-4" />
    </button>
  );
}
