/**
 * AuthFormCard — styled card wrapper for Auth forms.
 */
import { ReactNode } from "react";

interface AuthFormCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthFormCard({ children, className }: AuthFormCardProps) {
  return (
    <div className={`bg-card rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-border/50 p-8 lg:p-10 space-y-8 relative overflow-hidden group/card ${className || ""}`}>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover/card:bg-primary/10 transition-colors duration-700" />
      {children}
    </div>
  );
}
