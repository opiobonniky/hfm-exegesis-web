// SaveButton — action button with loading state
import { Save } from "lucide-react";

interface SaveButtonProps {
  label: string;
  loading?: boolean;
  onClick: () => void;
}

export function SaveButton({ label, loading, onClick }: SaveButtonProps) {
  return (
    <button
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
    >
      <Save className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
