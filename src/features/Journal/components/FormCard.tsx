import { type ComponentType, type ReactNode } from "react";

interface Props {
  title: string;
  icon: ComponentType<{ className?: string }>;
  subtitle?: string;
  children: ReactNode;
}

export function FormCard({ title, icon: Icon, subtitle, children }: Props) {
  return (
    <div className="rounded-2xl border border-border dark:border-stone-800 bg-card dark:bg-stone-900/80 p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-4 pb-4 border-b border-border/50 dark:border-stone-800/60">
        <div className="w-10 h-10 rounded-xl bg-muted dark:bg-stone-800 flex items-center justify-center shrink-0 ring-1 ring-stone-200/50 dark:ring-stone-700/50">
          <Icon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground/70" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground dark:text-stone-200 leading-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
