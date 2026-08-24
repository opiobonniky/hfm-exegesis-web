"use client";

import { type LucideIcon, BookMarked, PenLine, History, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
interface QuickLink {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  onClick?: () => void;
}
interface QuickAccessGridProps {
  links: QuickLink[];
export default function QuickAccessGrid({ links }: QuickAccessGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <button
            key={link.label}
            onClick={link.onClick}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200",
              "hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.97]",
              link.bg,
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", link.color)} />
            <span className="text-xs font-medium text-foreground/80">{link.label}</span>
          </button>
        );
      })}
    </div>
  );
