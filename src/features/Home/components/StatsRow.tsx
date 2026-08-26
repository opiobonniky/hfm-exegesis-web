"use client";

import { type LucideIcon } from "lucide-react";

interface StatItem {
  value: number;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface StatsRowProps {
  title?: string;
  stats: StatItem[];
}

export default function StatsRow({ title, stats }: StatsRowProps) {
  return (
    <div>
      {title && <p className="mb-2 px-1 text-[15px] font-extrabold text-foreground">{title}</p>}
      <div className="flex gap-2.5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex-1 rounded-xl border border-border bg-card p-3 text-center">
              <div
                className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}1F` }}
              >
                <Icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {stat.value}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
