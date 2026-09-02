// CreatePlanButton — action button for creating a new reading plan
import { Plus } from "lucide-react";

interface CreatePlanButtonProps {
  label: string;
  onClick: () => void;
}

export function CreatePlanButton({ label, onClick }: CreatePlanButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
}
