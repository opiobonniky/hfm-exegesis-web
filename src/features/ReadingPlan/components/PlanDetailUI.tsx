"use client";

import { useLanguage } from "@/components/languages/languageProvider";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  CircleOff,
  ShieldCheck,
  Trophy,
} from "lucide-react";

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.18em] mb-3">
      {children}
    </p>
  );
}

export function Ring({ pct, size = 96, stroke = 7 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} style={{ rotate: "-90deg" }}>
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(148,163,184,.18)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#rg)"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (Math.min(pct, 100) / 100) * circ}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

export function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: string }) {
  return (
    <GlassCard className="p-4 hover:bg-background transition-colors">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2.5", accent)}>
        {icon}
      </div>
      <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </GlassCard>
  );
}

export function StatusBadge({ active, completed }: { active: boolean; completed: boolean | null }) {
  const { t } = useLanguage();

  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
        <Trophy className="w-3 h-3" />
        {t.readingPlan.completedLabel || "Completed"}
      </span>
    );
  }

  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-sky-200 bg-sky-50 text-sky-700">
        <ShieldCheck className="w-3 h-3" />
        {t.readingPlan.activeLabel || "Active"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-muted text-muted-foreground">
      <CircleOff className="w-3 h-3" />
      {t.common.inactive || "Inactive"}
    </span>
  );
}