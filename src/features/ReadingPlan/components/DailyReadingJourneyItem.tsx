import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Circle } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  detail: string;
  complete?: boolean;
}

export function DailyReadingJourneyItem({ icon: Icon, label, detail, complete }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/70 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      {complete === undefined ? null : complete ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-muted-foreground/35" />
      )}
    </div>
  );
}
