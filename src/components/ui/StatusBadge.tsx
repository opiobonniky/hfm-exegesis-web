"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground border-primary",
  secondary: "bg-secondary text-secondary-foreground border-secondary",
  destructive: "bg-destructive text-destructive-foreground border-destructive",
  outline: "text-foreground border-border",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
