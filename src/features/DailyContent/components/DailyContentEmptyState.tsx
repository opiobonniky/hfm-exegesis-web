// DailyContentEmptyState — reusable empty state for daily content pages
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  type: string;
  onAdd: () => void;
}

export function DailyContentEmptyState({ type, onAdd }: Props) {
  return (
    <div className="relative flex flex-col items-center py-16 text-center px-4 rounded-xl border border-dashed border-border/40 bg-gradient-to-b from-muted/10 to-muted/5">
      <div className="absolute top-8 w-32 h-32 bg-primary/[0.04] rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/5 ring-1 ring-primary/10">
          <CalendarDays className="w-6 h-6 text-primary/60" />
        </div>
        <p className="font-semibold">No {type} found</p>
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">Create your first entry to get started.</p>
        <Button variant="default" size="sm" className="mt-4" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Create {type}
        </Button>
      </div>
    </div>
  );
}
