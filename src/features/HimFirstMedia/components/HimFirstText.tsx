/**
 * HimFirstText — text components for HimFirstMedia pages.
 * These render the raw HTML so pages don't have to.
 */
import { ReactNode } from "react";

interface HimFirstHeadingProps {
  children: ReactNode;
  level?: 2 | 3;
}

export function HimFirstHeading({ children, level = 2 }: HimFirstHeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";
  const className = level === 2
    ? "text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight"
    : "text-lg font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]";
  return <Tag className={className}>{children}</Tag>;
}

export function HimFirstParagraph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium ${className || ""}`}>
      {children}
    </p>
  );
}

export function HimFirstAccentText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-xl sm:text-2xl font-black text-brand-accent italic font-[family-name:var(--font-heading)] tracking-tight ${className || ""}`}>
      {children}
    </p>
  );
}

export function HimFirstSmallText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-sm font-black text-muted-foreground uppercase tracking-widest ${className || ""}`}>
      {children}
    </p>
  );
}

export function HimFirstBodyText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-base sm:text-lg text-muted-foreground leading-relaxed font-medium ${className || ""}`}>
      {children}
    </p>
  );
}

export function HimFirstCardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xl font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]">
      {children}
    </h3>
  );
}

export function HimFirstCardDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
      {children}
    </p>
  );
}

export function HimFirstCardLongDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-base text-muted-foreground leading-relaxed font-medium">
      {children}
    </p>
  );
}
