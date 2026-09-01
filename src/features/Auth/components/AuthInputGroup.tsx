/**
 * AuthInputGroup — form field group with icon.
 */
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface AuthInputGroupProps {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  htmlFor?: string;
}

export function AuthInputGroup({ label, icon: Icon, children, htmlFor }: AuthInputGroupProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        {children}
      </div>
    </div>
  );
}
