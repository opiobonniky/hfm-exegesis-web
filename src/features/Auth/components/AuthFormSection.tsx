/**
 * AuthFormSection — form section with heading and description.
 */
import { ReactNode } from "react";

interface AuthFormSectionProps {
  heading: string;
  description?: ReactNode;
  children: ReactNode;
}

export function AuthFormSection({ heading, description, children }: AuthFormSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">{heading}</h2>
      {description && <p className="text-sm text-muted-foreground mb-6">{description}</p>}
      {children}
    </div>
  );
}
