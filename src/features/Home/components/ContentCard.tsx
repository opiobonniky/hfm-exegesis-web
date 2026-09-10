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
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>}
          {cta && onCta && (
            <button onClick={onCta} className="rounded px-1 py-0.5 text-xs font-semibold text-[#946b30] hover:text-[#6f4e1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-[#d9b879]">{cta}</button>
          )}
        </div>
      )}
      <button
        onClick={onClick}
        className={cn(
          "w-full rounded-2xl border border-[#d8d2c4] bg-[#faf8f2] p-4 text-start transition-colors hover:border-[#b8ab94] hover:bg-[#f7f3ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-[#111b24] dark:hover:bg-white/5",
          !onClick && "cursor-default",
          className,
        )}
      >
        {children}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {subtitle && <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>}
          </div>
          {onClick && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 rtl:rotate-180" />}
        </div>
      </button>
    </section>
  );
}
