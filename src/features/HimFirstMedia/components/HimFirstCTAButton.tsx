/**
 * HimFirstCTAButton — styled CTA button for HimFirstMedia pages.
 * Pages just pass text + href — all styling is here.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface HimFirstCTAButtonProps {
  to: string;
  children: ReactNode;
}

export function HimFirstCTAButton({ to, children }: HimFirstCTAButtonProps) {
  return (
    <Link to={to}>
      <button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest inline-flex items-center gap-2 transition-all">
        {children} <ArrowRight className="ml-2 w-5 h-5" />
      </button>
    </Link>
  );
}
