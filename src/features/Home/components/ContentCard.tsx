"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  cta?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onCta?: () => void;
}

export default function ContentCard({ title, subtitle, cta, children, className, onClick, onCta }: ContentCardProps) {
  return (
    <section>
      {(title || cta) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>}
          {cta && onCta && (
            <button onClick={onCta} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">{cta}</button>
          )}
        </div>
      )}
      <button
        onClick={onClick}
        className={cn(
          "w-full rounded-2xl border border-primary/10 bg-gradient-to-br from-white via-white to-primary/[0.05] p-4 text-start shadow-sm shadow-primary/[0.04] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md dark:from-card dark:via-card dark:to-primary/[0.08]",
          !onClick && "cursor-default",
          className,
        )}
      >
        {children}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {subtitle && <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>}
          </div>
          {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
        </div>
      </button>
    </section>
  );
}
