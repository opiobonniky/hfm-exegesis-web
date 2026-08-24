"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatBoxProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  loading?: boolean;
}

export function StatBox({ icon: Icon, label, value, color, bg, loading }: StatBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <div
        className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p
        className="text-lg font-bold text-foreground"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {loading ? "—" : value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
        {label}
      </p>
    </div>
  );
}
