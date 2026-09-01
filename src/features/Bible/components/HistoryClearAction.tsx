import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  visible: boolean;
  onClear: () => void;
}

export function HistoryClearAction({ visible, onClear }: Props) {
  if (!visible) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs text-destructive hover:text-destructive"
      onClick={onClear}
    >
      <Trash2 className="w-3.5 h-3.5" />
      Clear All
    </Button>
  );
}
