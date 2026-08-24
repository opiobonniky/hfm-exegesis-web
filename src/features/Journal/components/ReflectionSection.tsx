import { type ComponentType } from "react";
import { cn } from "@/lib/utils";

interface Props {
  key: string; icon: ComponentType<{ className?: string }>; label: string;
  subtitle?: string; content: string; iconColor?: string;
}
export function ReflectionSection({ icon: Icon, label, subtitle, content, iconColor = "text-muted-foreground" }: Props) {
  return (
    <div className="rounded-2xl bg-card/70 dark:bg-stone-900/50 border border-border/70 dark:border-stone-800/70 p-6 hover:bg-card dark:hover:bg-stone-900/80 transition-colors shadow-sm">
      <div className="flex items-start gap-4 mb-4 pb-4 border-b border-border/50 dark:border-stone-800/60">
        <div className="w-10 h-10 rounded-xl bg-muted dark:bg-stone-800 flex items-center justify-center shrink-0 ring-1 ring-stone-200/50 dark:ring-stone-700/50">
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground dark:text-stone-200 leading-tight">{label}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="text-sm sm:text-base leading-[1.9] text-foreground/80 dark:text-muted-foreground/50" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        {content.split("\n").filter(Boolean).map((p, i) => <p key={i} className={i > 0 ? "mt-4" : ""}>{p}</p>)}
    </div>
  );
