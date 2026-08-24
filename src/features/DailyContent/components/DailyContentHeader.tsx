// DailyContentHeader — reusable header for daily content admin pages
import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function DailyContentHeader({ title, subtitle, action }: Props) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background to-background border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground/80">{subtitle}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
