// AdminFormHeader — gradient header with back + icon + title + subtitle
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onBack: () => void;
}

export function AdminFormHeader({ icon: Icon, title, subtitle, onBack }: Props) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background to-background border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="relative flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground/80">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
