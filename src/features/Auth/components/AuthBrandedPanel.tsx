/**
 * AuthBrandedPanel — decorative branded panel for desktop split-screen Auth pages.
 * Used by Login, ForgotPassword, VerifyAccount.
 */
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

interface Props {
  /** Quote text */
  quote?: string;
  /** Attribution for the quote */
  attribution?: string;
  /** Tagline below the logo */
  tagline?: ReactNode;
  /** Extra content below the quote */
  children?: ReactNode;
  /** RTL-aware classes */
  isRtl?: boolean;
}

export function AuthBrandedPanel({
  quote,
  attribution,
  tagline,
  children,
  isRtl,
}: Props) {
  return (
    <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-brand-dark">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
        <div
          className={cn(
            "absolute -top-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse",
            isRtl ? "-left-24" : "-right-24",
          )}
          style={{ animationDuration: "8s" }}
        />
        <div
          className={cn(
            "absolute bottom-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[80px] animate-pulse",
            isRtl ? "-right-24" : "-left-24",
          )}
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
        <div
          className="anim-fade space-y-12"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Logo */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
            <Link
              to="/"
              className="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-card/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center p-8 shadow-2xl hover:border-white/20 transition-colors"
            >
              <img
                src={logoImage}
                alt="Exegesis Logo"
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </Link>
          </div>

          {/* Text */}
          <div className="space-y-6 max-w-lg">
            {tagline && (
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                {tagline}
              </h2>
            )}
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
            {quote && (
              <blockquote className="text-xl md:text-2xl text-white/70 font-medium italic leading-relaxed">
                &ldquo;{quote}&rdquo;
              </blockquote>
            )}
            {attribution && (
              <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-sm">
                {attribution}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 start-0 w-full px-16 flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-widest anim-fade" style={{ animationDelay: "0.5s" }}>
        <span>&copy; 2026 Exegesis Bible</span>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
          <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
        </div>
      </div>
    </div>
  );
}
