import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── ResourceCard ──────────────────────────────────────────────────────────

export function ResourceCard({
  children,
  accentColor,
  className,
  onClick,
}: {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "rounded-xl bg-card border border-border p-4 shadow-sm",
        accentColor && `border-t-[2.5px]`,
        onClick && "w-full text-left cursor-pointer hover:bg-muted/50 active:scale-[0.99] transition-all",
        className,
      )}
      style={accentColor ? { borderTopColor: accentColor } : undefined}
    >
      {children}
    </Comp>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────

export function SectionLabel({
  icon,
  label,
  color,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}14` }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          color,
          strokeWidth: 2.2,
          className: "w-3.5 h-3.5",
        })}
      </div>
      <span className="text-sm font-bold text-foreground flex-1 tracking-tight">
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <div
          className="px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}12` }}
        >
          <span className="text-[11px] font-extrabold" style={{ color }}>
            {count}
          </span>
        </div>
      )}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="py-8 flex flex-col items-center text-center">
      {icon && (
        <div className="w-10 h-10 mb-3 text-muted-foreground">{icon}</div>
      )}
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
}

// ── ShowMoreButton ────────────────────────────────────────────────────────

export function ShowMoreButton({
  remaining,
  batch,
  onPress,
}: {
  remaining: number;
  batch: number;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className="flex items-center justify-center gap-1 py-2.5 mt-1 w-full text-xs font-bold text-primary hover:text-primary/80 transition-colors"
    >
      Show {Math.min(batch, remaining)} more
      <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
    </button>
  );
}
