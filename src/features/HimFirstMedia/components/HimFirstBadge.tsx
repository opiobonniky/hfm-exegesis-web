/**
 * HimFirstBadge — badge for HimFirstMedia hero sections.
 */
import { ReactNode } from "react";

interface HimFirstBadgeProps {
  icon: ReactNode;
  label: string;
}

export function HimFirstBadge({ icon, label }: HimFirstBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
      {icon}
      <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">{label}</span>
    </div>
  );
}
