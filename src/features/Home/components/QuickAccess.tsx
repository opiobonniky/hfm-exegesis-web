"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface QuickAccessItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  onPress?: () => void;
}
interface QuickAccessProps {
  title?: string;
  items: QuickAccessItem[];
export default function QuickAccess({ title, items }: QuickAccessProps) {
  return (
    <div>
      {title && (
        <p className="text-[15px] font-extrabold text-foreground mb-2 px-1">
          {title}
        </p>
      )}
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onPress}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3",
                "hover:shadow-md hover:border-primary/30 transition-all duration-200",
                "active:scale-95",
              )}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.color + "1A" }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-foreground text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
