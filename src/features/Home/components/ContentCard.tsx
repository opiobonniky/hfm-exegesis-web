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
          {title && <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em]">{title}</h2>}
          {cta && onCta && (
            <button onClick={onCta} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">{cta}</button>
          )}
        </div>
      )}
      <button
        onClick={onClick}
        className={cn(
          "w-full text-start p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all",
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
      </button>
    </section>
  );
