"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface StatItem {
  value: number;
  label: string;
  icon: LucideIcon;
  color: string;
}
interface StatsRowProps {
  title?: string;
  stats: StatItem[];
export default function StatsRow({ title, stats }: StatsRowProps) {
  return (
    <div>
      {title && (
        <p className="text-[15px] font-extrabold text-foreground mb-2 px-1">
          {title}
        </p>
      )}
      <div className="flex gap-2.5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex-1 rounded-xl border border-border bg-card p-3 text-center"
            >
              <div
                className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: stat.color + "1F" }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {stat.label}
            </div>
          );
        })}
      </div>
    </div>
  );
