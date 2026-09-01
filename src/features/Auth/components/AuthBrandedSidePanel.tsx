/**
 * AuthBrandedSidePanel — left branding panel for Auth pages.
 */
import { ReactNode } from "react";

interface AuthBrandedSidePanelProps {
  logoSrc: string;
  logoAlt?: string;
  appName?: string;
  children: ReactNode;
}

export function AuthBrandedSidePanel({ logoSrc, logoAlt = "Exegesis", appName = "EXEGESIS", children }: AuthBrandedSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-dark">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col justify-between p-10 text-white">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt={logoAlt} className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>{appName}</span>
        </div>
        {children}
        <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} Exegesis Project</p>
      </div>
    </div>
  );
}
