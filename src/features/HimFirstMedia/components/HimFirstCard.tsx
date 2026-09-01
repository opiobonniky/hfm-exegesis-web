/**
 * HimFirstCard — card component for HimFirstMedia list items.
 * Replaces the repeated `<div className="bg-card rounded-[1.75rem]...">` pattern.
 */
import { ReactNode } from "react";

interface HimFirstCardProps {
  children: ReactNode;
  className?: string;
}

export function HimFirstCard({ children, className }: HimFirstCardProps) {
  return (
    <div className={`bg-card rounded-[1.75rem] p-6 sm:p-8 border border-border ${className || ""}`}>
      {children}
    </div>
  );
}

/**
 * HimFirstIconBox — icon container for cards.
 */
export function HimFirstIconBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-5 shadow-sm ${className || ""}`}>
      {children}
    </div>
  );
}

/**
 * HimFirstAvatar — circular avatar with initial.
 */
export function HimFirstAvatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-20 h-20 text-2xl",
    md: "w-28 h-28 text-3xl",
    lg: "w-48 h-48 sm:w-56 sm:h-56 text-6xl",
  };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand-primary to-brand-accent shrink-0 overflow-hidden shadow-xl flex items-center justify-center`}>
      <span className={`${sizes[size].split(" ").pop()} font-black text-white`}>{initial}</span>
    </div>
  );
}
