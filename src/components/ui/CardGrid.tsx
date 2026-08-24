"use client";

import { cn } from "@/lib/utils";

interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: string;
  className?: string;
}

/**
 * Reusable responsive card grid.
 * Provides consistent grid layout across features.
 */
export function CardGrid({ children, columns = 3, gap = "gap-3", className }: CardGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];
  return <div className={cn("grid", gridClass, gap, className)}>{children}</div>;
}

/**
 * Clickable card wrapper with hover effects.
 */
export function ClickableCard({
  children, onClick, active, className,
}: { children: React.ReactNode; onClick?: () => void; active?: boolean; className?: string }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.99]",
        active && "ring-2 ring-primary bg-primary/[0.03]",
        className,
      )}
    >
      {children}
    </div>
  );
}
