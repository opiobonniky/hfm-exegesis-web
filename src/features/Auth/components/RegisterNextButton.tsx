import { ChevronRight } from "lucide-react";

interface RegisterNextButtonProps {
  label: string;
}

export function RegisterNextButton({ label }: RegisterNextButtonProps) {
  return (
    <button
      type="submit"
      className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all"
    >
      <span>{label}</span> <ChevronRight className="w-4 h-4" />
    </button>
  );
}
